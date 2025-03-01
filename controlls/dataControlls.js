const fs = require("fs")
var _ = require("underscore");
//variables
const zonasAca = fs.readFileSync('./files/acapulco_colonias.json');
let jsonZonaAca = JSON.parse(zonasAca); 
async function loadColonias(req, res) { 
    let rawdata = fs.readFileSync('./files/nom_id_colonias.json');
    let nom_col = JSON.parse(rawdata);
    let ordJson = nom_col.nombres_col.sort(GetSortOrder("nombre_colonia"));
    res.send(ordJson);
    //res.render('ajax', { zonasT: ordJson });
}
async function getColJSON(req, res) {
    console.log("rgetZonaArraygid:", req.body.gid)
    let filtrado = _.filter(jsonZonaAca.features, function (item, index) { return _.contains(jsonAarray(req.body.gid), item.id); });
    
    console.log(".." + filtrado.length)
    res.send({ zona: filtrado })
}
//Comparer Function    
function GetSortOrder(prop) {
    return function (a, b) {
        if (a[prop] > b[prop]) {
            return 1;
        } else if (a[prop] < b[prop]) {
            return -1;
        }
        return 0;
    }
}
//convertit json a un arreglo
function jsonAarray(json_) {
    let a = []
    for (let i in json_) {
        a.push('u_territorial_colonias_inegi_2010.' + json_[i])
    }
    return a;
}
module.exports = { loadColonias, getColJSON}