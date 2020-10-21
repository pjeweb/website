<?php
namespace Destiny\Discord;

use Destiny\Common\Authentication\AbstractAuthHandler;
use Destiny\Common\Authentication\AuthProvider;
use Destiny\Common\Authentication\OAuthResponse;
use Destiny\Common\Config;
use Destiny\Common\Exception;
use Destiny\Common\Utils\FilterParams;
use Destiny\Common\Utils\Http;

/**
 * @method static DiscordAuthHandler instance()
 */
class DiscordAuthHandler extends AbstractAuthHandler {

    private $authBase = 'https://discordapp.com/api/oauth2';
    private $apiBase = 'https://discordapp.com/api';
    public $authProvider = AuthProvider::DISCORD;

    public function getAuthorizationUrl($scope = ['identify', 'email'], $claims = ''): string {
        $conf = $this->getAuthProviderConf();
        return "$this->authBase/authorize?" . http_build_query([
            'response_type' => 'code',
            'scope' => implode(' ', $scope),
            'state' => md5(time() . 'ifC35_'),
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
        $response = $client->post("$this->authBase/token", [
            'headers' => [
                'User-Agent' => Config::userAgent(),
                'Authorization' => 'Basic ' . base64_encode($conf['client_id'] . ':' . $conf['client_secret'])
            ],
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
            return $data;
        }
        throw new Exception('Failed to get token response');
    }

    /**
     * @throws Exception
     */
    private function getUserInfo(string $accessToken): array {
        $client = $this->getHttpClient();
        $response = $client->get("$this->apiBase/users/@me", [
            'headers' => [
                'User-Agent' => Config::userAgent(),
                'Authorization' => "Bearer $accessToken"
            ]
        ]);
        if ($response->getStatusCode() === Http::STATUS_OK) {
            $info = json_decode((string)$response->getBody(), true);
            if (empty($info) ) {
                throw new Exception ('Invalid user info response');
            }
            return $info;
        }
        throw new Exception ('Invalid user info response');
    }

    /**
     * @throws Exception
     */
    public function mapTokenResponse(array $token): OAuthResponse {
        $data = $this->getUserInfo($token['access_token']);
        FilterParams::required($data, 'username');
        return new OAuthResponse([
            'accessToken' => $token['access_token'],
            'refreshToken' => $token['refresh_token'] ?? '',
            'authProvider' => $this->authProvider,
            'username' => $data['username'],
            'authId' => (string) $data['id'],
            'authDetail' => $data['username'],
            'authEmail' => $data['email'] ?? '',
            'verified' => true,
            'discriminator' => (string) $data ['discriminator'],
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