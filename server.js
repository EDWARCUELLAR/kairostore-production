// server.js
const express = require('express');
const session = require('express-session');
const path = require('path');
const routes = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de sesiones
app.use(session({
    secret: 'kairos_express_secret_key_valle',
    resave: false,
    saveUninitialized: true
}));

// Configurar EJS como motor de vistas y la ruta de views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares para parsear datos y archivos estáticos
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'assets')));

// Usar el enrutador centralizado
app.use('/', routes);

// ==========================================
// INICIAR SERVIDOR
// ==========================================
app.listen(PORT, () => {
    console.log(`¡Servidor de Kairos Express corriendo en http://localhost:${PORT} 🚀!`);
});