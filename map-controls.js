
import { map, addMarker, markerLayer } from './map-config.js';

// Controle do painel lateral
const panelToggle = document.getElementById('panel-toggle');
const sidePanel = document.getElementById('side-panel');
const mapElement = document.getElementById('map');

panelToggle.addEventListener('click', () => {
    sidePanel.classList.toggle('open');
    mapElement.classList.toggle('map-with-panel-open');

    // Atualiza o tamanho do mapa (necessário para OpenLayers)
    setTimeout(() => {
        map.updateSize();
    }, 300); // Espera a transição CSS terminar
});



// Controles de zoom
document.getElementById('zoom-in').addEventListener('click', () => {
    const view = map.getView();
    view.setZoom(view.getZoom() + 1);
});

document.getElementById('zoom-out').addEventListener('click', () => {
    const view = map.getView();
    view.setZoom(view.getZoom() - 1);
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

// Adicionar marcador ao clicar
map.on('click', (evt) => {
    const coordinate = ol.proj.toLonLat(evt.coordinate);
    addMarker(coordinate);
    console.log(`Marcador adicionado em: ${coordinate[0].toFixed(4)}, ${coordinate[1].toFixed(4)}`);
});
// Variável para armazenar a última coordenada clicada
let lastRightClickCoordinate = null;

// Menu de contexto
const contextMenu = document.getElementById('context-menu');

// Mostrar menu ao clicar com botão direito
map.getViewport().addEventListener('contextmenu', (evt) => {
    evt.preventDefault();
    lastRightClickCoordinate = map.getEventCoordinate(evt);

    // Posiciona o menu no local do clique
    contextMenu.style.display = 'block';
    contextMenu.style.left = `${evt.clientX}px`;
    contextMenu.style.top = `${evt.clientY}px`;
});

// Fechar menu ao clicar em qualquer lugar
document.addEventListener('click', () => {
    contextMenu.style.display = 'none';
});

// Opção "Marcar local"
document.getElementById('mark-location').addEventListener('click', () => {
    if (lastRightClickCoordinate) {
        const coordinate = ol.proj.toLonLat(lastRightClickCoordinate);
        addMarker(coordinate);
    }
    contextMenu.style.display = 'none';
});

// Opção "Remover marcadores"
document.getElementById('remove-markers').addEventListener('click', () => {
    markerLayer.getSource().clear();
    contextMenu.style.display = 'none';
});

// Array para armazenar os marcadores
let markers = [];

// Função para atualizar a lista no painel
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

        // Adiciona evento para centralizar o marcador ao clicar
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('delete-marker')) {
                const view = map.getView();
                view.setCenter(ol.proj.fromLonLat(coord));
                view.setZoom(15);
            }
        });
    });

    // Adiciona eventos para os botões de deletar
    document.querySelectorAll('.delete-marker').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.getAttribute('data-id'));
            removeMarker(id);
        });
    });
}

// Função para remover marcador
function removeMarker(id) {
    const source = markerLayer.getSource();
    const feature = source.getFeatures().find(f => f.get('id') === id);

    if (feature) {
        source.removeFeature(feature);
        markers = markers.filter(m => m.get('id') !== id);
        updateMarkersList();
    }
}

// Modifique o evento de clique para atualizar a lista
map.on('click', (evt) => {
    const coordinate = ol.proj.toLonLat(evt.coordinate);
    const marker = addMarker(coordinate);
    markers.push(marker);
    updateMarkersList();
});

// Modifique a opção do menu de contexto
document.getElementById('mark-location').addEventListener('click', () => {
    if (lastRightClickCoordinate) {
        const coordinate = ol.proj.toLonLat(lastRightClickCoordinate);
        const marker = addMarker(coordinate);
        markers.push(marker);
        updateMarkersList();
    }
    contextMenu.style.display = 'none';
});