// script.js
let data = [];
let currentIndex = 0;

fetch('data.json')
  .then(res => res.json())
  .then(json => {
    data = json;
    updateUI();
    setInterval(updateUI, 1000); // cada 2 minutos
  })
  .catch(err => console.error('Error cargando data.json:', err));

function updateUI() {
  if (!data.length) return;
  const entry = data[currentIndex];
  document.getElementById('simulated-time').textContent = `Hora: ${entry.hora}`;

  const container = document.getElementById('zone-percentages');
  container.innerHTML = ''; // limpia

  for (const zone in entry.zonas) {
    const percent = entry.zonas[zone];
    const colorClass = getColorClass(percent);

    const div = document.createElement('div');
    div.className = 'zone';
    div.innerHTML = `
      <span class="dot ${colorClass}"></span>
      <span class="zone-name">Zona ${zone}:</span>
      <span class="zone-percent">${percent}%</span>
    `;
    container.appendChild(div);
  }

  currentIndex = (currentIndex + 1) % data.length;
}

function getColorClass(p) {
  if (p >= 90) return 'red';
  if (p >= 60) return 'orange';
  return 'green';
}
