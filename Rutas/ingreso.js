const express = require("express");
const router = express.Router();

const ControladorIngreso = require("../Controladores/ingreso");
const Ingreso = require("../Modelos/Ingreso");

router.get("/prueba", ControladorIngreso.pruebaIngreso);


module.exports = router;