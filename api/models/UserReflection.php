<?php
class UserReflection {
    private $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function getAllByUser($userId) {
        $stmt = $this->db->prepare("SELECT id, user_id, title, content, mood, created_at, ai_feedback FROM reflections WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public function countByUser($userId) {
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM reflections WHERE user_id = ?");
        $stmt->execute([$userId]);
        return $stmt->fetchColumn();
    }

    public function findById($id, $userId) {
        $stmt = $this->db->prepare("SELECT id, user_id, title, content, mood, created_at, ai_feedback FROM reflections WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $userId]);
        return $stmt->fetch();
    }

    public function create($userId, $title, $content, $mood) {
        $stmt = $this->db->prepare("INSERT INTO reflections (user_id, title, content, mood) VALUES (?, ?, ?, ?)");
        $stmt->execute([$userId, $title, $content, $mood]);
        return $this->db->lastInsertId();
    }

    public function saveAIFeedback($reflectionId, $feedback) {
        $stmt = $this->db->prepare("UPDATE reflections SET ai_feedback = ? WHERE id = ?");
        return $stmt->execute([$feedback, $reflectionId]);
    }

    public function update($id, $userId, $title, $content, $mood) {
        $stmt = $this->db->prepare("UPDATE reflections SET title = ?, content = ?, mood = ? WHERE id = ? AND user_id = ?");
        return $stmt->execute([$title, $content, $mood, $id, $userId]);
    }

    public function delete($id, $userId) {
        $stmt = $this->db->prepare("DELETE FROM reflections WHERE id = ? AND user_id = ?");
        return $stmt->execute([$id, $userId]);
    }
}