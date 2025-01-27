const Ingreso = require("../Modelos/Ingreso");
const Cuenta = require("../Modelos/Cuenta");
const dayjs = require('dayjs');  // Importar dayjs

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
        const fechaIngreso = fecha ? dayjs(fecha).startOf('day') : dayjs().startOf('day'); 

        // Buscar la cuenta que incluya el rango de fecha del ingreso
        const cuentaAsociada = await Cuenta.findOne({
            fechaInicial: { $lte: fechaIngreso.toDate() }, // menor o igual que
            fechaFinal: { $gte: fechaIngreso.toDate() } // mayor o igual que
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
            fecha: fechaIngreso.toDate(), cuenta: cuentaAsociada._id
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
        const fechaIngreso = fecha ? dayjs(fecha).startOf('day') : dayjs().startOf('day'); 
        
        const ingresoActualizado = await Ingreso.findOneAndUpdate(
            { "_id": id }, 
            {
                $set: {
                    etiqueta, descripcion, valor,
                    fecha: fechaIngreso.toDate()
                }  
            },
            { new: true }
        );

        // Verificar si el ingreso fue actualizado
        if (!ingresoActualizado) {
            return res.status(404).json({
                status: "error",
                mensaje: "Error al actualizar el ingreso"
            });
        }

        // Devolver resultado
        return res.status(200).json({
            status: "success",
            mensaje: "ingreso actualizado correctamente",
            ingreso: ingresoActualizado
        });

    }
    catch(error){
        return res.status(500).send({
            status: "error",
            mensaje: "Error al editar ingreso"
        });
    }
}

                                                 
module.exports = {
    pruebaIngreso,
    guardar,
    eliminar,
    editar
}