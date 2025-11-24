<?php
class Connection {
    private static $pdo = null;

    public static function getInstance() {
        if (self::$pdo === null) {
            try {
                $config = require __DIR__ . '/../config/app.php';
                $db_config = $config['db'];

                $dsn = "mysql:host={$db_config['host']};port={$db_config['port']};dbname={$db_config['dbname']};charset=utf8mb4";

                $options = [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, 
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, 
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ];

                self::$pdo = new PDO($dsn, $db_config['user'], $db_config['password'], $options);
            } catch (PDOException $e) {
                die('Koneksi database gagal: ' . $e->getMessage());
            }
        }
        return self::$pdo;
    }
}