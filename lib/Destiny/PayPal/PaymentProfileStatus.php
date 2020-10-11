<?php
namespace Destiny\PayPal;

abstract class PaymentProfileStatus {

    public const _NEW = 'New';
    public const ERROR = 'Error';
    public const ACTIVE_PROFILE = 'ActiveProfile';
    public const CANCELLED_PROFILE = 'CancelledProfile';
    public const FAILED = 'Failed';
    public const SKIPPED = 'Skipped';

}