const { conexion } = require("./database/conexion"); // importar archivo de conexion
const express = require("express"); // importo el paq express de mis dependencias
const cors = require("cors");

console.log("App node arrancada");

14188
// conectar a la base de datos
conexion();

// Crear servidor Node
const app = express();
const puerto = 49151;

// Configurar cors
app.use(cors()); // se ejecuta el cors antes de que se ejecute cualquier ruta

// Convertir body a objeto js
app.use(express.json());  // parsea automaticamente los datos a json
app.use(express.urlencoded({extended:true})); // puedo recibir datos en formato form-urlencoded

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

// cargar rutas
app.use("/api/cuentas", rutas_cuenta);
app.use("/api/gastos", rutas_gasto);
app.use("/api/ingresos", rutas_ingreso);

// Crear servidor y escuchar peticiones http
app.listen(puerto, () => { // se pasa un puerto como parametro y funcion verifique q el servidor corra
    console.log("Servidor corriendo en el puerto: " + puerto);
});