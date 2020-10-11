<?php
namespace Destiny\Twitch;

use Destiny\Common\Authentication\AbstractAuthService;
use Destiny\Common\Authentication\AuthProvider;

/**
 * @method static TwitchAdminService instance()
 */
class TwitchAdminService extends AbstractAuthService {

    public $provider = AuthProvider::TWITCHBROADCAST;

    public function afterConstruct() {
        parent::afterConstruct();
        $this->authHandler = TwitchBroadcastAuthHandler::instance();
    }

}