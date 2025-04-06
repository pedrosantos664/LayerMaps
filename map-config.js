// Configuração do mapa
export const map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([-47.8825, -15.7942]),
        zoom: 5
    })
});

// Camada de marcadores
export const markerLayer = new ol.layer.Vector({
    source: new ol.source.Vector()
});
map.addLayer(markerLayer);

// Array para armazenar os marcadores
export const markers = [];

// Função para adicionar marcador
export function addMarker(coordinate, name = `Ponto ${markers.length + 1}`) {
    const id = Date.now();

    const marker = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat(coordinate)),
        name: name,
        id: id
    });

    marker.setStyle(new ol.style.Style({
        image: new ol.style.Circle({
            radius: 6,
            fill: new ol.style.Fill({ color: 'red' }),
            stroke: new ol.style.Stroke({
                color: 'white', width: 2
            })
        })
    }));

    markerLayer.getSource().addFeature(marker);
    markers.push({ id, name, coordinate });
    return marker;
}

// Função para remover marcador
export function removeMarker(id) {
    const source = markerLayer.getSource();
    const feature = source.getFeatures().find(f => f.get('id') === id);

    if (feature) {
        source.removeFeature(feature);
        const index = markers.findIndex(m => m.id === id);
        if (index !== -1) {
            markers.splice(index, 1);
        }
    }
}