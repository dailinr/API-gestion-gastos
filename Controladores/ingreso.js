const Ingreso = require("../Modelos/Ingreso");
const Cuenta = require("../Modelos/Cuenta");

const pruebaIngreso = (req, res) => {
    return res.status(200).send({
        mensaje: "Prueba controlador de ingresos",
    });
}


const guardar = async(req, res) => {

    const { etiqueta, descripcion, valor, fecha } = req.body;
    
    try{    
        if (!etiqueta || !descripcion || !valor ) {
            return res.status(400).json({ status: "error", message: "Todos los campos son obligatorios" });
        }

        // Usar la fecha actual si no se proporciona
        const fechaIngreso = fecha ? new Date(fecha) : new Date();

        // Buscar la cuenta que incluya el rango de fecha del ingreso
        const cuentaAsociada = await Cuenta.findOne({
            fechaInicial: { $lte: fechaIngreso }, // menor o igual que
            fechaFinal: { $gte: fechaIngreso } // mayor o igual que
        });

        if (!cuentaAsociada) {
            return res.status(404).json({ 
                status: "error", 
                message: "No hay una cuenta asociada a la fecha del ingreso" 
            });
        }

        // Crear y guardar el nuevo ingreso
        const ingreso = new Ingreso({
            etiqueta, descripcion, valor,
            fecha: fechaIngreso, cuenta: cuentaAsociada._id
        });

        const ingresoGuardado = await ingreso.save();

        return res.status(200).send({
            status: "success",
            mensaje: "Ruta adicionar ingresos",
            ingreso: ingresoGuardado
        });
    }
    catch(error){
        return res.status(500).json({ status: "error", message: error.message });
    }
    
}

const eliminar = async(req, res) => {

    const id = req.params.id;

    try{
        if(!id || id.length !== 24){
            return res.status(400).json({
                status: "error",
                mensaje: "Id no valido",
            })
        }
        const ingresoEliminado = await Ingreso.findOneAndDelete({ "_id": id });

        // Devolver resultado
        return res.status(200).json({
            status: "success",
            mensaje: "ingreso eliminado correctamente",
            ingreso: ingresoEliminado,
        });
    }
    catch(error){
        return res.status(500).send({
            status: "error",
            mensaje: "Error al eliminar ingreso"
        })
    }
}

                                                 
module.exports = {
    pruebaIngreso,
    guardar,
    eliminar
}