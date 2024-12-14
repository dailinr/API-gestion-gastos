// conexion a la base de datos
const mongoose = require("mongoose");

const conexion = async() => {

    try{
        // conexion a la base de datos
        await mongoose.connect('mongodb://localhost:27017/gestion_gastos');

        console.log("Conectado correctamente a la base de datos gestion_gastos"); // mensaje de conexion
    }
    catch(error){
        console.log(error);
        throw new Error("No se pudo conectar a la base de datos");
    }
};

module.exports = {
    conexion
};