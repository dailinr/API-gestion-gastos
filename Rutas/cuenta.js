const express = require("express");
const router = express.Router();

const ControladorCuenta = require("../Controladores/cuenta");
const Cuenta = require("../Modelos/Cuenta");

router.get("/prueba", ControladorCuenta.pruebaCuenta);
router.get("/add-cuenta", ControladorCuenta.guardarCuenta);


module.exports = router;