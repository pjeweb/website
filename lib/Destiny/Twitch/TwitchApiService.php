<?php
namespace Destiny\Twitch;

use Destiny\Common\Config;
use Destiny\Common\HttpClient;
use Destiny\Common\Log;
use Destiny\Common\Service;
use Destiny\Common\Utils\Date;
use Destiny\Common\Utils\Http;
use InvalidArgumentException;

/**
 * @method static TwitchApiService instance()
 */
class TwitchApiService extends Service {

    private $apiBase = 'https://api.twitch.tv/kraken';
    private $tmiBase = 'https://tmi.twitch.tv';

    public function getApiCredentials(): array {
        return Config::$a['oauth_providers']['twitch'];
    }

    /**
     * What channel {you} are hosting
     * @return array|null
     */
    public function getChannelHostWithInfo($id) {
        $host = $this->getChannelHost($id);
        if (!empty($host) && isset($host['target_id'])) {
            $target = $this->getStreamLiveDetails($host['target_id']);
            if (!empty($target) && isset($target['channel'])) {
                $channel = $target['channel'];
                return [
                    'id' => $channel['_id'],
                    'url' => $channel['url'],
                    'name' => $channel['name'],
                    'preview' => $target['preview']['medium'],
                    'display_name' => $channel['display_name'],
                ];
            }
        }
        return null;
    }

    /**
     * What channel {you} are hosting
     * @param int $id stream id
     * @return array|mixed
     */
    public function getChannelHost($id){
        $conf = $this->getApiCredentials();
        $client = HttpClient::instance();
        $response = $client->get("$this->tmiBase/hosts", [
            'headers' => [
                'User-Agent' => Config::userAgent(),
                'Accept' => 'application/vnd.twitchtv.v5+json',
                'Client-ID' => $conf['client_id']
            ],
            'query' => [
                'include_logins' => '1',
                'host' => $id
            ]
        ]);
        if ($response->getStatusCode() === Http::STATUS_OK) {
            try {
                $json = \GuzzleHttp\json_decode($response->getBody(), true);
                if (!empty($json) && isset($json['hosts'])) {
                    return $json['hosts'][0];
                }
                return $json;
            } catch (InvalidArgumentException $e) {
                Log::error("Failed to parse channel host. " . $e->getMessage());
            }
        }
        return null;
    }

    /**
     * @return array|mixed
     */
    public function getPastBroadcasts(int $channelId, int $limit = 4) {
        $conf = $this->getApiCredentials();
        $client = HttpClient::instance();
        $response = $client->get("$this->apiBase/channels/$channelId/videos", [
            'headers' => [
                'User-Agent' => Config::userAgent(),
                'Accept' => 'application/vnd.twitchtv.v5+json',
                'Client-ID' => $conf['client_id']
            ],
            'query' => [
                'broadcasts' => true,
                'limit' => $limit
            ]
        ]);
        if ($response->getStatusCode() === Http::STATUS_OK) {
            try {
                return \GuzzleHttp\json_decode($response->getBody(), true);
            } catch (InvalidArgumentException $e) {
                Log::error("Failed to parse past broadcasts." . $e->getMessage());
            }
        }
        return null;
    }

    /**
     * Stream object is an object when streamer is ONLINE, otherwise null
     * @return array|mixed
     */
    public function getStreamLiveDetails(int $channelId) {
        $conf = $this->getApiCredentials();
        $client = HttpClient::instance();
        $response = $client->get("$this->apiBase/streams/$channelId", [
            'headers' => [
                'User-Agent' => Config::userAgent(),
                'Accept' => 'application/vnd.twitchtv.v5+json',
                'Client-ID' => $conf['client_id']
            ]
        ]);
        if($response->getStatusCode() === Http::STATUS_OK) {
            try {
                $data = \GuzzleHttp\json_decode($response->getBody(), true);
                if (isset($data['status']) && $data['status'] == 503) {
                    return null;
                }
                return $data['stream'];
            } catch (InvalidArgumentException $e) {
                Log::error("Failed to parse streams. " . $e->getMessage());
            }
        }
        return null;
    }

    /**
     * @return array|null
     */
    public function getChannel(int $channelId) {
        $conf = $this->getApiCredentials();
        $client = HttpClient::instance();
        $response = $client->get("$this->apiBase/channels/$channelId", [
            'headers' => [
                'User-Agent' => Config::userAgent(),
                'Accept' => 'application/vnd.twitchtv.v5+json',
                'Client-ID' => $conf['client_id'],
            ]
        ]);
        if($response->getStatusCode() === Http::STATUS_OK) {
            try {
                return \GuzzleHttp\json_decode($response->getBody(), true);
            } catch (InvalidArgumentException $e) {
                Log::error("Failed to parse channel. " . $e->getMessage());
            }
        }
        return null;
    }

    /**
     * [
     *   'live'             => false,
     *   'game'             => '',
     *   'preview'          => null,
     *   'status_text'      => null,
     *   'started_at'       => null,
     *   'ended_at'         => null,
     *   'duration'         => 0,
     *   'viewers'          => 0,
     *   'host'             => null
     * ]
     * @return array|null
     */
    public function getStreamStatus(int $channelId, bool $lastOnline = false) {
        $channel = $this->getChannel($channelId);

        if (empty($channel)) {
            return null;
        }

        $live = $this->getStreamLiveDetails($channelId);
        // if there are live details
        //   use the current time
        // else if there are no live details
        //   if there is a cache lastOnline
        //     use lastOnline
        //   else
        //     use channel[updated_date]
        $lastSeen = (empty($live) ? (!empty($lastOnline) ? Date::getDateTime($lastOnline) : Date::getDateTime($channel['updated_at'])) : Date::getDateTime());

        $data = [
            'live' => !empty($live),
            'game' => $channel['game'],
            'status_text' => $channel['status'],
            'ended_at' => $lastSeen->format(Date::FORMAT),
        ];

        if (!empty($live)) {

            $created = Date::getDateTime($live['created_at']);
            $data['host'] = null;
            $data['preview'] = $live['preview']['medium'];
            $data['started_at'] = $created->format(Date::FORMAT);
            $data['duration'] = time() - $created->getTimestamp();
            $data['viewers'] = $live['viewers'];

        } else {

            $broadcasts = $this->getPastBroadcasts($channelId, 1);
            $host = $this->getChannelHostWithInfo($channel['_id']);
            $lastPreview = (!empty($broadcasts) && isset($broadcasts['videos']) && !empty($broadcasts['videos'])) ? $broadcasts['videos'][0]['preview'] : null;
            $data['host'] = $host;
            $data['preview'] = !empty($host) ? $host['preview'] : $lastPreview;
            $data['started_at'] = null;
            $data['duration'] = 0;
            $data['viewers'] = 0;

        }

        return $data;
    }

}