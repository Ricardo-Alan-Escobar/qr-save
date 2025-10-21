// bloqueo.js - Script de bloqueo de sesión con registro de accesos

/* Variables de control
let tiempoRestante = 60; // 60 segundos = 1 minuto
let temporizador;
let paginaBloqueada = false;
let contadorAccesos = 0;

// Crear el overlay de bloqueo dinámicamente
function crearOverlayBloqueo() {
    const overlay = document.createElement('div');
    overlay.id = 'blockedOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;
    
    overlay.innerHTML = `
        <div style="
            background: white;
            border-radius: 15px;
            padding: 40px;
            max-width: 500px;
            text-align: center;
            animation: slideIn 0.5s ease-out;
        ">
            <div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
            <h2 style="color: #e74c3c; margin-bottom: 20px; font-size: 32px;">Acceso Bloqueado</h2>
            <p style="color: #555; line-height: 1.8; margin-bottom: 15px;">
                <strong>Su sesión ha expirado por inactividad.</strong>
            </p>
            <p style="color: #555; line-height: 1.8; margin-bottom: 15px;">
                Esta página ha sido bloqueada debido a que transcurrió más de 1 minuto o cerró su sesión.
            </p>
            <p style="color: #e74c3c; font-weight: bold; margin-bottom: 15px;">
                ⚠️ ADVERTENCIA: Si intenta volver a ingresar, su acceso quedará registrado en el sistema.
            </p>
            <div style="
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                margin-top: 20px;
                font-size: 14px;
                color: #666;
            ">
                <strong>Registro de acceso:</strong><br>
                Fecha y hora: <span id="blockTime"></span><br>
                Intentos registrados: <span id="accessCount">0</span>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Agregar estilos de animación
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateY(-50px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    return overlay;
}

// Crear indicador de tiempo restante
function crearIndicadorTiempo() {
    const indicador = document.createElement('div');
    indicador.id = 'timerIndicator';
    indicador.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        font-family: 'Courier New', monospace;
        font-size: 18px;
        font-weight: bold;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        animation: fadeIn 0.5s ease-out;
    `;
    
    indicador.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 12px; margin-bottom: 5px;">Sesión expira en:</div>
            <div id="timer">01:00</div>
        </div>
    `;
    
    document.body.appendChild(indicador);
    
    // Agregar animación de fadeIn
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
    
    return indicador;
}

// Inicializar elementos
const blockedOverlay = crearOverlayBloqueo();
const timerIndicator = crearIndicadorTiempo();
const timerDisplay = document.getElementById('timer');
const blockTimeDisplay = document.getElementById('blockTime');
const accessCountDisplay = document.getElementById('accessCount');

// Datos de sesión
let sesionActual = {
    bloqueada: false,
    intentos: 0,
    fechaBloqueo: null
};

// Función para formatear el tiempo
function formatearTiempo(segundos) {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Función para actualizar el temporizador
function actualizarTemporizador() {
    if (tiempoRestante > 0 && !paginaBloqueada) {
        tiempoRestante--;
        timerDisplay.textContent = formatearTiempo(tiempoRestante);
        
        // Cambiar color cuando quede poco tiempo
        if (tiempoRestante <= 10) {
            timerIndicator.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
        }
    } else if (tiempoRestante === 0) {
        bloquearPagina();
    }
}

// Función para bloquear la página
function bloquearPagina() {
    if (paginaBloqueada) return;
    
    paginaBloqueada = true;
    clearInterval(temporizador);
    
    sesionActual.bloqueada = true;
    sesionActual.fechaBloqueo = new Date().toLocaleString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    sesionActual.intentos++;
    
    blockTimeDisplay.textContent = sesionActual.fechaBloqueo;
    accessCountDisplay.textContent = sesionActual.intentos;
    
    // Mostrar overlay
    blockedOverlay.style.display = 'flex';
    
    // Ocultar indicador de tiempo
    timerIndicator.style.display = 'none';
    
    // Deshabilitar scroll y interacciones
    document.body.style.overflow = 'hidden';
    document.body.style.pointerEvents = 'none';
    blockedOverlay.style.pointerEvents = 'auto';
    
    console.warn('⚠️ ADVERTENCIA: Página bloqueada. Acceso registrado.');
    console.log('Fecha de bloqueo:', sesionActual.fechaBloqueo);
    console.log('Intentos totales:', sesionActual.intentos);
}

// Detectar si el usuario está abandonando la página
window.addEventListener('beforeunload', function(e) {
    if (!paginaBloqueada) {
        bloquearPagina();
    }
});

// Detectar cambios de visibilidad (cambio de pestaña, minimizar)
document.addEventListener('visibilitychange', function() {
    if (document.hidden && !paginaBloqueada) {
        console.log('🔒 Usuario cambió de pestaña - sesión será bloqueada');
        bloquearPagina();
    }
});

// Registrar intentos de interacción después del bloqueo
blockedOverlay.addEventListener('click', function(e) {
    if (paginaBloqueada) {
        sesionActual.intentos++;
        accessCountDisplay.textContent = sesionActual.intentos;
        console.warn(`⚠️ Intento de acceso #${sesionActual.intentos} registrado - ${new Date().toLocaleString('es-MX')}`);
        
        // Efecto visual de advertencia
        const mensaje = e.target.closest('div > div');
        if (mensaje) {
            mensaje.style.animation = 'shake 0.5s';
            setTimeout(() => {
                mensaje.style.animation = '';
            }, 500);
        }
    }
});

// Agregar animación de shake
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(shakeStyle);

// Iniciar temporizador al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Sistema de bloqueo iniciado');
    console.log('⏱️ Tiempo límite: 60 segundos');
    temporizador = setInterval(actualizarTemporizador, 1000);
});

// Prevenir que el usuario recargue o use el historial
window.addEventListener('pageshow', function(event) {
    if (event.persisted || performance.getEntriesByType("navigation")[0].type === 'back_forward') {
        bloquearPagina();
    }
});

*/