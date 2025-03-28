const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

// Definimos la estructura de nuestro modelo
const IngresoSchema = Schema({
    etiqueta: {
        type: String,
        required: true,
    },
    descripcion: {
        type: String,
        required: true,
    },
    valor: {
        type: Number,
        default: 0,
        required: true,
    },
    fecha: {
        type: Date,
        default: Date.now,
    },
    cuenta: {
        type: Schema.ObjectId,
        ref: "Cuenta"
    }
});

IngresoSchema.plugin(mongoosePaginate);

// Exportamos el modelo
module.exports = model("Ingreso", IngresoSchema, "ingresos");