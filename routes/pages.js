const express = require("express")
const router = express.Router(); 
/* GET home page. */
router.get("/", (req, res) => {
    const date = new Date(); 
    res.render("index");
})
router.get("/map", (req, res) => { res.render("index") })
 

module.exports = router;