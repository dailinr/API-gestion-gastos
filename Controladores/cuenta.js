const Cuenta = require("../Modelos/Cuenta");
const Gasto = require("../Modelos/Gasto");

const pruebaCuenta = (req, res) => {
    return res.status(200).send({
        mensaje: "Prueba controlador de cuenta",
    });
}

const guardarCuenta = async(req, res) => {

    try {
        const nuevaCuenta = new Cuenta({
            semanal: 0,
            total: 0,
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

const calcularTotalSemanal = async (req, res) => {
    
    try {
        const fechaActual = new Date();

        // Buscar la cuenta que incluye la fecha actual
        const cuentaActual = await Cuenta.findOne({
            fechaInicial: { $lte: fechaActual },
            fechaFinal: { $gte: fechaActual },
        });

        if (!cuentaActual) {
            return res.status(404).json({
                status: "error",
                message: "No se encontró una cuenta para la semana actual",
            });
        }

        // Obtener los gastos asociados a esta cuenta
        const gastos = await Gasto.find({ cuenta: cuentaActual._id });

        // Calcular el total sumando los valores de los gastos
        const totalSemanal = gastos.reduce((suma, gasto) => suma + gasto.valor, 0);

        // Actualizar el total en la cuenta
        cuentaActual.total = totalSemanal;
        await cuentaActual.save();

        return res.status(200).json({
            status: "success",
            mensaje: "Total semanal calculado con éxito",
            cuenta: cuentaActual,
            totalSemanal,
            gastos,
        });
    } 
    catch (error) {
        return res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};


// Calcular el acumulado de todas las cuentas (semanas)
const calcularAcumulado = async (req, res) => {

    try {
        // Obtener todas las cuentas desde la base de datos
        const cuentas = await Cuenta.find();

        // Calcular el acumulado sumando los valores de "total" de todas las cuentas
        const acumulado = cuentas.reduce((suma, cuenta) => suma + cuenta.total, 0);

        return res.status(200).json({
            status: "success",
            mensaje: "Acumulado calculado con éxito",
            acumulado,
            cuentas,
        });
    } 
    catch (error) {
        return res.status(500).json({
            status: "error",
            mensaje: error.message,
        });
    }
};


module.exports = {
    pruebaCuenta,
    guardarCuenta,
    calcularTotalSemanal,
    calcularAcumulado
}