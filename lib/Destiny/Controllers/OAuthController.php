<?php
namespace Destiny\Controllers;

use Destiny\Common\Annotation\Controller;
use Destiny\Common\Annotation\HttpMethod;
use Destiny\Common\Annotation\ResponseBody;
use Destiny\Common\Annotation\Route;
use Destiny\Common\Authentication\DggOAuthService;
use Destiny\Common\Exception;
use Destiny\Common\Response;
use Destiny\Common\Session\Session;
use Destiny\Common\Utils\FilterParams;
use Destiny\Common\Utils\Http;
use Destiny\Common\Utils\RandomString;

/**
 * @Controller
 */
class OAuthController {

    /**
     * grant types for /oauth/token endpoint
     * @var array
     */
    private $tokenGrantTypes = ['authorization_code', 'refresh_token'];

    /**
     * @see https://www.oauth.com/oauth2-servers/pkce/authorization-request/
     * @Route("/oauth/authorize")
     * @HttpMethod({"GET"})
     */
    public function authorize(array $params): string {
        try {
            FilterParams::required($params, 'response_type');           // code - indicates that your server expects to receive an authorization code
            FilterParams::required($params, 'client_id');               // The client ID you received when you first created the application
            FilterParams::required($params, 'redirect_uri');            // Indicates the URL to return the user to after authorization is complete, such as org.example.app://redirect
            FilterParams::required($params, 'state');                   // A random string generated by your application, which you’ll verify later
            FilterParams::required($params, 'code_challenge');          // The code challenge generated as previously described
            //FilterParams::required($params, 'code_challenge_method');         // either plain or S256, depending on whether the challenge is the plain verifier string or the SHA256 hash of the string. If this parameter is omitted, the server will assume plain

            $params['code_challenge_method'] = $params['code_challenge_method'] ?? 'S256';

            $oauthService = DggOAuthService::instance();
            $client = $oauthService->ensureAuthClient((string) $params['client_id']);

            if ($params['response_type'] != 'code') {
                throw new Exception("response_type must be 'code'");
            }
            if ($params['code_challenge_method'] != 'S256') {
                throw new Exception("code_challenge_method must be 'S256'");
            }
            if (mb_strpos($params['redirect_uri'], $client['redirectUrl']) !== 0) {
                throw new Exception("redirect_uri does not match the client redirect url.");
            }

            $oauthService->validateNewCodeChallenge($params['code_challenge']);
            $oauthService->validateNewState($params['state']);

            $uuid = RandomString::makeUrlSafe(64);
            $oauthService->saveFlashStore($uuid, [
                'unique_id' => $uuid,
                'state' => $params['state'],
                'client_id' => $params['client_id'],
                'redirect_uri' => $params['redirect_uri'],
                'response_type' => $params['response_type'],
                'code_challenge' => $params['code_challenge'],
                'code_challenge_method' => $params['code_challenge_method'],
            ]);
            return 'redirect: /login?grant='. urlencode($params['response_type']) .'&uuid=' . urlencode($uuid);
        } catch (Exception $e) {
            Session::setErrorBag($e->getMessage());
            return 'redirect: /login';
        }
    }

    /**
     * @see https://www.oauth.com/oauth2-servers/pkce/authorization-code-exchange/
     * @see https://www.oauth.com/oauth2-servers/making-authenticated-requests/refreshing-an-access-token/
     * @Route("/oauth/token")
     * @ResponseBody
     */
    public function token(Response $response, array $params): array {
        try {
            FilterParams::required($params, 'grant_type');      // authorization_code | refresh_token - Indicates the grant type of this token request
            if (!in_array($params['grant_type'], $this->tokenGrantTypes)) {
                throw new Exception("Invalid grant_type '" . $params['grant_type'] . "'");
            }
            switch ($params['grant_type']) {
                case 'authorization_code':
                    $res = $this->tokenExchange($params);
                    break;
                case 'refresh_token':
                    $res = $this->tokenRenew($params);
                    break;
                default:
                    throw new Exception('Invalid grant_type');
            }
            $response->addHeader('Pragma', 'no-cache');
            $response->addHeader('Cache-Control', 'no-store');
            return $res;
        } catch (Exception $e) {
            return [
                'error' => 'invalid_grant',
                'message' => $e->getMessage(),
                'code' => Http::STATUS_ERROR
            ];
        }
    }

    /**
     * @throws Exception
     */
    private function tokenExchange(array $params): array {
        FilterParams::required($params, 'code');            // The client will send the authorization code it obtained in the redirect
        FilterParams::required($params, 'client_id');       // The application’s registered client ID
        FilterParams::required($params, 'redirect_uri');    // The redirect URL that was used in the initial authorization request
        FilterParams::required($params, 'code_verifier');   // The code verifier for the PKCE request, that the app originally generated before the authorization request.

        $oauthService = DggOAuthService::instance();
        $client = $oauthService->ensureAuthClient((string) $params['client_id']);
        $data = $oauthService->getFlashStore($params['code'], 'code');

        $codeVerifier = $params['code_verifier'] . $client['clientSecret'];
        if ($data['code_challenge'] != base64_encode(hash('sha256', $codeVerifier))) {
            throw new Exception('Invalid code_verifier');
        }
        if ($data['redirect_uri'] != $params['redirect_uri']) {
            throw new Exception('Invalid redirect_uri');
        }

        $oauthService->deleteFlashStore($params['code']);
        $accessToken = RandomString::makeUrlSafe(64);
        $refreshToken = RandomString::makeUrlSafe(64);
        $auth = [
            'clientId' => $client['clientId'],
            'userId' => $data['userId'],
            'token' => $accessToken,
            'refresh' => $refreshToken,
            'scope' => 'identify',
            'expireIn' => 3600
        ];
        $oauthService->addAccessToken($auth);

        return [
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'expires_in' => $auth['expireIn'],
            'scope' => $auth['scope'],
            'token_type' => 'bearer'
        ];
    }

    /**
     * @throws Exception
     */
    private function tokenRenew(array $params): array {
        FilterParams::required($params, 'client_id');       // The application’s registered client ID
        FilterParams::required($params, 'refresh_token');   // The refresh token from the original /oauth/authorize request

        $oauthService = DggOAuthService::instance();
        $client = $oauthService->ensureAuthClient((string) $params['client_id']);
        $auth = $oauthService->getAccessTokenByRefreshAndClientId($params['refresh_token'], $client['clientId']);

        if (empty($auth)) {
            throw new Exception('Invalid refresh_token');
        }
        if (empty($auth['clientId'])) {
            throw new Exception('DGG login keys cannot be renewed');
        }

        $accessToken = RandomString::makeUrlSafe(64);
        $refreshToken = RandomString::makeUrlSafe(64);
        $oauthService->renewAccessToken($accessToken, $refreshToken, $auth['tokenId']);

        return [
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'expires_in' => $auth['expireIn'],
            'scope' => $auth['scope'],
            'token_type' => 'bearer'
        ];
    }
}
