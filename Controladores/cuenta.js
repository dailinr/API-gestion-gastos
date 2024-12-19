const Cuenta = require("../Modelos/Cuenta");

const pruebaCuenta = (req, res) => {
    return res.status(200).send({
        mensaje: "Prueba controlador de cuenta",
    });
}

const guardarCuenta = async(req, res) => {

    try {
        const nuevaCuenta = new Cuenta({
            semanal: 500,
            total: 69800,
        });

        await nuevaCuenta.save();
        

        return res.status(200).send({
            status: "success",
            mensaje: "ruta de guardar cuenta",
            cuenta: nuevaCuenta,
        });
    } 
    catch (error) {
        return res.status(500).send({
            status: "error",
            mensaje: error.message
        })    
    }
        
}

module.exports = {
    pruebaCuenta,
    guardarCuenta
}