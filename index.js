// const { conexion } = require("./database/conexion"); // importar archivo de conexion
const express = require("express"); // importo el paquete express de mis dependencias
const cors = require("cors");
const mongoose = require("mongoose");

console.log("App node arrancada");
// conexion();

// Crear servidor Node
const app = express();
const puerto = 49151;

// Configurar cors
app.use(cors({  // se ejecuta el cors antes de que se ejecute cualquier ruta
  origin: ["https://gestion-gastos-vert.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Convertir body a objeto js
app.use(express.json());  // parsea automaticamente los datos a json
app.use(express.urlencoded({ extended: true })); // puedo recibir datos en formato form-urlencoded

mongoose.connect('mongodb+srv://dailinromero123:dailinromero123@cluster0.pu51f.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0');

// Rutas de prueba
app.get("/prueba", (req, res) => {
  res.status(200).json({
    status: "success",
    mensaje: "¡Ruta de prueba funcionando correctamente!",
  });
});

// RUTAS DE LA APP
const rutas_cuenta = require("./Rutas/cuenta");
const rutas_gasto = require("./Rutas/gasto");
const rutas_ingreso = require("./Rutas/ingreso");

// Cargar rutas
app.use("/api/cuentas", rutas_cuenta);
app.use("/api/gastos", rutas_gasto);
app.use("/api/ingresos", rutas_ingreso);

// Crear servidor y escuchar peticiones http
app.listen(puerto, () => { // se pasa un puerto como parametro y funcion verifique q el servidor corra
  console.log("Servidor corriendo en el puerto: " + puerto);
});
