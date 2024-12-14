const Gasto = require("../Modelos/Gasto");

const pruebaGasto = (req, res) => {
    return res.status(200).send({
        mensaje: "Prueba controlador de gastos",
    });
}

module.exports = {
    pruebaGasto
}