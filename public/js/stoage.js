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
  loadAllReflections();

  const printBtn = document.getElementById('printReport');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print(); 
    });
  }

  const logoutBtn = document.getElementById('logoutLink');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
});


async function loadAllReflections() {
  const reportList = document.getElementById('reportList');
  const emptyMsg = document.getElementById('emptyMsg');
  
  reportList.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Memuat data refleksi...</p>';

  try {
    const result = await apiFetch('/api/reflections');

    if (result.status !== 'success' || !Array.isArray(result.data)) {
      throw new Error(result.message || 'Format data tidak valid');
    }

    if (result.data.length === 0) {
      reportList.innerHTML = '';
      emptyMsg.style.display = 'block';
      return;
    }

    let html = '';
    result.data.forEach(reflection => {
      const date = new Date(reflection.created_at).toLocaleString('id-ID', {
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      html += `
        <div class="report-item">
          <h3>${Security.escapeOutput(reflection.title)}</h3>
          <small>Mood: ${Security.escapeOutput(reflection.mood)} | ${date}</small>
          <p>${Security.escapeOutput(reflection.content)}</p>
        </div>
      `;
    });

    reportList.innerHTML = html; 
    emptyMsg.style.display = 'none'; 

  } catch (error) {
    reportList.innerHTML = `<p class="empty-msg" style="display: block; color: crimson;">❌ Gagal memuat data: ${error.message}</p>`;
    
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
  }
}