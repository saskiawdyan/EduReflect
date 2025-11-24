<?php
class ReflectionController {
    private $reflectionModel;
    private $progressModel;
    private $userId;
    private $db; 

    public function __construct(PDO $db) {
        Auth::requireLogin();
        $this->userId = Auth::currentUserId();
        $this->db = $db; 
        
        $this->reflectionModel = new UserReflection($db); 
        $this->progressModel = new Progress($db);
    }

    public function getAll() {
        try {
            $reflections = $this->reflectionModel->getAllByUser($this->userId);
            return Response::json_success('Semua refleksi diambil.', $reflections);
        } catch (Exception $e) { return Response::json_error('Gagal mengambil refleksi: ' . $e->getMessage(), 500); }
    }
    
    public function getOne($id) {
        try {
            $reflection = $this->reflectionModel->findById($id, $this->userId);
            if (!$reflection) { return Response::json_error('Refleksi tidak ditemukan.', 404); }
            return Response::json_success('Refleksi ditemukan.', $reflection);
        } catch (Exception $e) { return Response::json_error('Gagal mengambil refleksi: ' . $e->getMessage(), 500); }
    }

    private function getSystemFeedback($mood) {
        switch ($mood) {
            case 'high':
                return "Luar biasa! Senang melihatmu bersemangat. Apa yang bisa kamu lakukan untuk mempertahankan energi positif ini besok?";
            case 'mid':
                return "Refleksi yang bagus. Konsistensi adalah kunci. Apa satu hal kecil yang kamu pelajari tentang dirimu hari ini?";
            case 'low':
                return "Terima kasih sudah jujur. Perasaan 'low' itu wajar. Kerja bagus sudah melewatinya. Apa satu hal yang bisa membuat besok terasa sedikit lebih ringan?";
            default:
                return "Refleksi dicatat. Terus kembangkan kebiasaan baik ini!";
        }
    }

    public function create() {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['title']) || empty($data['content']) || empty($data['mood'])) {
            return Response::json_error('Judul, isi, dan mood wajib diisi.', 422);
        }
        if (!in_array($data['mood'], ['low', 'mid', 'high'])) {
             return Response::json_error('Mood tidak valid.', 422);
        }

        $title = Security::filterInput($data['title']);
        $content = Security::filterInput($data['content']);
        $mood = $data['mood'];

        try {
            $reflectionId = $this->reflectionModel->create($this->userId, $title, $content, $mood);
            
            $progressData = $this->progressModel->recordReflection($this->userId);
            
            $systemFeedback = $this->getSystemFeedback($mood);
            
            $this->reflectionModel->saveAIFeedback($reflectionId, $systemFeedback);

            $badgeModel = new Badge($this->db);
            $count = $this->reflectionModel->countByUser($this->userId);
            if ($count === 1) {
                $badgeModel->awardBadge($this->userId, 'first_reflection');
            }
            if ($progressData && $progressData['streak'] === 3) {
                 $badgeModel->awardBadge($this->userId, 'streak_3');
            }

            $newReflection = $this->reflectionModel->findById($reflectionId, $this->userId);
            return Response::json_success('Refleksi berhasil disimpan.', $newReflection, 201);
            
        } catch (Exception $e) {
            return Response::json_error('Gagal menyimpan refleksi: ' . $e->getMessage(), 500);
        }
    }

    public function update($id) {
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['title']) || empty($data['content']) || empty($data['mood'])) { return Response::json_error('Judul, isi, dan mood wajib diisi.', 422); }
        if (!in_array($data['mood'], ['low', 'mid', 'high'])) { return Response::json_error('Mood tidak valid.', 422); }
        $reflection = $this->reflectionModel->findById($id, $this->userId);
        if (!$reflection) { return Response::json_error('Refleksi tidak ditemukan atau Anda tidak punya akses.', 404); }
        $title = Security::filterInput($data['title']);
        $content = Security::filterInput($data['content']);
        try {
            $this->reflectionModel->update($id, $this->userId, $title, $content, $data['mood']);
            $updatedReflection = $this->reflectionModel->findById($id, $this->userId);
            return Response::json_success('Refleksi berhasil diupdate.', $updatedReflection);
        } catch (Exception $e) { return Response::json_error('Gagal mengupdate refleksi: ' . $e->getMessage(), 500); }
    }
    
    public function delete($id) {
        $reflection = $this->reflectionModel->findById($id, $this->userId);
        if (!$reflection) { return Response::json_error('Refleksi tidak ditemukan atau Anda tidak punya akses.', 404); }
        try {
            $this->reflectionModel->delete($id, $this->userId);
            return Response::json_success('Refleksi berhasil dihapus.');
        } catch (Exception $e) { return Response::json_error('Gagal menghapus refleksi: ' . $e->getMessage(), 500); }
    }
}