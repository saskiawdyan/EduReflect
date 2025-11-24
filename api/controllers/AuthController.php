<?php
class AuthController {
    private $userModel;
    private $db; 

    public function __construct(PDO $db) {
        $this->userModel = new User($db);
        $this->db = $db; 
    }

    public function register() {
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
            return Response::json_error('Semua field (nama, email, password) wajib diisi.', 422);
        }
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return Response::json_error('Format email tidak valid.', 422);
        }
        if (strlen($data['password']) < 8) {
            return Response::json_error('Password minimal 8 karakter.', 422);
        }
        if ($this->userModel->findByEmail($data['email'])) {
            return Response::json_error('Email sudah terdaftar.', 409);
        }
        $name = Security::filterInput($data['name']);
        $email = $data['email'];
        $password = $data['password'];
        try {
            $userId = $this->userModel->create($name, $email, $password);
            $user = $this->userModel->findById($userId);
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user'] = $user; 
            return Response::json_success('Registrasi berhasil!', ['user' => $user], 201);
        } catch (Exception $e) {
            return Response::json_error('Gagal mendaftarkan pengguna: ' . $e->getMessage(), 500);
        }
    }
    public function login() {
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['email']) || empty($data['password'])) {
            return Response::json_error('Email dan password wajib diisi.', 422);
        }
        $user = $this->userModel->findByEmail($data['email']);
        if (!$user || !password_verify($data['password'], $user['password_hash'])) {
            return Response::json_error('Email atau password salah.', 401);
        }
        session_regenerate_id(true); 
        $_SESSION['user_id'] = $user['id'];
        $userData = $this->userModel->findById($user['id']);
        $_SESSION['user'] = $userData;
        $quizModel = new Quiz($this->db); 
        $lastQuiz = $quizModel->getLastResult($user['id']);
        return Response::json_success('Login berhasil!', [ 'user' => $userData, 'hasQuizResult' => (bool)$lastQuiz ]);
    }
    public function logout() {
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params["path"], $params["domain"], $params["secure"], $params["httponly"]);
        }
        session_destroy();
        return Response::json_success('Logout berhasil.');
    }
    public function me() {
        Auth::requireLogin(); 
        $user = Auth::currentUser();
        if ($user) {
            $userData = $this->userModel->findById($user['id']);
            $quizModel = new Quiz($this->db);
            $lastQuiz = $quizModel->getLastResult($user['id']);
            return Response::json_success('Data user diambil.', [ 'user' => $userData, 'quizResult' => $lastQuiz ]);
        }
        return Response::json_error('User tidak ditemukan.', 404);
    }

    public function updateProfile() {
        Auth::requireLogin();
        $userId = Auth::currentUserId();
        
        if (empty($_POST['name'])) {
            return Response::json_error('Nama tidak boleh kosong.', 422);
        }

        $name = Security::filterInput($_POST['name']);
        $bio = Security::filterInput($_POST['bio'] ?? null); 
        $avatar_url = null; 

        try {
            if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
                $file = $_FILES['avatar'];
                $file_name = $file['name'];
                $file_tmp = $file['tmp_name'];
                $file_size = $file['size'];
                
                $file_ext_raw = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
                $allowed_ext = ['jpg', 'jpeg', 'png', 'webp'];
                
                if (!in_array($file_ext_raw, $allowed_ext)) {
                     return Response::json_error('Format file tidak valid (Hanya JPG, PNG, WEBP).', 422);
                }

                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $mime_type = finfo_file($finfo, $file_tmp);
                finfo_close($finfo);
                
                $allowed_mime_types = ['image/jpeg', 'image/png', 'image/webp'];
                if (!in_array($mime_type, $allowed_mime_types)) {
                    return Response::json_error('Tipe file tidak valid.', 422);
                }

                if ($file_size > 2097152) {
                    return Response::json_error('File terlalu besar (Max 2MB).', 422);
                }

                $upload_dir = __DIR__ . '/../../public/uploads/avatars/';
                if (!is_dir($upload_dir)) {
                    mkdir($upload_dir, 0775, true);
                }
                
                $new_file_name = 'user_' . $userId . '_' . time() . '.' . $file_ext_raw;
                $destination = $upload_dir . $new_file_name;

                if (move_uploaded_file($file_tmp, $destination)) {
                    $avatar_url = 'uploads/avatars/' . $new_file_name;
                } else {
                    return Response::json_error('Gagal memindahkan file.', 500);
                }
            }
            $this->userModel->updateProfileData($userId, $name, $bio, $avatar_url);
            
            $updatedUser = $this->userModel->findById($userId);
            $_SESSION['user'] = $updatedUser; 
            
            return Response::json_success('Profil berhasil diperbarui.', ['user' => $updatedUser]);
            
        } catch (Exception $e) {
            return Response::json_error('Gagal memperbarui profil: ' . $e->getMessage(), 500);
        }
    }

    public function updateGameScore() {
        Auth::requireLogin();
        $userId = Auth::currentUserId();
        
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['score'])) {
            return Response::json_error('Skor tidak ditemukan.', 422);
        }

        $newScore = (int)$data['score'];

        try {
            $isUpdated = $this->userModel->updateGameScore($userId, $newScore);
            
            if ($isUpdated && $newScore >= 1000) { 
                $badgeModel = new Badge($this->db);
                $badgeModel->awardBadge($userId, 'tetris_master');
            }
            return Response::json_success('Skor berhasil dikirim.');
        } catch (Exception $e) {
            return Response::json_error('Gagal mengirim skor: ' . $e->getMessage(), 500);
        }
    }
}