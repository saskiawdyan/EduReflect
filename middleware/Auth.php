<?php
class Auth {
    public static function start_session() {
        $config = require __DIR__ . '/../config/app.php';
        session_name($config['session']['name']);
        
        session_set_cookie_params([
            'lifetime' => 0, 
            'path' => '/',
            'domain' => '', 
            'secure' => false, 
            'httponly' => true, 
            'samesite' => 'Lax' 
        ]);

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    public static function requireLogin() {
        if (!isset($_SESSION['user_id'])) {
            Response::json_error('Otentikasi diperlukan. Silakan login.', 401);
        }
    }

    public static function currentUserId() {
        return $_SESSION['user_id'] ?? null;
    }

    public static function currentUser() {
        return $_SESSION['user'] ?? null;
    }
}