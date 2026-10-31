// controllers/servicesController.js
const db = require('../config/db');
const { obtenerMensajeroMasCercano } = require('../utils/logistics');

// 1. Procesar Envíos Normales
exports.processShipment = async (req, res) => {
    try {
        const { recipient_name, recipient_address, pickup_address, distance_km, total_cost, tipo_programacion, scheduled_at } = req.body;
        const sender_id = 1;
        const cleanDistance = parseFloat(distance_km) || 5.0;
        const finalCost = parseFloat(total_cost) || 4500;
        const tracking_number = 'KAI-' + Math.random().toString(36).substring(2, 7).toUpperCase();
        
        const estadoServicio = (tipo_programacion === 'programado') ? 'Programado' : 'created';
        const fechaProgramadaTexto = (tipo_programacion === 'programado' && scheduled_at) ? scheduled_at : 'Inmediato (Lo antes posible)';

        const query = `
            INSERT INTO shipments (tracking_number, sender_id, recipient_name, recipient_address, distance_km, total_cost, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await db.execute(query, [tracking_number, sender_id, recipient_name, recipient_address, cleanDistance, finalCost, estadoServicio]);

        const mensajero = obtenerMensajeroMasCercano();
        let iconoTipo = tipo_programacion === 'programado' ? '📅 *ENVÍO PROGRAMADO*' : '🚀 *ENVÍO INMEDIATO*';
        
        const mensaje = `${iconoTipo} - KAIROS\n\n` +
                        `👤 *Hola ${mensajero.nombre}*:\n\n` +
                        `📍 *Origen:* ${pickup_address || 'Oficina Principal'}\n` +
                        `🏁 *Destino:* ${recipient_address}\n` +
                        `👤 *Recibe:* ${recipient_name}\n` +
                        `⏰ *Horario:* ${fechaProgramadaTexto}\n` +
                        `📏 *Distancia Ruta:* ${cleanDistance} km\n` +
                        `💰 *Total a Cobrar:* $${finalCost.toLocaleString()} COP\n` +
                        `🔖 *Guía:* ${tracking_number}`;

        const urlWp = `https://wa.me/${mensajero.telefono}?text=${encodeURIComponent(mensaje)}`;
        res.redirect(urlWp);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al registrar el envío: " + error.message);
    }
};

// 2. Procesar Vueltas VIP y Notariales
exports.processSpecialErrand = async (req, res) => {
    try {
        const { client_name, client_phone, errand_type, description, estimated_hours, estimated_cost, tipo_programacion, scheduled_at } = req.body;
        const user_id = 1;
        const tracking_code = 'VIP-' + Math.random().toString(36).substring(2, 7).toUpperCase();
        const fechaTexto = (tipo_programacion === 'programado' && scheduled_at) ? scheduled_at : 'Inmediato (Prioritario)';

        const query = `
            INSERT INTO special_errands (tracking_code, user_id, client_name, client_phone, errand_type, description, estimated_hours, total_cost, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `;
        await db.execute(query, [tracking_code, user_id, client_name, client_phone, errand_type, description, estimated_hours, estimated_cost]);

        const mensajero = obtenerMensajeroMasCercano();
        const tiposTraspaso = {
            'notaria': 'Trámite Notarial',
            'banco': 'Gestión Bancaria',
            'legal': 'Radicación Legal / Judicial',
            'custodia': 'Compra y Custodia de Valores'
        };

        const mensaje = `🏛️ *VUELTA VIP AGENDADA - KAIROS*\n\n` +
                        `👤 *Hola ${mensajero.nombre}*:\n` +
                        `👤 *Solicitante:* ${client_name}\n` +
                        `📞 *Teléfono:* ${client_phone}\n` +
                        `📋 *Tipo:* ${tiposTraspaso[errand_type] || errand_type}\n` +
                        `📝 *Instrucciones:* ${description}\n` +
                        `⏰ *Horario Cita:* ${fechaTexto}\n` +
                        `⏱️ *Tiempo Estimado:* ${estimated_hours} hora(s)\n` +
                        `💰 *Costo Estimado:* $${Number(estimated_cost).toLocaleString()} COP\n` +
                        `🔖 *Código:* ${tracking_code}`;

        const urlWp = `https://wa.me/${mensajero.telefono}?text=${encodeURIComponent(mensaje)}`;
        res.redirect(urlWp);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al registrar la vuelta especial: " + error.message);
    }
};

// 3. Procesar Servicios Técnicos
exports.processTechnicalService = async (req, res) => {
    try {
        const { client_name, client_phone, client_address, equipment_type, issue_description, estimated_cost, tipo_programacion, scheduled_at } = req.body;
        
        const [technicians] = await db.query('SELECT id FROM technicians WHERE is_available = 1 LIMIT 1');
        let technician_id = technicians.length > 0 ? technicians[0].id : null;
        const client_id = 1;
        const service_code = 'TECH-' + Math.random().toString(36).substring(2, 7).toUpperCase();
        const fechaTexto = (tipo_programacion === 'programado' && scheduled_at) ? scheduled_at : 'Urgencia (Hoy mismo)';

        const query = `
            INSERT INTO service_requests (client_id, technician_id, client_name, client_phone, equipment_type, issue_description, estimated_cost, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'Agendado')
        `;
        await db.execute(query, [client_id, technician_id, client_name, client_phone, equipment_type, issue_description, estimated_cost]);

        const mensajero = obtenerMensajeroMasCercano();
        const equiposMap = {
            'nevera': 'Nevera / Refrigeración',
            'computador': 'Computador / Laptop',
            'lavadora': 'Lavadora / Secadora',
            'aire': 'Aire Acondicionado'
        };

        const mensaje = `🔧 *SERVICIO TÉCNICO AGENDADO - KAIROS*\n\n` +
                        `👤 *Hola ${mensajero.nombre}*:\n` +
                        `👤 *Cliente:* ${client_name}\n` +
                        `📞 *Teléfono:* ${client_phone}\n` +
                        `📍 *Dirección:* ${client_address}\n` +
                        `🛠️ *Equipo:* ${equiposMap[equipment_type] || equipment_type}\n` +
                        `⏰ *Cita Programada:* ${fechaTexto}\n` +
                        `⚠️ *Falla:* ${issue_description}\n` +
                        `💰 *Visita:* $${Number(estimated_cost).toLocaleString()} COP\n` +
                        `🔖 *Código:* ${service_code}`;

        const urlWp = `https://wa.me/${mensajero.telefono}?text=${encodeURIComponent(mensaje)}`;
        res.redirect(urlWp);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al registrar el servicio técnico: " + error.message);
    }
};

// 4. Procesar Lavado de Cascos
exports.processHelmetWash = async (req, res) => {
    try {
        const { client_name, client_phone, station_location, service_type, scheduled_date, scheduled_time } = req.body;
        const serviceCode = 'CASCO-' + Math.random().toString(36).substring(2, 7).toUpperCase();
        const costoServicio = service_type === 'profundo' ? 20000 : 12000;
        const nombreServicio = service_type === 'profundo' ? 'Desinfección Profunda a Vapor' : 'Lavado Express';
        const telefonoEstacion = "573101111111"; 

        const mensaje = `🪖 *NUEVA RESERVA - LAVADO DE CASCOS* 💨\n\n` +
                        `👤 *Cliente:* ${client_name}\n` +
                        `📞 *Teléfono:* ${client_phone}\n` +
                        `📍 *Estación:* ${station_location}\n` +
                        `🛠️ *Servicio:* ${nombreServicio}\n` +
                        `📅 *Fecha:* ${scheduled_date}\n` +
                        `⏰ *Hora:* ${scheduled_time}\n` +
                        `💰 *Total a Cancelar:* $${costoServicio.toLocaleString()} COP\n` +
                        `🔖 *Código Reserva:* ${serviceCode}`;

        const urlWp = `https://wa.me/${telefonoEstacion}?text=${encodeURIComponent(mensaje)}`;
        res.redirect(urlWp);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al procesar la reserva de cascos: " + error.message);
    }
};

// 5. Procesar Calificación (Unificado y sin duplicidades)
exports.processRating = async (req, res) => {
    try {
        const { service_code, rating, feedback } = req.body;

        if (service_code && service_code.startsWith('TECH')) {
            await db.query(`
                UPDATE service_requests 
                SET rating = ?, feedback = ?, status = 'Completado' 
                WHERE id = (SELECT id FROM (SELECT id FROM service_requests ORDER BY id DESC LIMIT 1) as tmp)
            `, [rating, feedback]);
        } else if (service_code && service_code.startsWith('KAI')) {
            await db.query(`
                UPDATE shipments 
                SET rating = ?, feedback = ?, status = 'Entregado y Calificado' 
                WHERE tracking_number = ?
            `, [rating, feedback, service_code]);
        } else {
            // Guardado general en tabla ratings si aplica
            const query = `INSERT INTO ratings (service_code, rating, feedback) VALUES (?, ?, ?)`;
            await db.query(query, [service_code || 'GEN', rating, feedback]);
        }

        res.send(`
            <script>
                alert('¡Mil gracias por tu calificación de ${rating} estrellas! Nos ayudas a ser mejores cada día en Cali y Valle.');
                window.location.href = '/calificar';
            </script>
        `);
    } catch (error) {
        console.error("Error al registrar la calificación:", error.message);
        res.status(500).send("Error en el servidor al procesar tu calificación.");
    }
};

// 6. Marcar Servicio como Completado (WhatsApp con enlace de calificación)
exports.updateServiceCompleted = async (req, res) => {
    try {
        const { service_id, client_phone, client_name, service_code } = req.body;

        await db.query('UPDATE shipments SET status = "completed" WHERE id = ?', [service_id]);

        const mensajeWhatsApp = `¡Hola, *${client_name}*! 📦✨ Tu servicio con *Kairos Express* ha finalizado con éxito.\n\n` +
                                `Por favor, ayúdanos a calificar la atención y el trabajo de nuestro aliado ingresando al siguiente enlace:\n` +
                                `👉 https://kairostore.shop/calificar?code=${service_code}\n\n` +
                                `¡Gracias por confiar en el poderío vallecaucano! ❤️ *Fundación Hechos de Amor*`;

        const urlWhatsAppAPI = `https://wa.me/${client_phone}?text=${encodeURIComponent(mensajeWhatsApp)}`;
        res.redirect(urlWhatsAppAPI);
    } catch (error) {
        console.error("Error al finalizar el servicio:", error.message);
        res.status(500).send("Error en el servidor: " + error.message);
    }
};