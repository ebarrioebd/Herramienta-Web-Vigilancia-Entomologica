//configuracion de mapa1
console.log("maps_config.js")
//mapa agrear capas y un selector
var map = L.map('map_c1', {
    center: [16.9077743, -99.8276894],
    zoom: 15,
});
var mapCSVInter = L.map('map_c2', {
    center: [16.9077743, -99.8276894],
    zoom: 12,
});
var maxZoom = 20, minZoom = 5;
mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';

 L.control.scale({ metric: true, imperial: false }).addTo(mapCSVInter);

var capaOSM = new L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: minZoom,
    maxZoom: maxZoom,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
});
var satellite = new L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    minZoom: minZoom,
    maxZoom: maxZoom,
    //attribution: '&copy; ' + mapLink + ' Contributors',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});
var sat_text = new L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
    minZoom: minZoom,
    maxZoom: maxZoom,
    //attribution: '&copy; ' + mapLink + ' Contributors',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});
var roadmap = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    minZoom: minZoom,
    maxZoom: maxZoom,
    attribution: '&copy; ' + mapLink + ' Contributors',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});
var line = turf.lineString([[-99.8589592, 16.8926019], [-99.8388648, 16.937438],
[-99.7857949, 16.9098479], [-99.8204879, 16.8661551], [-99.8496849, 16.8822536]]);
var bbox = turf.bbox(line);
//console.log("BBox",bbox)
var urlWMS = "https://www.gits.igg.unam.mx/wmsproxy/wms?service=WMS&version=1.1.0&request=GetMap&layers=GITS:u_territorial_colonias_inegi_2010&styles=&bbox=-118.566139221191,14.4411649703979,-86.5519180297852,32.8095855712891&width=575&height=330&srs=EPSG:4326&format=image/png";
var colonias = new L.TileLayer.WMS('https://www.gits.igg.unam.mx/wmsproxy/wms', {
    layers: 'GITS:u_territorial_colonias_inegi_2010',
    format: 'image/png',
    transparent: true,
    cql_filter: "cvegeoedo==12 AND cvegeomuni==12001",
    //bbox:bbox[0]+','+bbox[1]+','+bbox[2]+','+bbox[3],
    //cql_filter:'(geom+IS+NOT+NULL+AND+l_room+IS+NOT+NULL+AND+BBOX(geom,'+bbox[0]+','+bbox[1]+','+bbox[2]+','+bbox[3]+'))',
    version: '1.1.0',
    crs: L.CRS.EPSG4326
})
var capasBase = {
    "colonias": colonias, 
    "sat_text": sat_text
};
var capasBaseCSV = {
    "colonias": colonias,
    "satelite": satellite
}
sat_text.addTo(map)
satellite.addTo(mapCSVInter)
var selectorCapas = new L.control.layers(capasBase);
selectorCapas.addTo(map);

var selectorCapasCSV = new L.control.layers(capasBaseCSV)
selectorCapasCSV.addTo(mapCSVInter);
//fin de la seccion del mapa

/*Añadir controlles para remover o agreagar los marcadores en el mapa*/
botonesControl = L.control({ position: 'bottomleft' }); ////_________var gloval_________
botonesControl.onAdd = function () {                     // creación de los botones
    var botones = L.DomUtil.create('div', 'class-css-botonesMAP');
    botones.innerHTML = `<button id="agregar-marcadoresMAP" >Mostrar marcadores</button>`;
    botones.innerHTML += `<button id="remover-marcadoresMAP" >Ocultar marcadores</button>`;
    return botones;
};

botonesControl.addTo(map);
document.getElementById('agregar-marcadoresMAP').addEventListener('click', function () {
    console.log("AddMArker Map")
    groupMakers.addTo(map)
})
document.getElementById('remover-marcadoresMAP').addEventListener('click', function () {
    console.log("Close Markers Map")
    groupMakers.remove();
});
//botones para ocultar y mostrar en mapa de CSV
const botonesControlCSV = L.control({ position: 'bottomleft' });
const botonesControlInfo = L.control({ position: 'topright' });
const botonesControlRango = L.control({ position: 'topleft' });
botonesControlRango.onAdd = function () { // creación de los botones
    const botones = L.DomUtil.create('div', 'class-css-botones');
    botones.innerHTML = "<div style='color: black;background:#34c234b5'>Porcentaje Bajo</div><div style='color: black;background:#d3d331b5'>Porcentaje Medio</div><div style='color: black;background:#ff0000b5'>Porcentaje Alto</div>"
    return botones;
};

botonesControlCSV.onAdd = function () { // creación de los botones
    const botones = L.DomUtil.create('div', 'class-css-botonesMAP');
    botones.innerHTML = `<button  id="agregar-marcadoresCSV"  >Mostrar Marcadores</button>`;
    botones.innerHTML += `<button  id="remover-marcadoresCSV" >Ocultar Marcadores</button>`;
    return botones;
};
botonesControlCSV.addTo(mapCSVInter); // adición del contenedor dentro del mapa
