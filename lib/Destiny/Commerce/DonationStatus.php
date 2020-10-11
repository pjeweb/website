<?php
namespace Destiny\Commerce;

abstract class DonationStatus {

    /**
     * Used for when a new donation is created before the order has cleared
     */
    public const PENDING = 'Pending';

    /**
     * Used for when a new donation is created before the order has cleared
     */
    public const COMPLETED = 'Completed';

    /**
     * Used for when a donation could not be completed
     */
    public const ERROR = 'Error';


}