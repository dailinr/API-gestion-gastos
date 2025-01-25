const Gasto = require("../Modelos/Gasto");
const Cuenta = require("../Modelos/Cuenta");
const dayjs = require('dayjs');  // Importar dayjs

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

        // Usar la fecha proporcionada o la fecha actual ajustada a la zona horaria local
        const fechaGasto = fecha ? dayjs(fecha).startOf('day') : dayjs().startOf('day'); // Asegura que la fecha se obtenga desde medianoche

        // Buscar la cuenta que incluya el rango de fecha del gasto
        const cuentaAsociada = await Cuenta.findOne({
            fechaInicial: { $lte: fechaGasto.toDate() }, // menor o igual que
            fechaFinal: { $gte: fechaGasto.toDate() }    // mayor o igual que
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
            fecha: fechaGasto.toDate(), 
            cuenta: cuentaAsociada._id
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

const editar = async (req, res) => {
    
    try{
        const id = req.params.id;

        if(!id || id.length !== 24){
            return res.status(400).json({
                status: "error",
                mensaje: "Id no valido",
            })
        }

        const { etiqueta, descripcion, valor, fecha } = req.body;
        
        if (!etiqueta || !descripcion || !valor ) {
            return res.status(400).json({ status: "error", message: "Faltan datos por enviar" });
        }
        
        // Usar la fecha proporcionada o la fecha actual ajustada a la zona horaria local
        const fechaGasto = fecha ? dayjs(fecha).startOf('day') : dayjs().startOf('day'); // Asegura que la fecha se obtenga desde medianoche
        
        const gastoActualizado = await Gasto.findOneAndUpdate(
            { "_id": id }, 
            {
                $set: {
                    etiqueta, descripcion, valor,
                    fecha: fechaGasto.toDate()
                }  
            },
            { new: true }
        );

        // Verificar si el gasto fue actualizado
        if (!gastoActualizado) {
            return res.status(404).json({
                status: "error",
                mensaje: "Error al actualizar el gasto"
            });
        }

        // Devolver resultado
        return res.status(200).json({
            status: "success",
            mensaje: "gasto actualizado correctamente",
            gasto: gastoActualizado
        });

    }
    catch(error){
        return res.status(500).send({
            status: "error",
            mensaje: "Error al editar gasto"
        })
    }
}
                                              
module.exports = {
    pruebaGasto,
    guardar,
    eliminar,
    editar
}