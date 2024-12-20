const Gasto = require("../Modelos/Gasto");
const Cuenta = require("../Modelos/Cuenta");

const pruebaGasto = (req, res) => {
    return res.status(200).send({
        mensaje: "Prueba controlador de gastos",
    });
}

const guardar = async(req, res) => {

    const { etiqueta, descripcion, valor, fecha } = req.body;
    
    try{    
        if (!etiqueta || !descripcion || !valor ) {
            return res.status(400).json({ status: "error", message: "Todos los campos son obligatorios" });
        }

        // Usar la fecha actual si no se proporciona
        const fechaGasto = fecha ? new Date(fecha) : new Date();

        // Buscar la cuenta que incluya el rango de fecha del gasto
        const cuentaAsociada = await Cuenta.findOne({
            fechaInicial: { $lte: fechaGasto }, // menor o igual que
            fechaFinal: { $gte: fechaGasto } // mayor o igual que
        });

        if (!cuentaAsociada) {
            return res.status(404).json({ 
                status: "error", 
                message: "No hay una cuenta asociada a la fecha del gasto" 
            });
        }

        // Crear y guardar el nuevo gasto
        const gasto = new Gasto({
            etiqueta, descripcion, valor,
            fecha: fechaGasto, cuenta: cuentaAsociada._id
        });

        const gastoGuardado = await gasto.save();

        return res.status(200).send({
            status: "success",
            mensaje: "Ruta adicionar gastos",
            gasto: gastoGuardado
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
        const gastoEliminado = await Gasto.findOneAndDelete({ "_id": id });

        // Devolver resultado
        return res.status(200).json({
            status: "success",
            mensaje: "gasto eliminado correctamente",
            gasto: gastoEliminado,
        });
    }
    catch(error){
        return res.status(500).send({
            status: "error",
            mensaje: "Error al eliminar gasto"
        })
    }
}

                                                 
module.exports = {
    pruebaGasto,
    guardar,
    eliminar
}