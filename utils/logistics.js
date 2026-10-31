// utils/logistics.js

const mensajerosDisponibles = [
    { nombre: "Carlos (Zona Sur/Centro)", telefono: "573101111111", lat: 3.4372, lng: -76.5225 },
    { nombre: "Andrés (Zona Norte/Menga)", telefono: "573202222222", lat: 3.4820, lng: -76.5310 },
    { nombre: "Felipe (Yumbo / Acopi)", telefono: "573003333333", lat: 3.5240, lng: -76.5010 }
];

function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function obtenerMensajeroMasCercano(userLat = 3.4516, userLng = -76.5320) {
    let mensajeroAsignado = mensajerosDisponibles[0];
    let menorDistancia = Infinity;

    mensajerosDisponibles.forEach(mensajero => {
        let distancia = calcularDistancia(userLat, userLng, mensajero.lat, mensajero.lng);
        if (distancia < menorDistancia) {
            menorDistancia = distancia;
            mensajeroAsignado = mensajero;
        }
    });
    return mensajeroAsignado;
}

module.exports = {
    obtenerMensajeroMasCercano
};