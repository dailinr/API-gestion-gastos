const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

console.log("App node arrancada");

// Crear servidor Node
const app = express();
const puerto = process.env.PORT || 3000; // Usar el puerto dinámico de Vercel

// Configuración de CORS
const corsOptions = {
  origin: "*",  // ⚠️ Permite cualquier origen (puedes restringirlo a tu dominio)
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // puedo recibir datos en formato form-urlencoded


// 🔹 Conexión optimizada a MongoDB para Vercel
let isConnected; // Variable global para evitar múltiples conexiones

async function connectDB() {
  if (isConnected) {
    console.log("Usando conexión existente a MongoDB.");
    return;
  }
  try {
    await mongoose.connect('mongodb+srv://dailinromero123:dailinromero123@cluster0.pu51f.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    isConnected = mongoose.connection.readyState === 1;
    console.log("Conectado a la base de datos");
  } catch (error) {
    console.error("Error de conexión a MongoDB", error);
  }
}

// 🔹 Llamar a la conexión antes de usar cualquier ruta
connectDB();

// Rutas de prueba
app.get("/", (req, res) => {
  res.json("Hola");
});

// RUTAS DE LA APP
const rutas_cuenta = require("./Rutas/cuenta");
const rutas_gasto = require("./Rutas/gasto");
const rutas_ingreso = require("./Rutas/ingreso");

app.use("/api/cuentas", rutas_cuenta);
app.use("/api/gastos", rutas_gasto);
app.use("/api/ingresos", rutas_ingreso);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

// Crear servidor
app.listen(puerto, () => {
  console.log("Servidor corriendo en el puerto: " + puerto);
});
