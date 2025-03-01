const express = require('express');
const loadjson = express.Router(); 
const fs = require("fs");
 
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
loadjson.get("/info_colonias_acapulco_inegi_2010", async (req, res) => {
    console.log("info_colonias_acapulco_inegi_2010")
    const infoColoniasAcapulco = fs.readFileSync('./files/nom_id_colonias1.json');
    let jsonInfoCol = JSON.parse(infoColoniasAcapulco);
    let ordColonias = jsonInfoCol.nombres_col.sort(GetSortOrder("nombre_colonia"));
    console.log("ordColonias.length::",ordColonias.length) 
    res.render("colonias_inf",{ordColonias:JSON.stringify(ordColonias)})
})


module.exports = loadjson;