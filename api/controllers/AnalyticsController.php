<?php
class AnalyticsController {
    private $db;
    private $userId;
    private $analyticsModel;
    private $progressModel;
    private $quizModel;

    public function __construct(PDO $db) {
        Auth::requireLogin();
        $this->db = $db;
        $this->userId = Auth::currentUserId();
        
        $this->analyticsModel = new Analytics($db);
        $this->progressModel = new Progress($db);
        $this->quizModel = new Quiz($db); 
    }

    public function getSummary() {
        try {
            $moodData = $this->analyticsModel->getMoodDistribution($this->userId);
            $weeklyData = $this->analyticsModel->getWeeklyReflectionCount($this->userId);
            $progressData = $this->progressModel->getSummary($this->userId);
            
            $quizResult = $this->quizModel->getLastResult($this->userId);

            $data = [
                'mood' => $moodData,
                'weekly' => $weeklyData,
                'progress' => $progressData,
                'quizResult' => $quizResult 
            ];

            return Response::json_success('Data analitik berhasil diambil.', $data);
        } catch (Exception $e) {
            return Response::json_error('Gagal mengambil data analitik: ' . $e->getMessage(), 500);
        }
    }
}