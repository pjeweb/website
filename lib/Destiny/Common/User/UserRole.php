<?php
namespace Destiny\Common\User;

class UserRole {
    // an authenticated user
    public const USER = 'USER';
    // has subscription
    public const SUBSCRIBER = 'SUBSCRIBER';
    // can access website administration
    public const ADMIN = 'ADMIN';
    // has access to users, bans etc
    public const MODERATOR = 'MODERATOR';
    // can view the financial graphs and info
    public const FINANCE = 'FINANCE';
    // used for the streamlabs alerts, should only be the broadcaster
    public const STREAMLABS = 'STREAMLABS';
    // used for the streamelements alerts, should only be the broadcaster
    public const STREAMELEMENTS = 'STREAMELEMENTS';
    // can add, update, remove emotes
    public const EMOTES = 'EMOTES';
    // can add, update, remove flairs
    public const FLAIRS = 'FLAIRS';

}