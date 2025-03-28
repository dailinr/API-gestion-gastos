const { Schema, model } = require("mongoose");
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

// Definimos la estructura de nuestro modelo
const CuentaSchema = Schema({

    fechaInicial: {
        type: Date,
    },
    fechaFinal: {
        type: Date,
    },
    semanal: {
        type: Number,
        required: true,
    },
});

// Middleware `pre` para calcular las fechas antes de guardar
CuentaSchema.pre("save", function (next) {
    const now = new Date(); // Fecha actual
    const dayOfWeek = now.getDay(); // Día de la semana (0: Domingo, 1: Lunes, ..., 6: Sábado)

    // Calcular el lunes de la semana actual
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Ajustar para que Domingo (0) sea el último día de la semana
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0); // Establecer la hora en medianoche

    // Calcular el domingo de la semana actual
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6); // El domingo está 6 días después del lunes

    // Asignar las fechas al documento
    this.fechaInicial = monday;
    this.fechaFinal = sunday;

    next();
});

CuentaSchema.plugin(mongoosePaginate);

// Exportamos el modelo
module.exports = model("Cuenta", CuentaSchema, "cuentas");