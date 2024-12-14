const express = require("express");
const router = express.Router();

const ControladorGasto = require("../Controladores/gasto");
const Gasto = require("../Modelos/Gasto");

router.get("/prueba", ControladorGasto.pruebaGasto);


module.exports = router;