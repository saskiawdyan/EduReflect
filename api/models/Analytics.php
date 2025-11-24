<?php
class Analytics {
    private $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function getMoodDistribution($userId) {
        $stmt = $this->db->prepare(
            "SELECT mood, COUNT(*) as count 
             FROM reflections 
             WHERE user_id = ? 
             GROUP BY mood"
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public function getWeeklyReflectionCount($userId) {
        $stmt = $this->db->prepare(
            "SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as day, COUNT(*) as count 
             FROM reflections 
             WHERE user_id = ? AND created_at >= CURDATE() - INTERVAL 7 DAY 
             GROUP BY day 
             ORDER BY day ASC"
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }
}