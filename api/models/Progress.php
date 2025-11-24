<?php
class Progress {
    private $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function recordReflection($userId) {
        $today = date('Y-m-d');
        $yesterday = date('Y-m-d', strtotime('-1 day'));

        $this->db->beginTransaction();
        try {
            $stmt = $this->db->prepare("SELECT streak FROM progress_snapshots WHERE user_id = ? AND day = ?");
            $stmt->execute([$userId, $yesterday]);
            $lastDay = $stmt->fetch();

            $currentStreak = $lastDay ? $lastDay['streak'] + 1 : 1;

            $stmt = $this->db->prepare("SELECT id, reflections_count, streak FROM progress_snapshots WHERE user_id = ? AND day = ?");
            $stmt->execute([$userId, $today]);
            $todayData = $stmt->fetch();

            if ($todayData) {
                $newCount = $todayData['reflections_count'] + 1;
                $finalStreak = max($todayData['streak'], $currentStreak);
                
                $stmt = $this->db->prepare("UPDATE progress_snapshots SET reflections_count = ?, streak = ? WHERE id = ?");
                $stmt->execute([$newCount, $finalStreak, $todayData['id']]);
            } else {
                $stmt = $this->db->prepare("INSERT INTO progress_snapshots (user_id, day, reflections_count, streak) VALUES (?, ?, 1, ?)");
                $stmt->execute([$userId, $today, $currentStreak]);
            }
            
            $this->db->commit();
            return ['streak' => $currentStreak, 'reflections_today' => $todayData['reflections_count'] + 1 ?? 1];
        } catch (Exception $e) {
            $this->db->rollBack();
            return false;
        }
    }

    public function getSummary($userId) {
        $stmt = $this->db->prepare("SELECT streak, reflections_count, day FROM progress_snapshots WHERE user_id = ? ORDER BY day DESC LIMIT 1");
        $stmt->execute([$userId]);
        $latest = $stmt->fetch();

        if (!$latest) {
            return ['streak' => 0, 'reflections_today' => 0];
        }

        $today = date('Y-m-d');
        $yesterday = date('Y-m-d', strtotime('-1 day'));

        if ($latest['day'] == $today) {
            return ['streak' => $latest['streak'], 'reflections_today' => $latest['reflections_count']];
        }
        
        if ($latest['day'] == $yesterday) {
            return ['streak' => $latest['streak'], 'reflections_today' => 0];
        }

        return ['streak' => 0, 'reflections_today' => 0];
    }
}