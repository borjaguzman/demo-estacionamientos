let liveData = [];
let liveIndex = 0;

let historyData = [];          
let historyIndex = 0;

const timeEl           = document.getElementById('time-text');
const percentagesEl    = document.getElementById('zone-percentages');

const calendarGrid     = document.getElementById('calendar-grid');     
const historyView      = document.getElementById('history-view');      
const historySlider    = document.getElementById('history-slider');    
const historyTimeText  = document.getElementById('history-time-text'); 
const historyPercentEl = document.getElementById('history-zone-percentages'); 

fetch('data.json')
  .then(res => res.json())
  .then(data => {
    liveData = data;
    updateLiveDashboard();
    setInterval(updateLiveDashboard, 1000);
  })
  .catch(err => console.error('Error cargando datos tiempo real:', err));

buildCalendar();

function updateLiveDashboard() {
  if (!liveData.length) return;

  const currentData = liveData[liveIndex];
  timeEl.textContent = currentData.hora;
  renderPercentages(currentData.zonas, percentagesEl);

  liveIndex = (liveIndex + 1) % liveData.length;
}

function getColorClass(pct) {
  if (pct >= 90) return 'red';
  if (pct >= 60) return 'orange';
  return 'green';
}

function renderPercentages(zonasObj, container) {
  container.innerHTML = '';
  for (const zona in zonasObj) {
    const pct  = zonasObj[zona];
    const col  = getColorClass(pct);

    const zoneDiv = document.createElement('div');
    zoneDiv.className = 'zone';
    zoneDiv.style.position = 'relative';

    zoneDiv.innerHTML = `
      <span class="dot ${col}"></span>
      <span class="zone-name">Zona ${zona}</span>
      <span class="zone-percent">${pct}%</span>
      <div class="progress-bar"><div class="progress-fill ${col}" style="width:${pct}%"></div></div>
    `;
    container.appendChild(zoneDiv);
  }
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.classList.contains('active')) return;

    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));

    btn.classList.add('active');
    document.getElementById(btn.dataset.target).classList.add('active');
  });
});

function buildCalendar() {
  const diasES = ['Lunes','Martes','Miércoles','Jueves','Viernes'];

  diasES.forEach((dia, idx) => {
    const card = document.createElement('div');
    card.className = 'day-card';
    card.textContent = dia;
    card.dataset.dayId = idx;
    calendarGrid.appendChild(card);
  });

  calendarGrid.addEventListener('click', e => {
    const card = e.target.closest('.day-card');
    if (!card) return;
    selectDay(card);
  });
}

function selectDay(card) {
  document.querySelectorAll('.day-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');

  const dayName = card.textContent.toLowerCase();
  fetch(`data-${dayName}.json`)
    .then(res => res.json())
    .then(data => {
      historyData  = data;
      historyIndex = 0;

      historySlider.max   = historyData.length - 1;
      historySlider.value = 0;
      historySlider.step  = 1;

      historyView.classList.remove('hidden');
      updateHistoryDashboard();
    })
    .catch(err => console.error('Error cargando datos historia:', err));
}

historySlider.addEventListener('input', () => {
  historyIndex = parseInt(historySlider.value, 10);
  updateHistoryDashboard();
});

function updateHistoryDashboard() {
  if (!historyData.length) return;

  const data = historyData[historyIndex];
  historyTimeText.textContent = data.hora;
  renderPercentages(data.zonas, historyPercentEl);
}
