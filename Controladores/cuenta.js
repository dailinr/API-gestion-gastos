const Cuenta = require("../Modelos/Cuenta");
const Gasto = require("../Modelos/Gasto");
const Ingreso = require("../Modelos/Ingreso");
const dayjs = require('dayjs');

const pruebaCuenta = (req, res) => {
    
    return res.status(200).send({
        mensaje: "Prueba controlador de cuenta",
    });
}

const guardarCuenta = async(req, res) => {

    try {
       // Utiliza Day.js para obtener la fecha actual ajustada a la zona horaria local
       const fechaActual = dayjs().startOf('day'); // Esto obtendrá la fecha a medianoche en la zona horaria local

        // Buscar la cuenta que incluye la fecha actual
        const cuentaActual = await Cuenta.findOne({
            fechaInicial: { $lte: fechaActual.toDate() },  // Convierte Day.js a Date
            fechaFinal: { $gte: fechaActual.toDate() },    // Convierte Day.js a Date
        });

        if(!cuentaActual){

            // Si no existe la cuenta, crear una nueva
            const nuevaCuenta = new Cuenta();
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
        const fechaActual = dayjs().startOf('day'); // Ajusta la fecha a medianoche

        // Buscar la cuenta que incluye la fecha actual
        const cuentaActual = await Cuenta.findOne({
            fechaInicial: { $lte: fechaActual.toDate() }, // Convierte Day.js a Date
            fechaFinal: { $gte: fechaActual.toDate() },   // Convierte Day.js a Date
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

        // Formatear fechas y agregar día de la semana
        const formatearConDia = (items) =>
            items.map(item => ({
                ...item._doc, // Copia los datos originales
                diaSemana: dayjs(item.fecha).format('dddd'), // Formatea el día de la semana
            }));

        const gastosConDia = formatearConDia(gastos);
        const ingresosConDia = formatearConDia(ingresos);

        // Agrupar categorías (ingresos y gastos) ignorando espacios y mayúsculas
        const normalizarTexto = (texto) => texto.replace(/\s+/g, "").toLowerCase();

        const categoriasGastos = gastosConDia.reduce((acumulador, gasto) => {
            const etiqueta = gasto.etiqueta ? gasto.etiqueta : ""; // Cambié "categoria" por "etiqueta"
            const etiquetaNormalizada = normalizarTexto(etiqueta);

            if (!acumulador[etiquetaNormalizada]) {
                acumulador[etiquetaNormalizada] = {
                    etiquetaOriginal: etiqueta, // Puede variar, elige la primera encontrada
                    totalCategoria: 0,
                };
            }
            
            acumulador[etiquetaNormalizada].totalCategoria += gasto.valor; // Sumamos el valor
            return acumulador;
        }, {});


        return res.status(200).json({
            status: "success",
            mensaje: "Total semanal calculado con éxito",
            cuenta: cuentaActual,
            totalSemanal,
            totalIngresos,
            totalGastos,
            gastos: gastosConDia,
            ingresos: ingresosConDia,
            categoriasGastos
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
        let pageCuenta = parseInt(req.params.pageCuenta) || null;
        const pageDatos = parseInt(req.params.pageDatos) || 1;

        const limitCuenta = 1;
        const limitDatos = 6;

        // Obtener la fecha actual
        const fechaActual = dayjs().startOf('day'); // Ajusta la fecha a medianoche

        // Buscar la cuenta que incluye la fecha actual
        const cuentaActual = await Cuenta.findOne({
            fechaInicial: { $lte: fechaActual.toDate() }, // Convierte Day.js a Date
            fechaFinal: { $gte: fechaActual.toDate() },   // Convierte Day.js a Date
        }).sort({ fechaInicial: 1 });

        // Si no se especificó una página y existe una cuenta actual, determinar la página correspondiente
        if (!pageCuenta && cuentaActual) {
            const posicionCuenta = await Cuenta.countDocuments({ 
                fechaInicial: { $lt: cuentaActual.fechaInicial } 
            });

            pageCuenta = Math.floor(posicionCuenta / limitCuenta) + 1;
        }

        // Establecer la página por defecto en caso de que no se determine
        pageCuenta = pageCuenta || 1;

        // Paginar las cuentas ordenadas por fecha
        const cuentas = await Cuenta.paginate({},
            {
                page: pageCuenta, // Página actual
                limit: limitCuenta, // Límite por página
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
                
                // Obtener gastos relacionados con la cuenta (sin paginación)
                const totalIngresos = await Ingreso.aggregate([
                    { $match: { cuenta: cuenta._id } },
                    { $group: { _id: null, total: { $sum: "$valor" } } },
                ]);
                const totalGastos = await Gasto.aggregate([
                    { $match: { cuenta: cuenta._id } },
                    { $group: { _id: null, total: { $sum: "$valor" } } },
                ]);

                // paginar los gastos e ingresos relacionados con la cuenta
                const gastos = await Gasto.paginate(
                    { cuenta: cuenta._id }, // Filtrar por cuenta
                    {
                        page: pageDatos, // Página actual
                        limit: limitDatos, // Límite por página
                        sort: { fecha: -1 }, // Ordenar por fecha descendente
                    }
                );

                const ingresos = await Ingreso.paginate(
                    { cuenta: cuenta._id }, // Filtrar por cuenta
                    {
                        page: pageDatos, // Página actual
                        limit: limitDatos, // Límite por página
                        sort: { fecha: -1 }, // Ordenar por fecha descendente
                    }
                );

                // Calcular el total sumando los valores de los gastos
                const totalIngresosValor = totalIngresos[0]?.total || 0;
                const totalGastosValor =  totalGastos[0]?.total || 0;
                console.log(totalIngresosValor, totalGastosValor);
                const totalSemanal =  totalIngresosValor - totalGastosValor;


                return {
                    cuentaId: cuenta._id,
                    fechaInicial: cuenta.fechaInicial,
                    fechaFinal: cuenta.fechaFinal,
                    totalIngresos: totalIngresosValor,
                    totalGastos: totalGastosValor,
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