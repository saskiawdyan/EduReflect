<?php
class GameController {
    private $db;
    private $userModel;

    public function __construct(PDO $db) {
        Auth::requireLogin(); 
        $this->db = $db;
        $this->userModel = new User($this->db);
    }

    public function getLeaderboard() {
        try {
            $scores = $this->userModel->getLeaderboard();
            return Response::json_success('Leaderboard berhasil diambil.', $scores);
        } catch (Exception $e) {
            return Response::json_error('Gagal mengambil leaderboard: ' . $e->getMessage(), 500);
        }
    }
}