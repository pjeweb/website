<?php
namespace Destiny\Common\Utils;

abstract class Http {

    public const HEADER_ETAG = 'Etag';
    public const HEADER_CACHE_CONTROL = 'Cache-Control';
    public const HEADER_LOCATION = 'Location';
    public const HEADER_PRAGMA = 'Pragma';
    public const HEADER_CONNECTION = 'Connection';
    public const HEADER_CONTENT_TYPE = 'Content-Type';
    public const HEADER_IF_NONE_MATCH = 'If-None-Match';
    public const HEADER_REQUESTED_WITH = 'Requested-With';
    public const HEADER_AUTH_TOKEN = 'AuthToken';

    public const STATUS_MOVED_PERMANENTLY = 301;
    public const STATUS_MOVED_TEMPORARY = 303;
    public const STATUS_NOT_MODIFIED = 304;
    public const STATUS_FORBIDDEN = 403;
    public const STATUS_NOT_FOUND = 404;
    public const STATUS_UNAUTHORIZED = 401;
    public const STATUS_BAD_REQUEST = 400;
    public const STATUS_ERROR = 500;
    public const STATUS_SERVICE_UNAVAILABLE = 503;
    public const STATUS_OK = 200;
    public const STATUS_ACCEPTED = 202;
    public const STATUS_NO_CONTENT = 204;
    
    public static $HEADER_STATUSES = [
        301 => 'Moved Permanently',
        500 => 'Error',
        404 => 'Not Found',
        401 => 'Unauthorized',
        400 => 'Bad Request',
        304 => 'Not Modified',
        303 => 'Moved Temporary',
        200 => 'OK',
        204 => 'No Content',
        403 => 'Forbidden',
        503 => 'Service Unavailable'
    ];

    public static function header(string $name, string $value, bool $replace = true) {
        header ( $name . ': ' . $value, $replace );
    }

    public static function status(int $status) {
        header ( 'HTTP/1.1 ' . $status . ' ' . self::$HEADER_STATUSES [$status] );
    }
    
    public static function getBaseUrl(): string {
        $protocol = 'http';
        if ($_SERVER ['SERVER_PORT'] == 443 || (!empty ($_SERVER ['HTTPS']) && strtolower($_SERVER ['HTTPS']) == 'on')) {
            $protocol .= 's';
        }
        $host = $_SERVER ['HTTP_HOST'];
        $request = $_SERVER ['PHP_SELF'];
        return dirname($protocol . '://' . $host . $request);
    }

    public static function extractIpAddress(array $server) {
        return $server ['REMOTE_ADDR'] ?? $server ['HTTP_X_REAL_IP'] ?? $server ['HTTP_CLIENT_IP'] ?? $server ['HTTP_X_FORWARDED_FOR'] ?? null;
    }

    /**
     * TODO if you need an arbitrary header, its not currently possible
     */
    public static function extractHeaders(array $server): array {
        return array_filter($server, static function($name) { return strpos($name, 'HTTP_') === 0; }, ARRAY_FILTER_USE_KEY);
    }

}