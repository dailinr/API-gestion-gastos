const express = require("express");
const router = express.Router();

const ControladorGasto = require("../Controladores/gasto");
const Gasto = require("../Modelos/Gasto");

router.get("/prueba", ControladorGasto.pruebaGasto);
router.post("/add-gasto", ControladorGasto.guardar);
router.delete("/eliminar-gasto/:id", ControladorGasto.eliminar);
router.put("/editar-gasto/:id", ControladorGasto.editar);

module.exports = router;