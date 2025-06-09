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
  container.innerHTML = ''; // Clear previous content

  for (const zone in entry.zonas) {
    const percent = entry.zonas[zone];
    const colorClass = getBootstrapColorClass(percent); // Updated function

    const progressBar = document.createElement('div');
    progressBar.className = 'zone-progress mb-3';
    
    progressBar.innerHTML = `
      <div class=" align-items-center">
        <span class="zone-name me-2">Zona ${zone}:</span>
        <div class="progress " style="height: 20px;">
          <div class="progress-bar ${colorClass}" 
               role="progressbar" 
               style="width: ${percent}%" 
               aria-valuenow="${percent}" 
               aria-valuemin="0" 
               aria-valuemax="100"> ${percent}%
          </div>
        </div>
      </div>
    `;
    
    container.appendChild(progressBar);
  }

  currentIndex = (currentIndex + 1) % data.length;
}

// Updated to return Bootstrap color classes
function getBootstrapColorClass(p) {
  if (p >= 90) return 'bg-danger';
  if (p >= 60) return 'bg-warning';
  return 'bg-success';
}
