<?php
class ProgressController {
    private $progressModel;
    private $userId;

    public function __construct(PDO $db) {
        Auth::requireLogin();
        $this->userId = Auth::currentUserId();
        $this->progressModel = new Progress($db);
    }

    public function getSummary() {
        try {
            $summary = $this->progressModel->getSummary($this->userId);
            return Response::json_success('Ringkasan progres diambil.', $summary);
        } catch (Exception $e) {
            return Response::json_error('Gagal mengambil progres: ' . $e->getMessage(), 500);
        }
    }
}