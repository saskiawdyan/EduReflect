document.addEventListener('DOMContentLoaded', () => {
  loadQuestions();

  const quizForm = document.getElementById('quiz-form');
  quizForm.addEventListener('submit', handleSubmitQuiz);
});

async function loadQuestions() {
  const questionsContainer = document.getElementById('questions-container');
  try {
      const result = await apiFetch('/api/quiz/questions'); 
      const questions = result.data; 

      questionsContainer.innerHTML = ''; 
      questions.forEach(q => {
          const questionEl = document.createElement('div');
          questionEl.className = 'quiz-question';
          questionEl.innerHTML = `
              <p>${q.order_no}. ${Security.escapeOutput(q.text)}</p>
              <div class="likert-scale">
                  <label><input type="radio" name="q_${q.id}" value="1" required> 1</label>
                  <label><input type="radio" name="q_${q.id}" value="2"> 2</label>
                  <label><input type="radio" name="q_${q.id}" value="3"> 3</label>
                  <label><input type="radio" name="q_${q.id}" value="4"> 4</label>
                  <label><input type="radio" name="q_${q.id}" value="5"> 5</label>
              </div>
          `;
          questionsContainer.appendChild(questionEl);
      });

  } catch (error) {
      questionsContainer.innerHTML = `<p class="error">Gagal memuat pertanyaan: ${error.message}</p>`;
      if (error.message.includes('Otentikasi')) {
          window.location.href = 'login.html';
      }
  }
}

async function handleSubmitQuiz(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const answers = [];

  for (let [key, value] of formData.entries()) {
      if (key.startsWith('q_')) {
          const questionId = key.split('_')[1];
          answers.push({
              question_id: parseInt(questionId),
              value: parseInt(value)
          });
      }
  }

  if (answers.length < 12) {
      alert('Mohon jawab semua pertanyaan.');
      return;
  }

  try {
      const result = await apiFetch('/api/quiz/submit', {
          method: 'POST',
          body: { answers: answers } 
      });

      console.log('Kuis berhasil disubmit:', result.data);

      localStorage.setItem('quizResult', JSON.stringify(result.data));
      
      window.location.href = 'learnstyle-result.html';

  } catch (error) {
      alert(`Gagal submit kuis: ${error.message}`);
  }
}

const Security = {
  escapeOutput: (str) => {
      if (!str) return '';
      return str.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
  }
};