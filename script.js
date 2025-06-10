let parkingData = [];
let currentIndex = 0;

const timeElement = document.getElementById('time-text');
const percentagesContainer = document.getElementById('zone-percentages');

fetch('data.json')
  .then(res => res.json())
  .then(data => {
    parkingData = data;
    updateDashboard();
    setInterval(updateDashboard, 1000);
  })
  .catch(err => console.error('Error cargando datos:', err));

function updateDashboard() {
  if (!parkingData.length) return;
  
  const currentData = parkingData[currentIndex];
  timeElement.textContent = currentData.hora;
  percentagesContainer.innerHTML = '';
  
  for (const zone in currentData.zonas) {
    const percentage = currentData.zonas[zone];
    const colorClass = getColorClass(percentage);
    
    const zoneElement = document.createElement('div');
    zoneElement.className = 'zone';
    zoneElement.style.position = 'relative';
    zoneElement.style.paddingBottom = '15px';
    zoneElement.innerHTML = `
      <span class="dot ${colorClass}"></span>
      <span class="zone-name">Zona ${zone}</span>
      <span class="zone-percent">${percentage}%</span>
      <div class="progress-bar">
        <div class="progress-fill ${colorClass}" style="width: ${percentage}%"></div>
      </div>
    `;
    percentagesContainer.appendChild(zoneElement);
  }
  
  currentIndex = (currentIndex + 1) % parkingData.length;
}

function getColorClass(percentage) {
  if (percentage >= 90) return 'red';
  if (percentage >= 60) return 'orange';
  return 'green';
}