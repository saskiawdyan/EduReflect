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

document.addEventListener('DOMContentLoaded', () => {
  const reflectionForm = document.getElementById('reflectionForm');
  if (reflectionForm) {
    reflectionForm.addEventListener('submit', handleSaveReflection);
  }
  
  const logoutBtn = document.getElementById('logoutLink');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
});

async function handleSaveReflection(e) {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  
  const submitBtn = document.getElementById('submitBtn');
  const statusMessage = document.getElementById('statusMessage');
  const aiSuggestionBox = document.getElementById('aiSuggestion');
  const aiSuggestionText = document.getElementById('suggestionText');

  submitBtn.disabled = true;
  submitBtn.textContent = 'Menyimpan...';
  statusMessage.textContent = '';
  aiSuggestionBox.style.display = 'none'; 

  try {
    const result = await apiFetch('/api/reflections', {
      method: 'POST',
      body: data
    });

    if (result.status === 'success') {
      statusMessage.textContent = '✅ Refleksi berhasil disimpan!';
      form.reset(); 

      if (result.data.ai_feedback) { 
        aiSuggestionBox.querySelector('h3').textContent = '💡 Saran Sistem'; 
        aiSuggestionText.textContent = Security.escapeOutput(result.data.ai_feedback);
        aiSuggestionBox.style.display = 'block'; 
      }
      
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 5833);

    } else {
      throw new Error(result.message);
    }

  } catch (error) {
    statusMessage.textContent = `❌ Gagal menyimpan: ${error.message}`;
    statusMessage.style.color = 'crimson'; 
    submitBtn.disabled = false;
    submitBtn.textContent = 'Simpan Refleksi';

    if (error.message.includes('Otentikasi') || error.message.includes('401')) {
      alert('Sesi Anda telah berakhir. Silakan login kembali.');
      window.location.href = 'login.html';
    }
  }
}


async function handleLogout(e) {
  e.preventDefault();
  try {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    window.location.href = 'login.html'; 
  } catch (error) {
    console.error('Logout Gagal:', error.message);
    alert('Gagal logout, silakan coba lagi.');
  }
}