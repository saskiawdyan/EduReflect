<?php
class Response {
    public static function json_error($message, $statusCode = 400, $data = []) {
        http_response_code($statusCode);
        echo json_encode(['status' => 'error', 'message' => $message, 'data' => $data]);
        exit;
    }

    public static function json_success($message, $data = [], $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode(['status' => 'success', 'message' => $message, 'data' => $data]);
        exit;
    }
}