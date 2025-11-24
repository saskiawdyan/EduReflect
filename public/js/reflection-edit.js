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
    const reflectionForm = document.getElementById('reflectionEditForm'); 
    const statusMessage = document.getElementById('statusMessage');
  
    const urlParams = new URLSearchParams(window.location.search);
    const reflectionId = urlParams.get('id');
  
    if (!reflectionId) {
      statusMessage.textContent = '❌ ID refleksi tidak valid.';
      statusMessage.style.color = 'crimson';
      return;
    }
  
    loadReflectionData(reflectionId);
  
    reflectionForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSaveReflection(reflectionId);
    });
  
    const logoutBtn = document.getElementById('logoutLink');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }
  });
  
  async function loadReflectionData(id) {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.textContent = 'Memuat data refleksi...';
    statusMessage.style.color = 'var(--text-muted)';
  
    try {
      const result = await apiFetch(`/api/reflections/${id}`);
  
      if (result.status === 'success' && result.data) {
        const data = result.data;
        document.getElementById('title').value = data.title; 
        document.getElementById('content').value = data.content;
        document.getElementById('mood').value = data.mood;
        statusMessage.textContent = '';
      } else {
        throw new Error(result.message || 'Data tidak ditemukan');
      }
  
    } catch (error) {
      statusMessage.textContent = `❌ Gagal memuat data: ${error.message}`;
      statusMessage.style.color = 'crimson';
      if (error.message.includes('Otentikasi')) {
        window.location.href = 'login.html';
      }
    }
  }
  
  async function handleSaveReflection(id) {
    const form = document.getElementById('reflectionEditForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries()); 
    
    const submitBtn = document.getElementById('submitBtn');
    const statusMessage = document.getElementById('statusMessage');
  
    submitBtn.disabled = true;
    submitBtn.textContent = 'Menyimpan...';
    statusMessage.textContent = '';
    statusMessage.style.color = 'var(--accent)';
  
    try {
      const result = await apiFetch(`/api/reflections/${id}`, {
        method: 'PUT',
        body: data
      });
  
      if (result.status === 'success') {
        statusMessage.textContent = '✅ Refleksi berhasil diperbarui!';
        
        setTimeout(() => {
          window.location.href = 'report.html';
        }, 2000);
  
      } else {
        throw new Error(result.message);
      }
  
    } catch (error) {
      statusMessage.textContent = `❌ Gagal menyimpan: ${error.message}`;
      statusMessage.style.color = 'crimson';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Simpan Perubahan';
    }
  }
  
  async function handleLogout(e) {
    e.preventDefault();
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
      window.location.href = 'login.html';
    } catch (error) {
      console.error('Logout Gagal:', error.message);
    }
  }