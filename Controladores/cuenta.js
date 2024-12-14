const Cuenta = require("../Modelos/Cuenta");

const pruebaCuenta = (req, res) => {
    return res.status(200).send({
        mensaje: "Prueba controlador de cuenta",
    });
}

module.exports = {
    pruebaCuenta
}