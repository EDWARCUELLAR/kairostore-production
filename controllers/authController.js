// controllers/authController.js
const db = require('../config/db');

// Vista de Login
exports.getLogin = (req, res) => {
    res.render('login');
};

// Procesar Login
exports.postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);

        if (users.length > 0) {
            const user = users[0];
            req.session.user = user;

            if (user.role === 'admin') {
                res.redirect('/admin');
            } else if (user.role === 'driver') {
                res.redirect('/mensajero');
            } else if (user.role === 'technician') {
                res.redirect('/tecnicos');
            } else {
                res.redirect('/cotizar');
            }
        } else {
            res.send(`
                <script>
                    alert('Correo o contraseña incorrectos.');
                    window.location.href = '/login';
                </script>
            `);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error en el servidor al iniciar sesión: " + error.message);
    }
};

// Cerrar Sesión
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};

// Vista de Registro
exports.getRegister = (req, res) => {
    res.render('register');
};

// Procesar Registro
exports.postRegister = async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;
        
        await db.execute(
            'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone, password, role]
        );

        if (role === 'technician') {
            const [newUser] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
            if (newUser.length > 0) {
                await db.execute(
                    'INSERT INTO technicians (user_id, specialty, rating, is_available) VALUES (?, ?, 5.00, 1)',
                    [newUser[0].id, 'Soporte General']
                );
            }
        }

        res.send(`
            <script>
                alert('¡Registro exitoso! Ya puedes iniciar sesión con tu correo.');
                window.location.href = '/login';
            </script>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al registrar el usuario: " + error.message);
    }
};

// Torre de Control (Admin)
exports.getAdminPanel = async (req, res) => {
    try {
        const [shipments] = await db.query('SELECT * FROM shipments ORDER BY id DESC');
        const [specials] = await db.query('SELECT * FROM special_errands ORDER BY id DESC');
        const [technicals] = await db.query('SELECT * FROM technical_services ORDER BY id DESC');

        res.render('admin', { shipments, specials, technicals });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al cargar el panel de control: " + error.message);
    }
};

// Portal de Mensajería
exports.getMessengerPanel = async (req, res) => {
    try {
        const [shipments] = await db.query("SELECT * FROM shipments WHERE status != 'Entregado' ORDER BY id DESC");
        res.render('mensajero', { shipments });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al cargar el panel de mensajero: " + error.message);
    }
};

// Actualizar Estado de Envío (Mensajero)
exports.updateShipmentStatus = async (req, res) => {
    try {
        const { shipment_id } = req.body;
        await db.query("UPDATE shipments SET status = 'Entregado' WHERE id = ?", [shipment_id]);
        res.redirect('/mensajero');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al actualizar el estado: " + error.message);
    }
};