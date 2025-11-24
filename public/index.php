<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../db/Connection.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Security.php';
require_once __DIR__ . '/../middleware/Auth.php';
foreach (glob(__DIR__ . '/../api/models/*.php') as $filename) {
    require_once $filename;
}
foreach (glob(__DIR__ . '/../api/controllers/*.php') as $filename) {
    require_once $filename;
}

Auth::start_session();

try {
    $db = Connection::getInstance();
} catch (Exception $e) {
    Response::json_error('Koneksi server database gagal.', 503);
}

$method = $_SERVER['REQUEST_METHOD'];
$path = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$path = preg_replace('/^\/?public\//', '', $path);
$path_parts = explode('/', $path);

if ($path_parts[0] !== 'api') {
    Response::json_error('Endpoint API tidak ditemukan.', 404);
}

$controllerName = $path_parts[1] ?? null;
$param1 = $path_parts[2] ?? null; 
$param2 = $path_parts[3] ?? null;

try {
    switch ($controllerName) {
        case 'auth':
            $action = $param1; 
            $controller = new AuthController($db);
            if ($method === 'POST' && $action === 'register') $controller->register();
            elseif ($method === 'POST' && $action === 'login') $controller->login();
            elseif ($method === 'POST' && $action === 'logout') $controller->logout();
            elseif ($method === 'GET' && $action === 'me') $controller->me();
            elseif ($method === 'POST' && $action === 'profile') $controller->updateProfile();
            elseif ($method === 'PUT' && $action === 'gamescore') $controller->updateGameScore();
            else Response::json_error('Endpoint Auth tidak valid.', 404);
            break;

        case 'quiz':
            $action = $param1;
            $id = $param2;
            $controller = new QuizController($db);
            if ($method === 'GET' && $action === 'questions') $controller->getQuestions();
            elseif ($method === 'POST' && $action === 'submit') $controller->submitQuiz();
            elseif ($method === 'GET' && $action === 'result' && $id === 'last') $controller->getLastResult();
            else Response::json_error('Endpoint Quiz tidak valid.', 404);
            break;
            
        case 'reflections':
            $id = $param1;
            $controller = new ReflectionController($db);
            if ($method === 'GET' && $id === null) $controller->getAll();      
            elseif ($method === 'POST' && $id === null) $controller->create(); 
            elseif ($method === 'GET' && $id) $controller->getOne($id);           
            elseif ($method === 'PUT' && $id) $controller->update($id);           
            elseif ($method === 'DELETE' && $id) $controller->delete($id);        
            else Response::json_error('Endpoint Reflections tidak valid.', 404);
            break;
            
        case 'progress':
            $controller = new ProgressController($db);
            if ($method === 'GET' && $param1 === null) $controller->getSummary();
            else Response::json_error('Endpoint Progress tidak valid.', 404);
            break;

        case 'report':
            $action = $param1;
            $controller = new ReportController($db);
            if ($method === 'GET' && $action === 'summary') $controller->getSummary();
            else Response::json_error('Endpoint Report tidak valid.', 404);
            break;

        case 'badges':
            $action = $param1;
            $controller = new BadgeController($db);
            if ($method === 'GET' && $action === 'my') $controller->getMyBadges();
            else Response::json_error('Endpoint Badges tidak valid.', 404);
            break;

        case 'game':
            $action = $param1;
            $controller = new GameController($db);
            if ($method === 'GET' && $action === 'leaderboard') $controller->getLeaderboard();
            else Response::json_error('Endpoint Game tidak valid.', 404);
            break;

        case 'analytics':
            $action = $param1;
            $controller = new AnalyticsController($db);
            if ($method === 'GET' && $action === 'summary') $controller->getSummary();
            else Response::json_error('Endpoint Analytics tidak valid.', 404);
            break;

        default:
            Response::json_error('Endpoint API tidak dikenal.', 404);
    }
} catch (Exception $e) {
    Response::json_error('Terjadi kesalahan internal server: ' . $e->getMessage(), 500);
}