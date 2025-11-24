<?php
class Quiz {
    private $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function getAllQuestions() {
        $stmt = $this->db->prepare("SELECT id, text, dimension, order_no FROM quiz_questions ORDER BY order_no ASC");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getQuestionDimensions(array $questionIds) {
        if (empty($questionIds)) return [];
        $placeholders = implode(',', array_fill(0, count($questionIds), '?'));
        $stmt = $this->db->prepare("SELECT id, dimension FROM quiz_questions WHERE id IN ($placeholders)");
        $stmt->execute($questionIds);
        
        $dimensions = [];
        while ($row = $stmt->fetch()) {
            $dimensions[$row['id']] = $row['dimension'];
        }
        return $dimensions;
    }

    public function saveResult($userId, $scores, $dominant) {
        $stmt = $this->db->prepare("INSERT INTO quiz_user_results (user_id, score_v, score_a, score_k, dominant) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$userId, $scores['V'], $scores['A'], $scores['K'], $dominant]);
        return $this->db->lastInsertId();
    }

    public function getLastResult($userId) {
        $stmt = $this->db->prepare("SELECT * FROM quiz_user_results WHERE user_id = ? ORDER BY taken_at DESC LIMIT 1");
        $stmt->execute([$userId]);
        return $stmt->fetch();
    }

    public function getAllResults($userId) {
        $stmt = $this->db->prepare(
            "SELECT score_v, score_a, score_k, DATE_FORMAT(taken_at, '%Y-%m-%d') as date 
             FROM quiz_user_results 
             WHERE user_id = ? 
             ORDER BY taken_at ASC 
             LIMIT 10"
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }
}