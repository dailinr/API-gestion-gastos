const Ingreso = require("../Modelos/Ingreso");

const pruebaIngreso = (req, res) => {
    return res.status(200).send({
        mensaje: "Prueba controlador de ingresos",
    });
}

module.exports = {
    pruebaIngreso
}