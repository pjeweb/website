<?php namespace Destiny\Twitch;

use Destiny\Chat\ChatRedisService;
use Destiny\Common\Application;
use Destiny\Common\Config;
use Destiny\Common\Exception;
use Destiny\Common\HttpClient;
use Destiny\Common\Log;
use Destiny\Common\Request;
use Destiny\Common\Service;
use Destiny\Common\Utils\FilterParams;
use Destiny\Common\Utils\FilterParamsException;
use Destiny\Common\Utils\Http;
use function GuzzleHttp\json_decode;

/**
 * @method static TwitchWebHookService instance()
 * @see https://dev.twitch.tv/docs/api/webhooks-reference/
 */
class TwitchWebHookService extends Service {

    public const API_BASE = 'https://api.twitch.tv/helix';
    public const MODE_SUBSCRIBE = 'subscribe';
    public const MODE_UNSUBSCRIBE = 'unsubscribe';
    public const MODE_DENIED = 'denied';
    public const GET_TOPIC_KEY = 'k';

    public const TOPIC_STREAM = 'topic-stream-changed';
    public const TOPIC_FOLLOW = 'topic-user-follows';
    public const TOPIC_USER_CHANGED = 'topic-user-changed';
    public const TOPIC_GAME_ANALYTICS = 'topic-game-analytics';
    public const TOPIC_EXTENSION_ANALYTICS = 'topic-extension-analytics';

    public const CACHE_KEY_PREFIX = 'twitch.stream.';
    public const CACHE_KEY_STREAM_STATUS = 'streamstatus';
    public const CACHE_KEY_ACCESS_TOKEN = 'accesstoken';

    /**
     * @see https://dev.twitch.tv/docs/api/webhooks-reference/#subscribe-tounsubscribe-from-events
     * @param string $mode subscribe|unsubscribe
     * @param string $key appended to the end of the callback url
     * @param string $topic the full url for the topic
     * @param string $userId the twitch user id
     * @param int $ttl
     * @return bool
     * @throws Exception
     */
    public function sendSubscriptionRequest(string $mode, string $key, string $topic, int $userId, int $ttl = 86400): bool {
        $conf = Config::$a['oauth_providers']['twitch'];
        $callback = Config::$a['twitch']['webhooks_callback'];
        $client = HttpClient::instance();
        $response = $client->post(self::API_BASE . '/webhooks/hub', [
            'headers' => [
                'User-Agent' => Config::userAgent(),
                'Client-ID' => $conf['client_id'],
                'Authorization' => 'Bearer ' . $this->getAppAccessToken()
            ],
            'form_params' => [
                'hub.mode' => $mode,
                'hub.callback' => $callback . '?'. self::GET_TOPIC_KEY. '=' . urlencode($key) .'&user_id=' . urlencode($userId),
                'hub.topic' => $topic,
                'hub.lease_seconds' => $ttl,
                'hub.secret' => $conf['client_secret']
            ]
        ]);
        if ($response->getStatusCode() === Http::STATUS_ACCEPTED) {
            return true;
        }
        throw new Exception('Error sending twitch webhook subscription request. ' . $response->getBody());
    }

    /**
     * @throws TwitchWebHookException
     */
    private function validateIncomingCallback(Request $request): bool {
        $conf = Config::$a['oauth_providers']['twitch'];
        // Returned as X-Hub-Signature sha256(secret, notification_bytes)
        $signature = $request->header('HTTP_X_HUB_SIGNATURE');
        if (empty($signature)) {
            throw new TwitchWebHookException('Empty signature');
        }
        if ($signature != 'sha256=' . hash_hmac('sha256', $request->getBody(), $conf['client_secret'])) {
            throw new TwitchWebHookException('Invalid signature ' . $signature);
        }
        // Make sure the callback get param was returned
        $topic = $request->param(self::GET_TOPIC_KEY);
        if (empty($topic)) {
            throw new TwitchWebHookException('Empty $topic');
        }
        return true;
    }

    /**
     * @throws TwitchWebHookException
     */
    public function handleIncomingWebhook(Request $request): string {
        $this->validateIncomingCallback($request);
        $topic = $request->param(self::GET_TOPIC_KEY);
        switch ($topic) {
            case self::TOPIC_STREAM:
                $this->handleStreamChangeWebhook($request);
                break;
            case self::TOPIC_EXTENSION_ANALYTICS:
            case self::TOPIC_GAME_ANALYTICS:
            case self::TOPIC_USER_CHANGED:
            case self::TOPIC_FOLLOW:
                Log::debug("Unhandled $topic");
                break;
        }
        return 'ok';
    }

    /**
     * This is the incoming request for stream change event
     * TODO we currently do not store anything other than if the stream is online
     *
     * @param Request $request
     * @see https://dev.twitch.tv/docs/api/webhooks-reference/#example-notification-payload-for-other-stream-change-events
     */
    private function handleStreamChangeWebhook(Request $request) {
        $payload = json_decode($request->getBody(), true);
        Log::info('handling twitch stream change webhook', $payload);
        if (!empty($payload) && isset($payload['data']) && is_array($payload['data'])) {
            $userId = $request->param('user_id');
            if (!empty($userId)) {
                $cache = Application::getNsCache();
                $existing = $cache->fetch(self::CACHE_KEY_PREFIX . $userId) ?: ['live' => false];
                $waslive = $existing['live'] ?? false;
                $data = $payload['data'][0] ?? null;
                if (!empty($data)) {
                    // If the event data, and the user_id GET are not the same
                    if ($userId != $data['user_id']) {
                        Log::error('Invalid stream change payload.', $data[0]);
                        return;
                    }
                    if ($data['type'] === 'live') {
                        $cache->save(self::CACHE_KEY_PREFIX . $userId, ['time' => time(), 'live' => true]);
                        if (!$waslive && $userId == Config::$a['twitch']['user']) {
                            ChatRedisService::instance()->sendBroadcast("Destiny is now live :) " . $data['title']);
                        }
                        return;
                    }
                } else if ($waslive && $userId == Config::$a['twitch']['user']) {
                    ChatRedisService::instance()->sendBroadcast("Destiny is now offline :( ");
                }
                // OFFLINE
                $cache->save(self::CACHE_KEY_PREFIX . $userId, ['time' => time(), 'live' => false]);
            } else {
                Log::warn('Missing user id for twitch change webhook');
            }
        } else {
            Log::warn('Missing payload for twitch change webhook');
        }
    }

    /**
     * This is the incoming request after the subscribe request is sent
     * Always return the challenge on success
     * @throws FilterParamsException
     */
    public function handleIncomingNotify(Request $request): string {
        $gets = $request->get();
        FilterParams::required($gets, 'hub_topic');
        FilterParams::required($gets, 'hub_mode');
        if ($gets['hub_mode'] == self::MODE_DENIED) {
            Log::error('Denied twitch webhook subscription.', ['reason' => $get['hub_reason'] ?? 'Unspecified']);
            return 'denied';
        }
        Log::info('Handled incoming notification.', ['topic' => $gets['hub_topic']]);
        return $gets['hub_challenge'] ?? 'none';
    }

    /**
     * Returns an app access token. If not in cache or expired, gets a new one and caches it.
     */
    private function getAppAccessToken(): string {
        $cache = Application::getNsCache();
        $twitchAuthHandler = TwitchAuthHandler::instance();

        $accessToken = $cache->fetch(self::CACHE_KEY_ACCESS_TOKEN);
        if (!$accessToken || !($twitchAuthHandler->validateToken($accessToken))) {
            Log::info('App access token not in cache or expired. Getting a new one.');
            $response = $twitchAuthHandler->getToken(['grant_type' => TwitchAuthHandler::GRANT_TYPE_APP]);
            $accessToken = $response['access_token'];
            $cache->save(self::CACHE_KEY_ACCESS_TOKEN, $accessToken);
        }

        return $accessToken;
    }
}

class TwitchWebHookException extends Exception {}