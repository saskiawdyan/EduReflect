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
  const profileForm = document.getElementById('profileForm');
  const logoutBtn = document.getElementById('logoutLink');
  const avatarInput = document.getElementById('avatarInput');
  const avatarPreview = document.getElementById('avatarPreview');

  loadProfileData();
  loadBadges();

  if (profileForm) {
    profileForm.addEventListener('submit', handleSaveProfile);
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  if (avatarInput && avatarPreview) {
    avatarInput.addEventListener('change', () => {
      const file = avatarInput.files[0];
      if (file) {
        avatarPreview.src = URL.createObjectURL(file);
      }
    });
  }
});

async function loadProfileData() {
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const styleInput = document.getElementById('learningStyle');
  const bioInput = document.getElementById('bio');
  const avatarPreview = document.getElementById('avatarPreview');
  const statusMessage = document.getElementById('statusMessage');

  statusMessage.textContent = 'Memuat data...';

  try {
    const result = await apiFetch('/api/auth/me'); 

    if (result.status === 'success' && result.data.user) {
      const { user, quizResult } = result.data;
      
      nameInput.value = user.name || '';
      emailInput.value = user.email || '';
      bioInput.value = user.bio || '';

      if (user.avatar_url) {
        avatarPreview.src = user.avatar_url + '?t=' + new Date().getTime();
      } else {
        avatarPreview.src = 'assets/default-avatar.png'; 
      }

      if (quizResult) {
        let styleText = 'Belum diuji';
        const style = quizResult.dominant;
        if (style === 'V') styleText = 'Visual';
        if (style === 'A') styleText = 'Auditori';
        if (style === 'K') styleText = 'Kinestetik';
        styleInput.value = styleText;
      } else {
        styleInput.value = 'Belum mengikuti kuis';
      }
      
      statusMessage.textContent = ''; 

    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    statusMessage.textContent = `❌ Gagal memuat profil: ${error.message}`;
    statusMessage.style.color = 'crimson';
    if (error.message.includes('Otentikasi')) {
      window.location.href = 'login.html';
    }
  }
}

async function loadBadges() {
  const container = document.getElementById('badge-grid-container');
  try {
    const result = await apiFetch('/api/badges/my'); 
    
    if (result.status === 'success' && Array.isArray(result.data)) {
      if (result.data.length === 0) {
        container.innerHTML = '<p class="muted" style="text-align: center; grid-column: 1 / -1;">Belum ada lencana yang didapat. Ayo mainkan game dan tulis refleksi!</p>';
        return;
      }
      
      let html = '';
      result.data.forEach(badge => {
        html += `
          <div class="badge-item">
            <span class="badge-icon">${Security.escapeOutput(badge.icon_emoji)}</span>
            <div class="badge-info">
              <h4>${Security.escapeOutput(badge.name)}</h4>
              <p>${Security.escapeOutput(badge.description)}</p>
            </div>
          </div>
        `;
      });
      container.innerHTML = html;

    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    container.innerHTML = `<p class="muted" style="text-align: center; color: crimson;">Gagal memuat lencana.</p>`;
  }
}

async function handleSaveProfile(e) {
  e.preventDefault();
  
  const name = document.getElementById('name').value;
  const bio = document.getElementById('bio').value;
  const avatarFile = document.getElementById('avatarInput').files[0];
  
  const submitBtn = document.getElementById('saveProfileBtn');
  const statusMessage = document.getElementById('statusMessage');

  const formData = new FormData();
  formData.append('name', name);
  formData.append('bio', bio);
  if (avatarFile) {
    formData.append('avatar', avatarFile);
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Menyimpan...';
  statusMessage.textContent = '';
  statusMessage.style.color = 'var(--accent)';

  try {
    const response = await fetch('/api/auth/profile', {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();

    if (response.ok && result.status === 'success') {
      statusMessage.textContent = '✅ Profil berhasil diperbarui!';
      
      if(result.data.user.avatar_url) {
         document.getElementById('avatarPreview').src = result.data.user.avatar_url + '?t=' + new Date().getTime();
      }
    } else {
      throw new Error(result.message || 'Gagal menyimpan');
    }

  } catch (error) {
    statusMessage.textContent = `❌ Gagal menyimpan: ${error.message}`;
    statusMessage.style.color = 'crimson';
  } finally {
    setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = '💾 Simpan Perubahan';
        statusMessage.textContent = '';
    }, 2000);
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