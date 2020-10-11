<?php
namespace Destiny\Common\User;

class UserStatus {

    public const ACTIVE = 'Active';        // a normal active user
    public const DELETED = 'Deleted';      // a user that requested their account deleted
    public const REDACTED = 'Redacted';    // a user which has been deleted / sanitized

}