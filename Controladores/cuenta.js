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
                totalIngresos: 0,
                totalGastos: 0,
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

const listarPorSemana = async (req, res) => {

    try {
        // Obtener parámetros de paginación
        let pageCuenta = 1;
        let pageDatos = 1;

        if(req.params.pageCuenta) pageCuenta = req.params.pageCuenta;
        if(req.params.pageDatos) pageDatos = req.params.pageDatos;

        const limitCuenta = 1;
        const limitDatos = 10;

        // Paginar las cuentas ordenadas por fecha
        const cuentas = await Cuenta.paginate({},
            {
                page: parseInt(pageCuenta), // Página actual
                limit: parseInt(limitCuenta), // Límite por página
                sort: { fechaInicial: 1 }, // Ordenar por fecha inicial ascendente
            }
        );

        if (cuentas.docs.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "No se encontraron cuentas en la base de datos",
            });
        }

        // Crear un arreglo para almacenar los datos por cuenta (semana)
        const resultados = await Promise.all(

            cuentas.docs.map(async (cuenta) => {
                
                // Obtener gastos relacionados con la cuenta
                
                const gastos = await Gasto.paginate(
                    { cuenta: cuenta._id }, // Filtrar por cuenta
                    {
                        page: parseInt(pageDatos), // Página actual
                        limit: parseInt(limitDatos), // Límite por página
                        sort: { fecha: -1 }, // Ordenar por fecha descendente
                    }
                );

                const ingresos = await Ingreso.paginate(
                    { cuenta: cuenta._id }, // Filtrar por cuenta
                    {
                        page: parseInt(pageDatos), // Página actual
                        limit: parseInt(limitDatos), // Límite por página
                        sort: { fecha: -1 }, // Ordenar por fecha descendente
                    }
                );

                // Calcular el total sumando los valores de los gastos
                let totalIngresos = ingresos.docs.reduce((suma, ingreso) => suma + ingreso.valor, 0);
                let totalGastos =  gastos.docs.reduce((suma, gasto) => suma + gasto.valor, 0);

                const totalSemanal =  totalIngresos - totalGastos;


                return {
                    cuentaId: cuenta._id,
                    fechaInicial: cuenta.fechaInicial,
                    fechaFinal: cuenta.fechaFinal,
                    totalIngresos,
                    totalGastos,
                    totalSemanal,
                    gastos,
                    ingresos,
                };
            })
        );

        return res.status(200).json({
            status: "success",
            message: "Gastos e ingresos paginados por cuenta obtenidos con éxito",
            paginacion: {
                totalDocs: cuentas.totalDocs,
                totalPages: cuentas.totalPages,
                currentPage: cuentas.page,
                hasPrevPage: cuentas.hasPrevPage,
                hasNextPage: cuentas.hasNextPage,
                
            },
            resultados,
        });
    } 
    catch (error) {
        return res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};



module.exports = {
    pruebaCuenta,
    guardarCuenta,
    calcularTotalSemanal,
    calcularAcumulado,
    listarPorSemana
}