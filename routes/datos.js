const express = require('express');
const router = express.Router();
const dat = require("../controlls/dataControlls");


router.post("/map", dat.loadColonias)
//filtrar zonas
router.post("/getZona", dat.getColJSON); 

router.get("/info",(req,res)=>{res.render("info_zona")})
router.post("/serverAct",(req,res)=>{
	console.log("Server actualizado......")
})
module.exports = router;