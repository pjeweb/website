<?php
namespace Destiny\Reddit;

use Destiny\Common\Config;
use Destiny\Common\HttpClient;
use Destiny\Common\Log;
use Destiny\Common\Service;
use Destiny\Common\Utils\Http;
use Exception;
use function GuzzleHttp\json_decode;

/**
 * @method static RedditService instance()
 *
 * t1_ Comment
 * t2_ Account
 * t3_ Link
 * t4_ Message
 * t5_ Subreddit
 * t6_ Award
 * t8_ PromoCampaign
 */
class RedditService extends Service {

    /**
     * @return null|array
     */
    public function getHotThreads() {
        $client = HttpClient::instance();
        $response = $client->get(Config::$a['reddit']['threads'], [
            'headers' => ['User-Agent' => Config::userAgent()],
            'query' => ['limit' => 6, 'sort' => 'new']
        ]);
        try {
            if ($response->getStatusCode() === Http::STATUS_OK) {
                $json = json_decode($response->getBody(), true);
                if (isset($json['data']) && !empty($json['data']) && isset($json['data']['children']) && !empty($json['data']['children'])) {
                    $data = [];
                    foreach ($json['data']['children'] as $child) {
                        if (isset($child['data'])) {
                            $c = $child['data'];
                            $data[] = [
                                'id' => $c['id'],
                                'title' => $c['title'],
                                'created' => $c['created_utc'],
                                'score' => $c['score'],
                                'stickied' => $c['stickied'],
                                'locked' => $c['locked'],
                                'spoiler' => $c['spoiler'],
                                'archived' => $c['archived'],
                                'permalink' => 'https://www.reddit.com' . $c['permalink'],
                                'thumbnail' => $c['thumbnail'],
                                'num_comments' => $c['num_comments'],
                                'author' => $c['author'],
                                'downs' => $c['downs'],
                                'ups' => $c['ups']
                            ];
                        }
                    }
                    return $data;
                }
            }
        } catch (Exception $e) {
            Log::error("Failed to parse reddit threads. " . $e->getMessage());
        }
        return null;
    }

}