// routes/index.js
const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const servicesController = require('../controllers/servicesController');
const { checkRole } = require('../middleware/authMiddleware');

// ==========================================
// RUTAS PÚBLICAS Y DE VISTAS PRINCIPALES
// ==========================================
router.get('/', (req, res) => res.render('home'));
router.get('/cotizar', (req, res) => res.render('cotizar'));
router.get('/especiales', (req, res) => res.render('especiales'));
router.get('/tecnicos', (req, res) => res.render('tecnicos'));
router.get('/cascos', (req, res) => res.render('cascos'));
router.get('/calificar', (req, res) => res.render('calificar'));
router.get('/privacidad', (req, res) => res.render('privacidad'));
router.get('/habeas-data', (req, res) => res.render('habeas-data'));

// ==========================================
// RUTAS DE PROCESAMIENTO DE SERVICIOS (POST)
// ==========================================
router.post('/process-shipment', servicesController.processShipment);
router.post('/process-special-errand', servicesController.processSpecialErrand);
router.post('/process-technical-service', servicesController.processTechnicalService);
router.post('/process-helmet-wash', servicesController.processHelmetWash);
router.post('/process-rating', servicesController.processRating);
router.post('/update-service-completed', servicesController.updateServiceCompleted);

// ==========================================
// RUTAS DE AUTENTICACIÓN
// ==========================================
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/logout', authController.logout);
router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);

// ==========================================
// RUTAS PROTEGIDAS (TORRE DE CONTROL Y MENSAJERÍA)
// ==========================================
router.get('/admin', checkRole(['admin']), authController.getAdminPanel);
router.get('/mensajero', checkRole(['admin', 'driver']), authController.getMessengerPanel);
router.post('/update-shipment-status', checkRole(['admin', 'driver']), authController.updateShipmentStatus);

module.exports = router;