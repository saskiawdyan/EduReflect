<?php
class BadgeController {
    private $db;
    private $badgeModel;
    private $userId;

    public function __construct(PDO $db) {
        Auth::requireLogin();
        $this->db = $db;
        $this->userId = Auth::currentUserId();
        $this->badgeModel = new Badge($this->db);
    }

    public function getMyBadges() {
        try {
            $badges = $this->badgeModel->getBadgesByUserId($this->userId);
            return Response::json_success('Lencana berhasil diambil.', $badges);
        } catch (Exception $e) {
            return Response::json_error('Gagal mengambil lencana: ' . $e->getMessage(), 500);
        }
    }
}