<?php
class User {
    private $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function findByEmail($email) {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetch();
    }

    public function findById($id) {
        $stmt = $this->db->prepare("SELECT id, name, email, bio, created_at, game_highscore, avatar_url FROM users WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function create($name, $email, $password) {
        $password_hash = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $this->db->prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)");
        $stmt->execute([$name, $email, $password_hash]);
        return $this->db->lastInsertId();
    }

    public function updateProfileData($id, $name, $bio, $avatar_url = null) {
        if ($avatar_url) {
            $stmt = $this->db->prepare("UPDATE users SET name = ?, bio = ?, avatar_url = ? WHERE id = ?");
            return $stmt->execute([$name, $bio, $avatar_url, $id]);
        } else {
            $stmt = $this->db->prepare("UPDATE users SET name = ?, bio = ? WHERE id = ?");
            return $stmt->execute([$name, $bio, $id]);
        }
    }

    public function updateGameScore($userId, $newScore) {
        $stmt = $this->db->prepare("SELECT game_highscore FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        if ($user && $newScore > $user['game_highscore']) {
            $stmt = $this->db->prepare("UPDATE users SET game_highscore = ? WHERE id = ?");
            return $stmt->execute([$newScore, $userId]);
        }
        return false;
    }

    public function verifyPassword($userId, $password) {
        $stmt = $this->db->prepare("SELECT password_hash FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        if ($user && password_verify($password, $user['password_hash'])) {
            return true;
        }
        return false;
    }

    public function getLeaderboard() {
        $stmt = $this->db->prepare(
            "SELECT name, game_highscore 
             FROM users 
             WHERE game_highscore > 0
             ORDER BY game_highscore DESC 
             LIMIT 10"
        );
        $stmt->execute();
        return $stmt->fetchAll();
    }
}