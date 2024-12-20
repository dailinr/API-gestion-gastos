const Cuenta = require("../Modelos/Cuenta");
const Gasto = require("../Modelos/Gasto");
const Ingreso = require("../Modelos/Ingreso");

const pruebaCuenta = (req, res) => {
    
    return res.status(200).send({
        mensaje: "Prueba controlador de cuenta",
    });
}

const guardarCuenta = async(req, res) => {

    try {
        const fechaActual = new Date();

        // Buscar la cuenta que incluye la fecha actual
        const cuentaActual = await Cuenta.findOne({
            fechaInicial: { $lte: fechaActual },
            fechaFinal: { $gte: fechaActual },
        });

        if(!cuentaActual){

            // Si no existe la cuenta, crear una nueva
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
        else{
            return res.status(400).send({
                status: "error",
                mensaje: "esta semana ya tiene una cuenta creada"
            }) 
        }
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

        // Obtener los ingresos asociados a esta cuenta (semana)
        const ingresos = await Ingreso.find({ cuenta: cuentaActual._id }).sort({fecha: -1});

        // Obtener los gastos asociados a esta cuenta (semana)
        const gastos = await Gasto.find({ cuenta: cuentaActual._id }).sort({fecha: -1});

        // Calcular el total sumando los valores de los gastos
        let totalIngresos = ingresos.reduce((suma, ingreso) => suma + ingreso.valor, 0);
        let totalGastos =  gastos.reduce((suma, gasto) => suma + gasto.valor, 0);

        const totalSemanal =  totalIngresos - totalGastos;

        // Actualizar el total en la cuenta
        cuentaActual.semanal = totalSemanal;
        await cuentaActual.save();

        return res.status(200).json({
            status: "success",
            mensaje: "Total semanal calculado con éxito",
            cuenta: cuentaActual,
            totalSemanal,
            totalIngresos,
            totalGastos,
            gastos,
            ingresos
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
        const acumulado = cuentas.reduce((suma, cuenta) => suma + cuenta.semanal, 0);

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