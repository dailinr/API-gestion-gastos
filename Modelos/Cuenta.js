const { Schema, model } = require("mongoose");
const mongoose = require('mongoose');
// const mongoosePaginate = require('mongoose-paginate-v2');

// Definimos la estructura de nuestro modelo
const CuentaSchema = Schema({

    fecha: {
        type: Date,
        default: Date.now,
    },
    semanal: {
        type: Number,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    }
});

// CuentaSchema.plugin(mongoosePaginate);

// Exportamos el modelo
module.exports = model("Cuenta", CuentaSchema, "cuentas");