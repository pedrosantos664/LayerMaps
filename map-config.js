// Configuração principal do mapa
export const map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([-47.8825, -15.7942]), // Brasília
        zoom: 5
    })
});

// Camada para marcadores
export const markerLayer = new ol.layer.Vector({
    name: 'markers',
    source: new ol.source.Vector(),
    zIndex: 10
});
map.addLayer(markerLayer);

// Função para adicionar marcador
export function addMarker(coordinate) {
    const marker = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat(coordinate))
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
}

export function addMenuMarker(coordinate, id = Date.now()) {
    const marker = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat(coordinate)),
        id: id,
        coord: coordinate
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
    return marker;
}