const recommendationData = {
  'V': { // Aktivitas Visual
    title: "Visual",
    icon: "👁️",
    desc: "Anda belajar paling baik dengan melihat. Diagram, infografis, dan video adalah sahabat Anda.",
    activities: [
      { title: 'Buat Mind Map Materi', description: 'Ambil satu bab materi pelajaran (apapun) dan buatkan peta konsep (mind map) visual.', duration: 45 },
      { title: 'Tonton Video Penjelasan', description: 'Cari video di YouTube/platform lain yang menjelaskan topik yang sedang Anda pelajari.', duration: 30 },
    ]
  },
  'A': { // Aktivitas Auditori
    title: "Auditori",
    icon: "🎧",
    desc: "Anda belajar paling baik dengan mendengar. Diskusi, penjelasan lisan, dan podcast sangat efektif untuk Anda.",
    activities: [
      { title: 'Jelaskan Materi (Teknik Feynman)', description: 'Coba jelaskan materi yang baru Anda pelajari kepada teman atau rekam suara Anda sendiri.', duration: 30 },
      { title: 'Cari Podcast/Audiobook', description: 'Temukan sumber belajar audio yang membahas topik pelajaran Anda.', duration: 45 },
    ]
  },
  'K': { // Aktivitas Kinestetik
    title: "Kinestetik",
    icon: "✋",
    desc: "Anda belajar paling baik dengan bergerak dan melakukan. Praktek langsung dan simulasi adalah kunci sukses Anda.",
    activities: [
      { title: 'Praktik Langsung / Latihan Soal', description: 'Kerjakan latihan soal atau proyek kecil yang berhubungan dengan materi (cth: coding, soal fisika).', duration: 60 },
      { title: 'Buat Catatan Sambil Bergerak', description: 'Gunakan sticky notes atau papan tulis besar untuk membuat catatan sambil berdiri atau berjalan.', duration: 30 },
    ]
  }
};

// Helper Keamanan Sederhana
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

// --- (B) FUNGSI HELPER (UNTUK GOOGLE CALENDAR) ---

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

// --- (C) FUNGSI UTAMA (RENDER) ---
document.addEventListener('DOMContentLoaded', () => {
  const resultContainer = document.getElementById('result-container');
  // Mengambil data dari localStorage (disimpan oleh learnstyle.html)
  const resultData = localStorage.getItem('quizResult');

  if (!resultData) {
    resultContainer.innerHTML = `
      <div class="result-header">
        <h2>Oops! Hasil Tidak Ditemukan</h2>
        <p class="muted">
          Anda harus menyelesaikan kuis terlebih dahulu.
        </p>
      </div>
      <div style="text-align: center; margin-top: 2rem;">
        <a href="learnstyle.html" class="btn-secondary">Mulai Kuis</a>
      </div>
    `;
    return;
  }

  const result = JSON.parse(resultData); // { dominant: 'V', score_v: ..., ... }
  const dominant = result.dominant;

  // Cek jika datanya valid
  if (!recommendationData[dominant]) {
      console.error("Gaya belajar tidak dikenal:", dominant);
      resultContainer.innerHTML = `<h2>Oops! Terjadi kesalahan saat memproses hasil kuis Anda.</h2>`;
      return;
  }

  // 1. Tentukan gaya & deskripsi
  const dominantData = recommendationData[dominant];
  const dominantStyleText = dominantData.title;
  const dominantIcon = dominantData.icon;
  const description = dominantData.desc;
  const dominantColorClass = dominant.toLowerCase(); // 'visual', 'auditory', 'kinesthetic'

  // 2. Dapatkan rekomendasi
  const altStyle = getAlternativeStyle(dominant);
  const altData = recommendationData[altStyle];
  const altStyleText = altData.title;
  
  const recDominant = dominantData.activities;
  const recAlternative = altData.activities;

  // 3. Hitung Persentase Progress Bar
  const totalScore = result.score_v + result.score_a + result.score_k;
  // (Pencegahan jika totalScore = 0 agar tidak 'NaN')
  const v_percent = totalScore === 0 ? 0 : (result.score_v / totalScore) * 100;
  const a_percent = totalScore === 0 ? 0 : (result.score_a / totalScore) * 100;
  const k_percent = totalScore === 0 ? 0 : (result.score_k / totalScore) * 100;

  // 4. Buat HTML untuk setiap rekomendasi
  let rec1_html = '';
  recDominant.forEach((act) => {
    const gcalLink = createCalendarLink(act, 1); // Minggu 1
    rec1_html += `
      <li>
        <strong>${Security.escapeOutput(act.title)}</strong>
        <p>${Security.escapeOutput(act.description)}</p>
        <a href="${gcalLink}" target="_blank" class="gcal-link">
          + Tambah ke Google Calendar
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
          + Tambah ke Google Calendar
        </a>
      </li>
    `;
  });
  
  // 5. Render HTML baru
  resultContainer.innerHTML = `
    <div class="result-header">
      <h2>Hasil Gaya Belajar Anda</h2>
      <p class="muted">Gaya belajar dominan Anda adalah:</p>
      
      <div class="dominant-badge ${dominantColorClass}">
        <span class="dominant-badge-icon">${dominantIcon}</span>
        <span>${Security.escapeOutput(dominantStyleText)} (${dominant})</span>
      </div>

      <p class="style-description">${Security.escapeOutput(description)}</p>
    </div>
    
    <div class="score-details-new">
      <div class="score-item-new" style="--delay: 0.2s;">
        <div class="score-label">
          <h4>Visual (V)</h4>
          <span class="visual">${result.score_v}</span>
        </div>
        <div class="score-bar-bg">
          <div class="score-bar-fill visual" style="width: 0%;"></div>
        </div>
      </div>
      <div class="score-item-new" style="--delay: 0.4s;">
        <div class="score-label">
          <h4>Auditori (A)</h4>
          <span class="auditory">${result.score_a}</span>
        </div>
        <div class="score-bar-bg">
          <div class="score-bar-fill auditory" style="width: 0%;"></div>
        </div>
      </div>
      <div class="score-item-new" style="--delay: 0.6s;">
        <div class="score-label">
          <h4>Kinestetik (K)</h4>
          <span class="kinesthetic">${result.score_k}</span>
        </div>
        <div class="score-bar-bg">
          <div class="score-bar-fill kinesthetic" style="width: 0%;"></div>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <div class="recommendation-grid">
      <div class="recommendation-week">
        <h3>Rekomendasi Minggu 1 (Gaya Dominan)</h3>
        <ul>${rec1_html}</ul>
      </div>
      <div class="recommendation-week">
        <h3>Rekomendasi Minggu 2 (Gaya Alternatif: ${Security.escapeOutput(altStyleText)})</h3>
        <ul>${rec2_html}</ul>
      </div>
    </div>
  `;
  
  // Memicu animasi bar setelah di-render
  setTimeout(() => {
      document.querySelector('.score-bar-fill.visual').style.width = `${v_percent}%`;
      document.querySelector('.score-bar-fill.auditory').style.width = `${a_percent}%`;
      document.querySelector('.score-bar-fill.kinesthetic').style.width = `${k_percent}%`;
  }, 100); // Beri jeda 100ms agar transisi CSS berjalan

  // 6. Hapus data dari localStorage
  localStorage.removeItem('quizResult');
});