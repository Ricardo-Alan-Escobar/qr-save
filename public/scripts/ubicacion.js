window.addEventListener('DOMContentLoaded', () => {
  const ubicacion = document.getElementById('ubicacion');
  const botonCompartir = document.getElementById('compartirUbicacion');
  
  // Cargar Leaflet si no está disponible
  if (!window.L) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    document.head.appendChild(link);
    
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    script.onload = initGeolocation;
    document.head.appendChild(script);
  } else {
    initGeolocation();
  }
  
  function initGeolocation() {
    if (navigator.geolocation) {
      ubicacion.textContent = "Solicitando ubicación...";
      
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          
          // Crear contenedor del mapa
          ubicacion.innerHTML = '<div id="mapa" style="width: 100%; height: 300px; border-radius: 8px; margin-bottom: 10px;"></div>';
          
          // Inicializar mapa
          const map = L.map('mapa').setView([lat, lon], 18);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
          }).addTo(map);
          
          // Agregar marcador
          L.marker([lat, lon], {
            title: 'Tu ubicación'
          }).addTo(map).bindPopup(`<strong>Ubicación de emergencia</strong><br>Lat: ${lat.toFixed(4)}<br>Lon: ${lon.toFixed(4)}`).openPopup();
          
          // Agregar círculo de precisión
          const precision = pos.coords.accuracy;
          L.circle([lat, lon], precision, {
            color: '#667eea',
            fillColor: '#667eea',
            fillOpacity: 0.1,
            weight: 2
          }).addTo(map);
          
          // Configurar botón compartir
          botonCompartir.addEventListener('click', async () => {
            const enlace = `https://maps.google.com/?q=${lat},${lon}`;
            
            if (navigator.share) {
              await navigator.share({
                title: 'Emergencia - Ubicación del siniestro',
                text: 'Emergencia médica: Juan Pérez necesita ayuda en esta ubicación.',
                url: enlace
              });
            } else {
              navigator.clipboard.writeText(enlace);
              alert('Ubicación copiada al portapapeles.');
            }
          });
        },
        (error) => {
          let mensaje = "No se pudo obtener la ubicación.";
          
          if (error.code === error.PERMISSION_DENIED) {
            mensaje = "Permiso denegado. Por favor, habilita la geolocalización en tu navegador.";
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            mensaje = "La posición no está disponible.";
          } else if (error.code === error.TIMEOUT) {
            mensaje = "La solicitud de ubicación expiró. Intenta de nuevo.";
          }
          
          ubicacion.textContent = mensaje;
          console.error('Error de geolocalización:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      ubicacion.textContent = "Geolocalización no compatible con este dispositivo.";
    }
  }
});