<?php

namespace Destiny\Redis;

use Destiny\Common\Application;
use Destiny\Common\Config;
use Destiny\Common\Exception;

class RedisUtils {

    /**
     * Loads the given redis script if needed and calls it with the $arguments param
     * @return mixed
     * @throws Exception
     */
    public static function callScript(string $scriptname, array $arguments = [], $numKeys = 0) {
        $redis = Application::instance()->getRedis();
        $dir = Config::$a['redis']['scriptdir'];

        $hashFilename = $dir . $scriptname . '.hash';
        if (file_exists($hashFilename)) {
            $hash = file_get_contents($hashFilename);
            if ($hash) {
                $ret = $redis->evalSha($hash, $arguments, $numKeys);
                if ($ret) {
                    return $ret;
                }
            }
        }

        $hash2 = $redis->script('load', file_get_contents($dir . $scriptname . '.lua'));
        if (!$hash2) {
            throw new Exception('Unable to load script');
        }
        if (!file_put_contents($dir . $scriptname . '.hash', $hash2)) {
            throw new Exception('Unable to save hash');
        }
        return $redis->evalSha($hash2, $arguments, $numKeys);
    }

}