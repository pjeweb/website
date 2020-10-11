<?php
namespace Destiny\Common\Authentication;

use Destiny\Common\Config;
use Destiny\Common\Exception;
use Destiny\Common\Log;
use Destiny\Common\Service;
use Destiny\Common\User\UserAuthService;
use Destiny\Common\User\UserService;
use Destiny\Common\Utils\Date;

/**
 * Operates with an API with some authentication state
 * The authentication comes from a single "admin" user.
 * StreamLabs, StreamElements, some Twitch services etc
 */
abstract class AbstractAuthService extends Service {

    /**
     * @var string
     */
    public $provider;

    /**
     * @var array
     */
    public $defaultAuth;

    /**
     * @var array
     */
    public $defaultUser;

    /**
     * @var AbstractAuthHandler
     */
    public $authHandler;

    public function getDefaultUserId(): int {
        return Config::$a[$this->provider]['dgg_user'];
    }

    /**
     * @return array|null
     */
    public function getDefaultAuth() {
        try {
            if ($this->defaultAuth == null) {
                $this->defaultAuth = UserAuthService::instance()->getByUserIdAndProvider($this->getDefaultUserId(), $this->provider);
            }
        } catch (Exception $e) {
            Log::error("Error getting default auth profile. {$e->getMessage()}");
        }
        return $this->defaultAuth;
    }

    /**
     * @return array|null
     */
    public function getDefaultUser() {
        try {
            if ($this->defaultUser == null) {
                $this->defaultUser = UserService::instance()->getUserById($this->getDefaultUserId());
            }
        } catch (Exception $e) {
            Log::error("Error getting default user. {$e->getMessage()}");
        }
        return $this->defaultUser;
    }

    /**
     * @return string
     */
    protected function getValidAccessToken(): string {
        $auth = $this->getDefaultAuth();
        if (!empty($auth) && !empty($auth['refreshToken']) && $this->authHandler->isTokenExpired($auth)) {
            $data = $this->authHandler->renewToken($auth['refreshToken']);
            try {
                $userAuthService = UserAuthService::instance();
                $userAuthService->updateUserAuth($auth['id'], [
                    'accessToken' => $data['access_token'],
                    'refreshToken' => $data['refresh_token'],
                    'createdDate' => Date::getSqlDateTime(),
                    'modifiedDate' => Date::getSqlDateTime()
                ]);
            } catch (Exception $e) {
                Log::error("Error saving access token.", $auth);
            }
            return (string) $data['access_token'];
        }
        return !empty($auth) ? (string) $auth['accessToken'] : '';
    }

}