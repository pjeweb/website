<?php
namespace Destiny\Reddit;

use Destiny\Common\Authentication\AbstractAuthHandler;
use Destiny\Common\Authentication\AuthProvider;
use Destiny\Common\Authentication\OAuthResponse;
use Destiny\Common\Config;
use Destiny\Common\Exception;
use Destiny\Common\Utils\FilterParams;
use Destiny\Common\Utils\Http;

/**
 * @method static RedditAuthHandler instance()
 */
class RedditAuthHandler extends AbstractAuthHandler {

    private $apiBase = 'https://ssl.reddit.com/api/v1';
    private $authBase = 'https://oauth.reddit.com/api/v1';
    public $authProvider = AuthProvider::REDDIT;
    public $userProfileBaseUrl = 'https://www.reddit.com/u';

    /**
     * @return string
     */
    public function getAuthorizationUrl($scope = ['identity'], $claims = ''): string {
        $conf = $this->getAuthProviderConf();
        return "$this->apiBase/authorize?" . http_build_query([
                'response_type' => 'code',
                'scope' => implode(' ', $scope),
                'state' => md5(time() . 'eFdcSA_'),
                'client_id' => $conf['client_id'],
                'redirect_uri' => $conf['redirect_uri']
            ], null, '&');
    }

    /**
     * @throws Exception
     */
    public function getToken(array $params): array {
        FilterParams::required($params, 'code');
        $conf = $this->getAuthProviderConf();
        $client = $this->getHttpClient();
        $response = $client->post("$this->apiBase/access_token", [
            'headers' => [
                'User-Agent' => Config::userAgent(),
                'Authorization' => 'Basic ' . base64_encode($conf['client_id']. ':' .$conf['client_secret'])
            ],
            'form_params' => [
                'grant_type' => 'authorization_code',
                'client_id' => $conf['client_id'],
                'redirect_uri' => $conf['redirect_uri'],
                'code' => $params['code']
            ]
        ]);
        if ($response->getStatusCode() === Http::STATUS_OK) {
            $data = json_decode((string)$response->getBody(), true);
            FilterParams::required($data, 'access_token');
            return $data;
        }
        throw new Exception("Failed to get token response");
    }

    /**
     * @throws Exception
     */
    private function getUserInfo(string $accessToken): array {
        $client = $this->getHttpClient();
        $response = $client->get("$this->authBase/me.json", [
            'headers' => [
                'User-Agent' => Config::userAgent(),
                'Authorization' => "bearer $accessToken"
            ]
        ]);
        if ($response->getStatusCode() === Http::STATUS_OK) {
            return json_decode((string)$response->getBody(), true);
        }
        throw new Exception("Failed to retrieve user info.");
    }

    /**
     * @throws Exception
     */
    public function mapTokenResponse(array $token): OAuthResponse {
        $data = $this->getUserInfo($token['access_token']);
        FilterParams::required($data, 'id');
        return new OAuthResponse([
            'accessToken' => $token['access_token'],
            'refreshToken' => $token['refresh_token'] ?? '',
            'authProvider' => $this->authProvider,
            'username' => $data['name'] ?? '',
            'authId' => (string) $data['id'],
            'authDetail' => $data['name'] ?? '',
            'authEmail' => '',
            'verified' => (bool)($data['has_verified_email'] ?? false),
        ]);
    }

    /**
     * @throws Exception
     */
    public function renewToken(string $refreshToken): array {
        throw new Exception("Not implemented");
        // TODO Implement
    }

}