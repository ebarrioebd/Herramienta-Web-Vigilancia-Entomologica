console.log("Variables.js")
console.time("t:variable.js:")
//Marcadores para los puntos de csv o bd
var markers = [] //new Array(); 
var groupMakers = L.layerGroup(markers);
var markersCSV = [];
var groupMakersCSV = L.layerGroup(markersCSV);
var groupCircleCSV = L.layerGroup(markersCSV);
var circlesCSV = [];
//variables para los datos descriptivos
var nombres_de_colonias = []
var cantidad_h_de_cada_colonia = []
var cantidad_ovi_de_cada_colonia = []
var gid_de_cada_colonnia = []; 

var bPreguntar = true;

window.onbeforeunload = preguntarAntesDeSalir;

function preguntarAntesDeSalir() {
    var respuesta;

    if (bPreguntar) {
        respuesta = confirm('¿Seguro que quieres salir?');

        if (respuesta) {
            window.onunload = function () {
                return true;
            }
        } else {
            return false;
        }
    }
}
console.timeEnd("t:variable.js:")