<?php
namespace Destiny\Chat;

class BanReasonParseRule {
    /**
     * @var string
     */
    private $regex;

    /**
     * @var callable
     */
    private $transform;

    public function __construct(string $regex, callable $transform) {
        $this->regex = $regex;
        $this->transform = $transform;
    }

    public function test($ban): array {
        $matches = [];
        preg_match($this->regex, $ban['reason'], $matches);
        return $matches;
    }

    public function apply($ban, $matches): array {
        return ($this->transform)($ban, $matches);
    }
}
