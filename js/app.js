const API_URL = 'http://localhost:5079/api/turnos';
const STORAGE_KEY = 'filacero_pendientes';

// Registrar Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker registrado:', reg.scope))
            .catch(err => console.error('Error al registrar Service Worker:', err));
    });
}

// Detección de red y sincronización offline
const networkStatusEl = document.getElementById('network-status');

async function sincronizarTurnosOffline() {
    const pendientes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    if (pendientes.length === 0) return;

    if (navigator.onLine) {
        console.log("Sincronizando turnos guardados offline...");
        for (let turno of pendientes) {
            try {
                await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(turno)
                });
            } catch (e) {
                console.error("Error al sincronizar turno pendiente:", e);
                return; // Si falla uno, detenemos para reintentar luego
            }
        }
        localStorage.removeItem(STORAGE_KEY);
        alert("¡Turnos guardados offline sincronizados con la nube exitosamente!");
        fetchTurnos();
    }
}

function updateNetworkStatus() {
    if (navigator.onLine) {
        networkStatusEl.textContent = '¡De nuevo en línea! Sincronizando datos...';
        networkStatusEl.className = 'network-status online';
        sincronizarTurnosOffline();
        setTimeout(() => {
            networkStatusEl.classList.add('hidden');
        }, 3000);
    } else {
        networkStatusEl.textContent = 'Sin conexión a internet. Los turnos se guardarán localmente.';
        networkStatusEl.className = 'network-status offline';
        networkStatusEl.classList.remove('hidden');
    }
}

window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);

if (!navigator.onLine) {
    updateNetworkStatus();
}

// Elementos DOM
const btnRefresh = document.getElementById('btn-refresh');
const turnosList = document.getElementById('turnos-list');
const loadingEl = document.getElementById('loading');
const turnoForm = document.getElementById('turno-form');
const tiempoEsperaEl = document.getElementById('tiempo-espera');

// Obtener y listar turnos + Calcular tiempo estimado
async function fetchTurnos() {
    loadingEl.classList.remove('hidden');
    turnosList.innerHTML = '';

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error al consultar la API');
        
        const data = await response.json();
        renderTurnos(data);
        calcularEstimacion(data);
    } catch (error) {
        console.error('Error fetching API:', error);
        // Si no hay red, intentamos mostrar lo que hay en localStorage o mensaje de error
        const pendientes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        if (pendientes.length > 0) {
            renderTurnos(pendientes);
            tiempoEsperaEl.textContent = `Modo Offline: Tienes ${pendientes.length} turno(s) pendientes por sincronizar.`;
        } else {
            turnosList.innerHTML = `<li class="turno-item" style="color: red;">No se pudieron obtener los datos de la red.</li>`;
            tiempoEsperaEl.textContent = 'Sin conexión disponible.';
        }
    } finally {
        loadingEl.classList.add('hidden');
    }
}

function renderTurnos(turnos) {
    if (!turnos || turnos.length === 0) {
        turnosList.innerHTML = '<li>No hay turnos registrados.</li>';
        return;
    }

    turnosList.innerHTML = turnos.map(t => `
        <li class="turno-item" style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #ddd;">
            <div>
                <strong>${t.numeroTurno || 'T-00'}</strong> - <span>${t.nombrePaciente || 'Paciente'}</span>
                <br><small class="text-muted">Motivo: ${t.motivoConsulta || 'N/A'}</small>
            </div>
            <div>
                <span class="badge">${t.nivelTriage || 'General'}</span> | 
                <small>${t.estado || 'En espera'}</small>
            </div>
        </li>
    `).join('');
}

// Calcular estimación de tiempo (Ej: 12 minutos por cada turno en espera)
function calcularEstimacion(turnos) {
    const enEspera = turnos.filter(t => t.estado === "En Espera" || !t.estado);
    const minutosPorTurno = 12;
    const tiempoTotalMinutos = enEspera.length * minutosPorTurno;

    if (enEspera.length === 0) {
        tiempoEsperaEl.textContent = "No hay fila de espera activa. ¡Atención inmediata!";
    } else {
        tiempoEsperaEl.innerHTML = `Hay <strong>${enEspera.length}</strong> paciente(s) adelante en la fila.<br> Tiempo de espera aproximado: <strong>~${tiempoTotalMinutos} minutos</strong>.`;
    }
}

// Manejar la creación de un nuevo turno (con soporte Offline)
turnoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nuevoTurno = {
        numeroTurno: "A-" + Math.floor(100 + Math.random() * 900),
        nombrePaciente: document.getElementById('nombrePaciente').value,
        motivoConsulta: document.getElementById('motivoConsulta').value,
        nivelTriage: document.getElementById('nivelTriage').value,
        estado: "En Espera"
    };

    if (navigator.onLine) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoTurno)
            });

            if (!response.ok) throw new Error('Error al registrar el turno');
            
            alert('¡Turno registrado exitosamente!');
            turnoForm.reset();
            fetchTurnos();
        } catch (error) {
            console.error('Error al enviar:', error);
            guardarOffline(nuevoTurno);
        }
    } else {
        guardarOffline(nuevoTurno);
    }
});

function guardarOffline(turno) {
    const pendientes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    pendientes.push(turno);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pendientes));
    alert('Sin conexión: Tu turno se ha guardado localmente y se enviará automáticamente cuando recuperes el internet.');
    turnoForm.reset();
    renderTurnos(pendientes);
    tiempoEsperaEl.textContent = "Modo Offline activo (Turno guardado localmente).";
}

btnRefresh.addEventListener('click', fetchTurnos);

// Carga inicial
fetchTurnos();