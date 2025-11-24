<?php
class ReportController {
    private $db;
    private $userId;

    public function __construct(PDO $db) {
        Auth::requireLogin();
        $this->userId = Auth::currentUserId();
        $this->db = $db;
    }

    public function getSummary() {
        try {
            $userModel = new User($this->db);
            $quizModel = new Quiz($this->db);
            
            $reflectionModel = new UserReflection($this->db);
            
            $progressModel = new Progress($this->db);

            $user = $userModel->findById($this->userId);
            $lastQuiz = $quizModel->getLastResult($this->userId);
            $progress = $progressModel->getSummary($this->userId);
            
            $stmt = $this->db->prepare("SELECT COUNT(*) as total, AVG(CASE mood WHEN 'low' THEN 1 WHEN 'mid' THEN 2 WHEN 'high' THEN 3 ELSE 0 END) as avg_mood FROM reflections WHERE user_id = ? AND created_at >= CURDATE() - INTERVAL 30 DAY");
            $stmt->execute([$this->userId]);
            $reflectionStats = $stmt->fetch();

            $summary = [
                'user' => $user,
                'quizResult' => $lastQuiz,
                'progress' => $progress,
                'reflectionStats' => [
                    'total_30_days' => $reflectionStats['total'] ?? 0,
                    'avg_mood_score' => $reflectionStats['avg_mood'] ?? 0
                ]
            ];

            return Response::json_success('Ringkasan laporan diambil.', $summary);

        } catch (Exception $e) {
            return Response::json_error('Gagal mengambil laporan: ' . $e->getMessage(), 500);
        }
    }
}