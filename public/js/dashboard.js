/* ============================================== */
/* ===== JS/DASHBOARD.JS (Update: Jadwal Generic) ===== */
/* ============================================== */

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

// --- (A) DATABASE REKOMENDASI (GENERIC) ---
const recommendationData = {
  'V': { // Aktivitas Visual
    title: "Visual",
    activities: [
      { title: 'Buat Mind Map Materi', description: 'Ambil satu bab materi pelajaran (apapun) dan buatkan peta konsep (mind map) visual.', duration: 45 },
      { title: 'Tonton Video Penjelasan', description: 'Cari video di YouTube/platform lain yang menjelaskan topik yang sedang Anda pelajari.', duration: 30 },
    ]
  },
  'A': { // Aktivitas Auditori
    title: "Auditori",
    activities: [
      { title: 'Jelaskan Materi (Teknik Feynman)', description: 'Coba jelaskan materi yang baru Anda pelajari kepada teman atau rekam suara Anda sendiri.', duration: 30 },
      { title: 'Cari Podcast/Audiobook', description: 'Temukan sumber belajar audio yang membahas topik pelajaran Anda.', duration: 45 },
    ]
  },
  'K': { // Aktivitas Kinestetik
    title: "Kinestetik",
    activities: [
      { title: 'Praktik Langsung / Latihan Soal', description: 'Kerjakan latihan soal atau proyek kecil yang berhubungan dengan materi (cth: coding, soal fisika).', duration: 60 },
      { title: 'Buat Catatan Sambil Bergerak', description: 'Gunakan sticky notes atau papan tulis besar untuk membuat catatan sambil berdiri atau berjalan.', duration: 30 },
    ]
  }
};

// --- (B) FUNGSI HELPER GOOGLE CALENDAR ---
function getAlternativeStyle(dominant) {
  if (dominant === 'V') return 'A';
  if (dominant === 'A') return 'K';
  if (dominant === 'K') return 'V';
  return 'A';
}
function getCalendarDate(dayOfWeek, weekOffset, hour, durationMinutes) {
  const now = new Date();
  const today = now.getDay();
  const targetDay = (dayOfWeek === 7) ? 0 : dayOfWeek; 
  let daysUntilTarget = (targetDay - today + 7) % 7;
  if (daysUntilTarget === 0) daysUntilTarget = 7;
  const dayOffset = daysUntilTarget + ((weekOffset - 1) * 7);
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, hour, 0, 0);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
  const toISOStringLocal = (date) => {
    const pad = (n) => (n < 10 ? '0' + n : n);
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  };
  return `${toISOStringLocal(startDate)}/${toISOStringLocal(endDate)}`;
}
function createCalendarLink(activity, weekOffset) {
  const dates = getCalendarDate(1, weekOffset, 19, activity.duration); // Senin, Jam 7 Malam
  const baseUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';
  const params = new URLSearchParams({
    'text': activity.title,
    'details': `${activity.description}\n\n(Aktivitas dari EduReflect)`,
    'dates': dates,
    'ctz': Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  return `${baseUrl}&${params.toString()}`;
}

// --- (C) FUNGSI UTAMA ---

document.addEventListener('DOMContentLoaded', () => {
  loadDashboardData();
  const logoutBtn = document.getElementById('logout-btn') || document.getElementById('logoutLink');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
});

async function loadDashboardData() {
  try {
    const [meResult, reflectionsResult, progressResult] = await Promise.all([
      apiFetch('/api/auth/me'),
      apiFetch('/api/reflections'),
      apiFetch('/api/progress')
    ]);

    populateUserAndStyle(meResult);
    populateReflections(reflectionsResult);
    populateProgress(progressResult);
    populateGameScore(meResult);
    populateSchedule(meResult);

  } catch (error) {
    console.error('Gagal memuat dashboard:', error.message);
    if (error.message.includes('Otentikasi') || error.message.includes('401')) {
      alert('Sesi Anda telah berakhir. Silakan login kembali.');
      window.location.href = 'login.html';
    } else {
      document.getElementById('userName').textContent = "Error";
      document.getElementById('totalReflections').textContent = "E";
      document.getElementById('learningStyle').textContent = "Error";
      document.getElementById('streak-value').textContent = "E";
    }
  }
}

function populateUserAndStyle(result) {
  if (result.status === 'success' && result.data.user) {
    const userName = Security.escapeOutput(result.data.user.name);
    document.getElementById('userName').textContent = userName;
    const styleEl = document.getElementById('learningStyle');
    if (result.data.quizResult) {
      const style = result.data.quizResult.dominant;
      let styleText = 'Belum diuji';
      if (style === 'V') styleText = 'Visual';
      if (style === 'A') styleText = 'Auditori';
      if (style === 'K') styleText = 'Kinestetik';
      styleEl.textContent = styleText;
    } else {
      styleEl.innerHTML = `<a href="learnstyle.html" style="font-size: 1.5rem; text-decoration: underline;">Ikuti Kuis</a>`;
    }
  }
}

function populateReflections(result) {
  if (result.status === 'success' && Array.isArray(result.data)) {
    document.getElementById('totalReflections').textContent = result.data.length;
  }
}

function populateProgress(result) {
  const streakEl = document.getElementById('streak-value');
  if (streakEl && result.status === 'success') {
    streakEl.textContent = result.data.streak || 0;
  }
}

function populateGameScore(result) {
  const gameScoreEl = document.getElementById('gameScore');
  if (gameScoreEl) {
    if (result.status === 'success' && result.data.user && result.data.user.game_highscore) {
      gameScoreEl.textContent = result.data.user.game_highscore;
    } else {
      gameScoreEl.textContent = 0;
    }
  }
}

function populateSchedule(meResult) {
  const scheduleBox = document.getElementById('schedule-box');
  const container = document.getElementById('dashboard-schedule-container');

  if (!meResult.data.quizResult) {
    scheduleBox.style.display = 'none'; 
    return;
  }

  const dominant = meResult.data.quizResult.dominant;
  
  if (!recommendationData[dominant]) {
      console.error("Gaya belajar tidak dikenal:", dominant);
      scheduleBox.style.display = 'none';
      return;
  }

  const dominantData = recommendationData[dominant];
  const altStyle = getAlternativeStyle(dominant);
  const altData = recommendationData[altStyle];

  const recDominant = dominantData.activities;
  const recAlternative = altData.activities;

  let rec1_html = '';
  recDominant.forEach((act) => {
    const gcalLink = createCalendarLink(act, 1); // Minggu 1
    rec1_html += `
      <li>
        <strong>${Security.escapeOutput(act.title)}</strong>
        <p>${Security.escapeOutput(act.description)}</p>
        <a href="${gcalLink}" target="_blank" class="gcal-link">
          + Tambah ke Kalender
        </a>
      </li>
    `;
  });

  let rec2_html = '';
  recAlternative.forEach((act) => {
    const gcalLink = createCalendarLink(act, 2); // Minggu 2
    rec2_html += `
      <li>
        <strong>${Security.escapeOutput(act.title)}</strong>
        <p>${Security.escapeOutput(act.description)}</p>
        <a href="${gcalLink}" target="_blank" class="gcal-link">
          + Tambah ke Kalender
        </a>
      </li>
    `;
  });

  container.innerHTML = `
    <div class="schedule-week">
      <h3>Minggu 1 (Gaya Dominan: ${dominantData.title})</h3>
      <ul>${rec1_html}</ul>
    </div>
    <div class="schedule-week">
      <h3>Minggu 2 (Gaya Alternatif: ${altData.title})</h3>
      <ul>${rec2_html}</ul>
    </div>
  `;
  
  scheduleBox.style.display = 'block';
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