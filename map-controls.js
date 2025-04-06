import { map, addMarker, markerLayer, markers, removeMarker } from './map-config.js';

// Elementos da UI

const panelToggle = document.getElementById('panel-toggle');
const sidePanel = document.getElementById('side-panel');
const contextMenu = document.getElementById('context-menu');
const nameModal = document.getElementById('name-modal');
const markerNameInput = document.getElementById('marker-name');
const saveNameBtn = document.getElementById('save-name');
const cancelNameBtn = document.getElementById('cancel-name');
const closeModal = document.querySelector('.close-modal');

// Variáveis de estado
let lastRightClickCoordinate = null;
let pendingCoordinate = null;


// Controle do painel lateral
panelToggle.addEventListener('click', () => {
    sidePanel.classList.toggle('open');
    map.updateSize();
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

// Fechar menu ao clicar em qualquer lugar
document.addEventListener('click', (evt) => {
    if (!contextMenu.contains(evt.target)) {
        contextMenu.style.display = 'none';
    }
});

// Modal para nomear pontos
function openNameModal(coordinate) {
    pendingCoordinate = coordinate;
    markerNameInput.value = `Ponto ${markers.length + 1}`;
    nameModal.style.display = 'block';
    markerNameInput.focus(); // Foca automaticamente no input
}


function closeNameModal() {
    nameModal.style.display = 'none';
    pendingCoordinate = null;
    markerNameInput.value = '';
}

closeModal.addEventListener('click', closeNameModal);
cancelNameBtn.addEventListener('click', closeNameModal);
saveNameBtn.addEventListener('click', () => {
    if (pendingCoordinate) {
        const name = markerNameInput.value.trim() || `Ponto ${markers.length + 1}`;
        addMarker(pendingCoordinate, name);
        updateMarkersList();
        closeNameModal();
    }
});

// Adicionar marcadores
map.on('click', (evt) => {
    const coordinate = ol.proj.toLonLat(evt.coordinate);
    openNameModal(coordinate);
});

document.getElementById('mark-location').addEventListener('click', () => {
    if (lastRightClickCoordinate) {
        const coordinate = ol.proj.toLonLat(lastRightClickCoordinate);
        openNameModal(coordinate);
    }
    contextMenu.style.display = 'none';
});

// Atualizar lista de marcadores
function updateMarkersList() {
    const listContainer = document.getElementById('markers-list');
    listContainer.innerHTML = '';

    if (markers.length === 0) {
        listContainer.innerHTML = '<p class="empty-message">Nenhum ponto marcado ainda</p>';
        return;
    }

    markers.forEach(marker => {
        const item = document.createElement('div');
        item.className = 'marker-item';
        item.innerHTML = `
            <span>${marker.name}</span>
            <span class="delete-marker" data-id="${marker.id}">×</span>
            <div class="marker-coords">
                Lon: ${marker.coordinate[0].toFixed(4)}, Lat: ${marker.coordinate[1].toFixed(4)}
            </div>
        `;
        listContainer.appendChild(item);

        // Centralizar ao clicar no item
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('delete-marker')) {
                map.getView().setCenter(ol.proj.fromLonLat(marker.coordinate));
                map.getView().setZoom(15);
            }
        });

        // Deletar marcador
        item.querySelector('.delete-marker').addEventListener('click', (e) => {
            e.stopPropagation();
            removeMarker(marker.id);
            updateMarkersList();
        });
    });
}

// Inicialização
updateMarkersList();