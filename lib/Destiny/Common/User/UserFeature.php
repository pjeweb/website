<?php
namespace Destiny\Common\User;

abstract class UserFeature {
    
    public const SUBSCRIBER = 'subscriber';
    public const SUBSCRIBER_TWITCH = 'flair9';
    public const SUBSCRIBERT1 = 'flair13';
    public const SUBSCRIBERT2 = 'flair1';
    public const SUBSCRIBERT3 = 'flair3';
    public const SUBSCRIBERT4 = 'flair8';
    public const DGGBDAY = 'flair15';
    public const MINECRAFTVIP = 'flair14';

    public static $UNASSIGNABLE = [
        self::SUBSCRIBER,
        self::SUBSCRIBER_TWITCH,
        self::SUBSCRIBERT1,
        self::SUBSCRIBERT2,
        self::SUBSCRIBERT3,
        self::SUBSCRIBERT4,
        self::DGGBDAY,
    ];

}