<?php
class QuizController {
    private $quizModel;

    public function __construct(PDO $db) {
        $this->quizModel = new Quiz($db);
    }

    public function getQuestions() {
        try {
            $questions = $this->quizModel->getAllQuestions();
            return Response::json_success('Pertanyaan berhasil diambil.', $questions);
        } catch (Exception $e) {
            return Response::json_error('Gagal mengambil pertanyaan: ' . $e->getMessage(), 500);
        }
    }

    public function getLastResult() {
        Auth::requireLogin();
        $userId = Auth::currentUserId();
        
        try {
            $result = $this->quizModel->getLastResult($userId);
            if (!$result) {
                return Response::json_error('Belum ada hasil kuis.', 404);
            }
            return Response::json_success('Hasil kuis terakhir diambil.', $result);
        } catch (Exception $e) {
            return Response::json_error('Gagal mengambil hasil kuis: ' . $e->getMessage(), 500);
        }
    }

    public function submitQuiz() {
        Auth::requireLogin();
        $userId = Auth::currentUserId();
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['answers']) || !is_array($data['answers'])) {
            return Response::json_error('Format jawaban tidak valid.', 422);
        }

        if (count($data['answers']) !== 12) {
             return Response::json_error('Harap jawab semua 12 pertanyaan.', 422);
        }

        $scores = ['V' => 0, 'A' => 0, 'K' => 0];
        $questionIds = array_column($data['answers'], 'question_id');
        
        try {
            $dimensions = $this->quizModel->getQuestionDimensions($questionIds);

            foreach ($data['answers'] as $answer) {
                $qId = $answer['question_id'];
                $value = intval($answer['value']);

                if ($value < 1 || $value > 5) {
                    return Response::json_error("Nilai tidak valid untuk pertanyaan $qId.", 422);
                }

                if (isset($dimensions[$qId])) {
                    $dim = $dimensions[$qId]; 
                    $scores[$dim] += $value;
                }
            }
            
            $sortedScores = $scores;
            arsort($sortedScores); 

            $dominant = key($sortedScores);

            if ($scores['V'] == $scores['A'] && $scores['A'] == $scores['K']) {
                $dominant = 'V'; // Atau 'ALL', tapi ENUM kita V,A,K
            }
            $resultId = $this->quizModel->saveResult($userId, $scores, $dominant);
            $result = $this->quizModel->getLastResult($userId); 

            return Response::json_success('Kuis berhasil disubmit!', $result, 201);

        } catch (Exception $e) {
            return Response::json_error('Gagal memproses kuis: ' . $e->getMessage(), 500);
        }
    }
}