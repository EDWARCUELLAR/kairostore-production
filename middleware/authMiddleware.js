// middleware/authMiddleware.js

function checkRole(rolesPermitidos) {
    return (req, res, next) => {
        if (!req.session.user) {
            return res.send(`
                <script>
                    alert('Debes iniciar sesión para acceder a esta sección.');
                    window.location.href = '/login';
                </script>
            `);
        }
        if (!rolesPermitidos.includes(req.session.user.role)) {
            return res.send(`
                <script>
                    alert('Acceso denegado. No tienes permisos para ver esta sección.');
                    window.location.href = '/';
                </script>
            `);
        }
        next();
    };
}

module.exports = { checkRole };