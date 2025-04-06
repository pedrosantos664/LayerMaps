import { map, addMarker, markerLayer, markers, removeMarker } from './map-config.js';

// Elementos da UI
const panelToggle = document.getElementById('panel-toggle');
const sidePanel = document.getElementById('side-panel');
const mapElement = document.getElementById('map');
const contextMenu = document.getElementById('context-menu');
let lastRightClickCoordinate = null;

// Controle do painel lateral
panelToggle.addEventListener('click', () => {
    sidePanel.classList.toggle('open');
    mapElement.classList.toggle('map-with-panel-open');
    updateMarkersList(); // Atualiza a lista ao abrir o painel

    setTimeout(() => {
        map.updateSize();
    }, 300);
});

// Controles de zoom
document.getElementById('zoom-in').addEventListener('click', () => {
    map.getView().setZoom(map.getView().getZoom() + 1);
});

document.getElementById('zoom-out').addEventListener('click', () => {
    map.getView().setZoom(map.getView().getZoom() - 1);
});

// Centralizar mapa
document.getElementById('center-map').addEventListener('click', () => {
    map.getView().setCenter(ol.proj.fromLonLat([-47.8825, -15.7942]));
    map.getView().setZoom(5);
});

// Exibir coordenadas
map.on('pointermove', (evt) => {
    const coordinate = ol.proj.toLonLat(evt.coordinate);
    document.getElementById('coordinates').innerHTML =
        `Longitude: ${coordinate[0].toFixed(4)}<br>Latitude: ${coordinate[1].toFixed(4)}`;
});

// Menu de contexto
map.getViewport().addEventListener('contextmenu', (evt) => {
    evt.preventDefault();
    lastRightClickCoordinate = map.getEventCoordinate(evt);
    contextMenu.style.display = 'block';
    contextMenu.style.left = `${evt.clientX}px`;
    contextMenu.style.top = `${evt.clientY}px`;
});

document.addEventListener('click', () => {
    contextMenu.style.display = 'none';
});

// Adicionar marcadores
map.on('click', (evt) => {
    const coordinate = ol.proj.toLonLat(evt.coordinate);
    addMarker(coordinate);
    updateMarkersList();
});

document.getElementById('mark-location').addEventListener('click', () => {
    if (lastRightClickCoordinate) {
        const coordinate = ol.proj.toLonLat(lastRightClickCoordinate);
        addMarker(coordinate);
        updateMarkersList();
    }
    contextMenu.style.display = 'none';
});

// Função para atualizar a lista de marcadores
function updateMarkersList() {
    const listContainer = document.getElementById('markers-list');

    if (markers.length === 0) {
        listContainer.innerHTML = '<p class="empty-message">Nenhum ponto marcado ainda</p>';
        return;
    }

    listContainer.innerHTML = '';
    markers.forEach((marker, index) => {
        const coord = marker.get('coord');
        const item = document.createElement('div');
        item.className = 'marker-item';
        item.innerHTML = `
            <span>Ponto ${index + 1}</span>
            <span class="delete-marker" data-id="${marker.get('id')}">×</span>
            <div class="marker-coords">
                Lon: ${coord[0].toFixed(4)}, Lat: ${coord[1].toFixed(4)}
            </div>
        `;
        listContainer.appendChild(item);

        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('delete-marker')) {
                map.getView().setCenter(ol.proj.fromLonLat(coord));
                map.getView().setZoom(15);
            }
        });

        document.querySelectorAll('.delete-marker').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeMarker(parseInt(btn.getAttribute('data-id')));
                updateMarkersList();
            });
        });
    });
}