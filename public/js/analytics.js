
const BG_COLOR_DARK = '#0a0a14';
const BG_COLOR_LIGHT = '#f9fafb';

const chartColors = {
  light: {
    text: '#111827',
    grid: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    text: '#e0e4f0',
    grid: 'rgba(90, 137, 254, 0.2)',
  },
  v: '#f97316', 
  a: '#34D399', 
  k: '#8B5CF6', 

  high: 'rgb(52, 211, 153)', 
  mid: 'rgb(90, 137, 254)', 
  low: 'rgb(239, 68, 68)',  
};

document.addEventListener('DOMContentLoaded', () => {
  loadAnalyticsData();

  const logoutBtn = document.getElementById('logoutLink');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
});

async function loadAnalyticsData() {
  try {
    const result = await apiFetch('/api/analytics/summary');
    if (result.status !== 'success') throw new Error(result.message);
    
    const data = result.data;
    
    populateKPIs(data);
    
    createMoodChart(data.mood);
    createWeeklyChart(data.weekly);
    createVAKChart(data.quizResult); 
    
  } catch (error) {
    console.error("Gagal memuat analitik:", error.message);
    document.querySelector('.analytics-section .report-header p').textContent = `❌ Gagal memuat data: ${error.message}`;
  }
}

async function populateKPIs(data) {
  if (data.progress) {
    document.getElementById('kpi-streak').textContent = data.progress.streak || 0;
  }
  if (data.mood) {
    let total = data.mood.reduce((acc, item) => acc + parseInt(item.count, 10), 0);
    document.getElementById('kpi-total').textContent = total;
  }
  
  try {
    const meResult = await apiFetch('/api/auth/me');
    if(meResult.data.user && meResult.data.user.game_highscore) {
      document.getElementById('kpi-highscore').textContent = meResult.data.user.game_highscore;
    } else {
      document.getElementById('kpi-highscore').textContent = 0;
    }
  } catch(e) {
    document.getElementById('kpi-highscore').textContent = 'N/A';
  }
}

function createMoodChart(moodData) {
  const ctx = document.getElementById('moodChart');
  if (!ctx || !moodData || moodData.length === 0) {
    ctx.parentElement.innerHTML = '<h3>Distribusi Mood</h3><p class="muted" style="text-align: center;">Belum ada data mood.</p>';
    return;
  }

  const theme = document.body.classList.contains('dark') ? chartColors.dark : chartColors.light;
  
  const labels = moodData.map(item => {
    if (item.mood === 'high') return 'Positif';
    if (item.mood === 'mid') return 'Netral';
    if (item.mood === 'low') return 'Negatif';
  });
  const data = moodData.map(item => item.count);
  const colors = moodData.map(item => {
    if (item.mood === 'high') return chartColors.high;
    if (item.mood === 'mid') return chartColors.mid;
    if (item.mood === 'low') return chartColors.low;
  });

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        label: 'Distribusi Mood',
        data: data,
        backgroundColor: colors,
        borderColor: document.body.classList.contains('dark') ? BG_COLOR_DARK : BG_COLOR_LIGHT,
        borderWidth: 4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top', labels: { color: theme.text } }
      }
    }
  });
}

function createWeeklyChart(weeklyData) {
  const ctx = document.getElementById('weeklyChart');
  if (!ctx) return;

  const theme = document.body.classList.contains('dark') ? chartColors.dark : chartColors.light;
  
  const labels = [];
  const dataPoints = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateString = d.toISOString().split('T')[0]; 
    labels.push(d.toLocaleDateString('id-ID', { weekday: 'short' })); 
    
    const dayData = weeklyData.find(item => item.day === dateString);
    dataPoints.push(dayData ? parseInt(dayData.count, 10) : 0);
  }

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Jumlah Refleksi',
        data: dataPoints,
        backgroundColor: document.body.classList.contains('dark') ? 'var(--accent)' : 'var(--primary)',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: theme.text, stepSize: 1 },
          grid: { color: theme.grid }
        },
        x: {
          ticks: { color: theme.text },
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

function createVAKChart(quizResult) {
  const ctx = document.getElementById('vakChart');
  if (!ctx) return;
  
  if (!quizResult) {
    ctx.parentElement.innerHTML = '<h3>Distribusi Skor VAK</h3><p class="muted" style="text-align: center;">Anda belum mengambil kuis VAK.</p>';
    return;
  }

  const theme = document.body.classList.contains('dark') ? chartColors.dark : chartColors.light;

  const data = {
    labels: [
      `Visual (${quizResult.score_v})`,
      `Auditori (${quizResult.score_a})`,
      `Kinestetik (${quizResult.score_k})`
    ],
    datasets: [{
      label: 'Distribusi Skor',
      data: [
        quizResult.score_v,
        quizResult.score_a,
        quizResult.score_k
      ],
      backgroundColor: [
        chartColors.v,
        chartColors.a,
        chartColors.k
      ],
      borderColor: document.body.classList.contains('dark') ? BG_COLOR_DARK : BG_COLOR_LIGHT,
      borderWidth: 4
    }]
  };

  new Chart(ctx, {
    type: 'doughnut',
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: { color: theme.text, font: { size: 14 } }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
                let label = context.label || '';
                if (label) {
                    label = label.split('(')[0];
                }
                if (context.parsed !== null) {
                    label += ': ' + context.parsed;
                }
                return label;
            }
          }
        }
      }
    }
  });
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