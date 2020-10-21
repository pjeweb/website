<?php
namespace Destiny\StreamLabs;

use Destiny\Common\Authentication\AbstractAuthHandler;
use Destiny\Common\Authentication\AuthProvider;
use Destiny\Common\Authentication\OAuthResponse;
use Destiny\Common\Config;
use Destiny\Common\Exception;
use Destiny\Common\Utils\FilterParams;
use Destiny\Common\Utils\Http;

/**
 * @method static StreamLabsAuthHandler instance()
 */
class StreamLabsAuthHandler extends AbstractAuthHandler {

    private $authBase = 'https://streamlabs.com/api/v1.0';
    public $authProvider = AuthProvider::STREAMLABS;

    public function getAuthorizationUrl($scope = ['alerts.create', 'donations.create'], $claims = ''): string {
        $conf = $this->getAuthProviderConf();
        return "$this->authBase/authorize?" . http_build_query([
                'response_type' => 'code',
                'scope'         => implode(' ', $scope),
                'client_id'     => $conf['client_id'],
                'redirect_uri'  => $conf['redirect_uri']
            ], null, '&');
    }

    /**
     * @throws Exception
     */
    public function getToken(array $params): array {
        FilterParams::required($params, 'code');
        $conf = $this->getAuthProviderConf();
        $response = $this->getHttpClient()->post("$this->authBase/token", [
            'headers' => ['User-Agent' => Config::userAgent()],
            'form_params' => [
                'grant_type' => 'authorization_code',
                'client_id' => $conf['client_id'],
                'client_secret' => $conf['client_secret'],
                'redirect_uri' => $conf['redirect_uri'],
                'code' => $params['code']
            ]
        ]);
        if ($response->getStatusCode() === Http::STATUS_OK) {
            $data = json_decode((string)$response->getBody(), true);
            FilterParams::required($data, 'access_token');
            FilterParams::declared($data, 'refresh_token');
            return $data;
        }
        throw new Exception ('Invalid token response');
    }

    /**
     * @throws Exception
     */
    public function renewToken(string $refreshToken): array {
        $conf = $this->getAuthProviderConf();
        $response = $this->getHttpClient()->post("$this->authBase/token", [
            'headers' => ['User-Agent' => Config::userAgent()],
            'form_params' => [
                'grant_type' => 'refresh_token',
                'client_id' => $conf['client_id'],
                'client_secret' => $conf['client_secret'],
                'redirect_uri' => $conf['redirect_uri'],
                'refresh_token' => $refreshToken
            ]
        ]);
        if ($response !== null && $response->getStatusCode() === Http::STATUS_OK) {
            $data = json_decode((string)$response->getBody(), true);
            FilterParams::required($data, 'access_token');
            return $data;
        }
        throw new Exception("Failed to refresh access token");
    }

    /**
     * @throws Exception
     */
    private function getUserInfo(string $accessToken): array {
        $client = $this->getHttpClient();
        $response = $client->get("$this->authBase/user?access_token=$accessToken", [
            'headers' => ['User-Agent' => Config::userAgent()]
        ]);
        if ($response->getStatusCode() === Http::STATUS_OK) {
            $info = json_decode((string)$response->getBody(), true);
            if (empty($info) ) {
                throw new Exception ('Invalid user info response');
            }
            return $info;
        }
        throw new Exception("Failed to retrieve user info.");
    }

    /**
     * @throws Exception
     */
    public function mapTokenResponse(array $token): OAuthResponse {
        $data = $this->getUserInfo($token['access_token']);
        FilterParams::required($data, 'streamlabs');
        return new OAuthResponse([
            'authProvider' => $this->authProvider,
            'accessToken' => $token['access_token'],
            'refreshToken' => $token['refresh_token'] ?? '',
            'username' => (string) $data['streamlabs']['display_name'],
            'authId' => (string) $data['streamlabs']['id'],
            'authDetail' => '',
            'authEmail' => '',
            'verified' => true,
        ]);
    }
}