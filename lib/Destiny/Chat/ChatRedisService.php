<?php
namespace Destiny\Chat;

use Destiny\Common\Application;
use Destiny\Common\Config;
use Destiny\Common\Exception;
use Destiny\Common\Service;
use Destiny\Common\Session\SessionCredentials;
use Destiny\Redis\RedisUtils;
use Redis;

/**
 * @method static ChatRedisService instance()
 */
class ChatRedisService extends Service {

    /**
     * @var integer
     */
    public $redisdb;

    /**
     * @var integer
     */
    public $maxlife;

    /**
     * @var Redis
     */
    public $redis;

    public function afterConstruct() {
        parent::afterConstruct();
        $this->maxlife = (int)ini_get('session.gc_maxlifetime');
        $this->redisdb = Config::$a['redis']['database'];
        $this->redis = Application::instance()->getRedis();
    }

    private function stripRedisUserIpPrefixes(array $keys) {
        return array_filter(array_map(static function($n) {
            return (int)substr($n, strlen('CHAT:userips-'));
        }, $keys), static function($n){
            return $n != null && $n > 0;
        });
    }

    /**
     * Finds all users who share the same IP
     * @throws Exception
     */
    public function findUserIdsByUsersIp(int $userid): array {
        $keys = RedisUtils::callScript('check-sameip-users', [$userid]);
        return $this->stripRedisUserIpPrefixes($keys);
    }

    /**
     * Find all users by ip
     * @throws Exception
     */
    public function findUserIdsByIP(string $ipaddress): array {
        $keys = RedisUtils::callScript('check-ip', [$ipaddress]);
        return $this->stripRedisUserIpPrefixes($keys);
    }

    /**
     * Find all users by ip (wildcard)
     * @throws Exception
     */
    public function findUserIdsByIPWildcard(string $ipaddress): array {
        $keys = RedisUtils::callScript('check-ip-wildcard', [$ipaddress]);
        return array_unique($this->stripRedisUserIpPrefixes($keys));
    }

    /**
     * @throws Exception
     */
    public function cacheIPForUser(int $userId, string $ipAddress): void {
        RedisUtils::callScript('cache-ip', ["CHAT:userips-$userId", $ipAddress], 1);
    }

    /**
     * @return array $ipaddresses The addresses found
     */
    public function getIPByUserId(int $userid): array {
        $redis = Application::instance()->getRedis();
        return $redis->zRange('CHAT:userips-' . $userid, 0, -1);
    }
    
    /**
     * Updates the session ttl so it does not expire
     */
    public function renewChatSessionExpiration(string $sessionId) {
        $this->redis->expire("CHAT:session-$sessionId", $this->maxlife);
    }

    public function setChatSession(SessionCredentials $credentials, string $sessionId) {
        $this->redis->set("CHAT:session-$sessionId", json_encode($credentials->getData()), $this->maxlife);
    }

    public function removeChatSession(string $sessionId): int {
        return $this->redis->del("CHAT:session-$sessionId");
    }

    public function sendRefreshUser(SessionCredentials $credentials): int {
        return $this->redis->publish("refreshuser-$this->redisdb", json_encode($credentials->getData()));
    }

    public function sendBroadcast(string $message): int {
        return $this->redis->publish("broadcast-$this->redisdb", json_encode(['data' => $message], JSON_FORCE_OBJECT));
    }

    public function sendUnbanAndUnmute(int $userId) {
        // Publishing to this channel unbans *and* unmutes.
        $this->redis->publish("unbanuserid-$this->redisdb", (string)$userId);
    }

    /**
     * Notifies the chat to refresh the bans
     * so it actually notices the bans being removed
     */
    public function sendPurgeBans() {
        $this->redis->publish("refreshbans-$this->redisdb", 'doesnotmatter');
    }

    public function publishPrivateMessage(array $d): int {
        return $this->redis->publish("privmsg-$this->redisdb", json_encode([
            'messageid' => (string)($d['messageid']),
            'message' => $d['message'],
            'username' => $d['username'],
            //'userid' => $d['userid'],
            //'targetusername' => $d['targetusername'],
            'targetuserid' => (string)($d['targetuserid'])
        ]));
    }

    public function getChatLog(): array {
        return $this->redis->lRange('CHAT:chatlog', 0, -1);
    }
}