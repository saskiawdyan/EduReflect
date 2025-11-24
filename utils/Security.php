<?php
class Security {
    
    public static function filterInput($data) {
        if (is_array($data)) {
            return array_map([self::class, 'filterInput'], $data);
        }
        return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
    }

    public static function escapeOutput($string) {
        return htmlspecialchars($string, ENT_QUOTES, 'UTF-8');
    }
}