
const LIVE_JSON_FILE = 'data-tiempo-real.json';
// const LIVE_JSON_FILE = 'data-test-noche.json';

let liveData     = [];           
let timeSet      = new Set();    
let firstSlot    = null;        
let lastSlot     = null;         
let currentSlot  = '';           

let historyData  = [];          
let historyIndex = 0;

const timeEl          = document.getElementById('time-text');        
const updateTextEl    = document.getElementById('update-text');       
const percentagesEl   = document.getElementById('zone-percentages')

const calendarGrid    = document.getElementById('calendar-grid');     
const historyView     = document.getElementById('history-view');       
const historySlider   = document.getElementById('history-slider');      
const historyTimeText = document.getElementById('history-time-text');  
const historyPercentEl= document.getElementById('history-zone-percentages');

loadLiveData(LIVE_JSON_FILE);
buildCalendar();
initTabs();

function loadLiveData(file){
  fetch(file)
    .then(r => r.json())
    .then(data => {
      liveData    = data;
      timeSet     = new Set(data.map(d => d.hora));
      firstSlot   = data[0].hora;             
      lastSlot    = data[data.length-1].hora; 

      updateFromRealClock();                   
      setInterval(updateFromRealClock, 1000);  
    })
    .catch(err => console.error('Error cargando', file, err));
}

function pad(n){ return String(n).padStart(2,'0'); }

function updateFromRealClock(){
  const now   = new Date();
  const hm    = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  timeEl.textContent = hm;

  if (hm < firstSlot || hm > lastSlot) return;

  if (hm !== currentSlot && timeSet.has(hm)){
    const slotObj = liveData.find(d => d.hora === hm);
    if (slotObj){
      renderPercentages(slotObj.zonas, percentagesEl);
      currentSlot            = hm;
      updateTextEl.textContent = hm;  
    }
  }
}

function getColorClass(p){ return p>=90 ? 'red' : (p>=60 ? 'orange' : 'green'); }

function renderPercentages(zonasObj, container){
  container.innerHTML = '';
  for (const zona in zonasObj){
    const pct = zonasObj[zona];
    const col = getColorClass(pct);

    const div = document.createElement('div');
    div.className = 'zone';
    div.style.position = 'relative';
    div.innerHTML = `
      <span class="dot ${col}"></span>
      <span class="zone-name">Zona ${zona}</span>
      <span class="zone-percent">${pct}%</span>
      <div class="progress-bar">
        <div class="progress-fill ${col}" style="width:${pct}%"></div>
      </div>
    `;
    container.appendChild(div);
  }
}

function initTabs(){
  document.querySelectorAll('.tab-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      if(btn.classList.contains('active')) return;

      document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(btn.dataset.target).classList.add('active');
    });
  });
}

function buildCalendar(){
  const dias = ['Lunes','Martes','Miércoles','Jueves','Viernes'];

  dias.forEach(dia=>{
    const card = document.createElement('div');
    card.className = 'day-card';
    card.textContent = dia;
    calendarGrid.appendChild(card);
  });

  calendarGrid.addEventListener('click', e=>{
    const card = e.target.closest('.day-card');
    if(!card) return;
    selectDay(card);
  });
}

function selectDay(card){
  document.querySelectorAll('.day-card').forEach(c=>c.classList.remove('selected'));
  card.classList.add('selected');

  const file = `data-${card.textContent.toLowerCase()}.json`;
  fetch(file)
    .then(r => r.json())
    .then(data=>{
      historyData = data;
      historyIndex= 0;

      historySlider.max   = data.length - 1;
      historySlider.value = 0;
      historyView.classList.remove('hidden');
      updateHistoryDashboard();
    })
    .catch(err=>console.error('Error cargando datos historia:', err));
}

historySlider.addEventListener('input', ()=>{
  historyIndex = parseInt(historySlider.value, 10);
  updateHistoryDashboard();
});

function updateHistoryDashboard(){
  if(!historyData.length) return;
  const d = historyData[historyIndex];
  historyTimeText.textContent = d.hora;
  renderPercentages(d.zonas, historyPercentEl);
}
