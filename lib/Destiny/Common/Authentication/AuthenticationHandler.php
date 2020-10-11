<?php
namespace Destiny\Common\Authentication;

use Destiny\Common\Exception;

interface AuthenticationHandler {

    public function getAuthProviderId(): string;
    public function getAuthorizationUrl($scope = [], $claims = ''): string;

    public function renewToken(string $refreshToken): array;

    /**
     * Exchange an OAuth code for a user access token.
     *
     * @throws Exception
     */
    public function exchangeCode(array $params): OAuthResponse;

    /**
     * @throws Exception
     */
    public function getToken(array $params): array;

}