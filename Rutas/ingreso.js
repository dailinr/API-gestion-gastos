const express = require("express");
const router = express.Router();

const ControladorIngreso = require("../Controladores/ingreso");
const Ingreso = require("../Modelos/Ingreso");

router.get("/prueba", ControladorIngreso.pruebaIngreso);
router.post("/add-ingreso", ControladorIngreso.guardar);
router.delete("/eliminar-ingreso/:id", ControladorIngreso.eliminar);


module.exports = router;