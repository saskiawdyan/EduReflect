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
  loadReportPage();

  const printBtn = document.getElementById('printReport');
  if (printBtn) {
    printBtn.addEventListener('click', () => window.print()); 
  }

  const logoutBtn = document.getElementById('logoutLink');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
});

/**
 * Fungsi utama untuk memuat semua data di halaman laporan
 */
async function loadReportPage() {
  await Promise.all([
    loadReportSummary(),
    loadAllReflections()
  ]);
}

/**
 * Mengambil data ringkasan (Nama, Email, Skor) dari API
 */
async function loadReportSummary() {
  try {
    const result = await apiFetch('/api/report/summary');
    
    if (result.status !== 'success' || !result.data) {
      throw new Error(result.message || 'Data summary tidak ditemukan');
    }
    
    const data = result.data;

    if(data.user) {
      document.getElementById('report-name').textContent = Security.escapeOutput(data.user.name);
      document.getElementById('report-email').textContent = Security.escapeOutput(data.user.email);
    }
    
    if(data.quizResult) {
      let styleText = 'Belum diuji';
      const style = data.quizResult.dominant;
      if (style === 'V') styleText = 'Visual';
      if (style === 'A') styleText = 'Auditori';
      if (style === 'K') styleText = 'Kinestetik';
      document.getElementById('report-style').textContent = styleText;
    } else {
      document.getElementById('report-style').textContent = 'Belum diuji';
    }
    
    if(data.progress) {
      document.getElementById('report-streak').textContent = `${data.progress.streak || 0} Hari`;
    }

  } catch (error) {
    console.error("Gagal memuat summary:", error.message);
    document.getElementById('report-name').textContent = 'Error';
  }
}

async function loadAllReflections() {
  const reportList = document.getElementById('reportList');
  const emptyMsg = document.getElementById('emptyMsg');
  
  reportList.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Memuat daftar refleksi...</p>';

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
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
      
      let feedbackHtml = '';
      if (reflection.ai_feedback) { 
        feedbackHtml = `
          <div class="ai-box" style="margin-top: 1rem;">
            <h3>💡 Saran Sistem</h3> 
            <p>${Security.escapeOutput(reflection.ai_feedback)}</p>
          </div>
        `;
      }

      html += `
        <div class="report-item" id="reflection-${reflection.id}">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
            <div>
              <h3>${Security.escapeOutput(reflection.title)}</h3>
              <small>Mood: ${Security.escapeOutput(reflection.mood)} | ${date}</small>
            </div>
            <div class="report-item-actions no-print">
              <a href="reflection-edit.html?id=${reflection.id}" class="btn-secondary" title="Edit refleksi">Edit</a>
              <button class="btn-secondary btn-delete" data-id="${reflection.id}" title="Hapus refleksi">Hapus</button>
            </div>
          </div>
          <p style="margin-top: 0.75rem; white-space: pre-wrap;">${Security.escapeOutput(reflection.content)}</p>
          
          ${feedbackHtml} </div>
      `;
    });

    reportList.innerHTML = html;
    emptyMsg.style.display = 'none';
    
    addDeleteListeners();

  } catch (error) {
    reportList.innerHTML = `<p class="empty-msg" style="display: block; color: crimson;">❌ Gagal memuat data: ${error.message}</p>`;
    if (error.message.includes('Otentikasi')) {
      alert('Sesi Anda telah berakhir. Silakan login kembali.');
      window.location.href = 'login.html';
    }
  }
}

function addDeleteListeners() {
  const deleteButtons = document.querySelectorAll('.btn-delete');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', handleDeleteReflection);
  });
}

async function handleDeleteReflection(e) {
  const btn = e.target;
  const id = btn.dataset.id;

  if (!confirm('Anda yakin ingin menghapus refleksi ini?')) {
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Menghapus...';
  const item = document.getElementById(`reflection-${id}`);

  try {
    const result = await apiFetch(`/api/reflections/${id}`, {
      method: 'DELETE'
    });

    if (result.status === 'success') {
      item.style.transition = 'opacity 0.5s ease';
      item.style.opacity = '0';
      setTimeout(() => {
        item.remove();
        if (document.querySelectorAll('.report-item').length === 0) {
          document.getElementById('emptyMsg').style.display = 'block';
        }
      }, 500);
    } else {
      throw new Error(result.message);
    }

  } catch (error) {
    alert('Gagal menghapus refleksi: ' + error.message);
    btn.disabled = false;
    btn.textContent = 'Hapus';
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