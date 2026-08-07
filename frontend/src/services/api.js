const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { 'Authorization': `Bearer ${token}` };
};

const procesarRespuesta = async (response, onSessionExpired) => {
    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        if (onSessionExpired) onSessionExpired();
        throw new Error('Tu sesión expiró o no tenés permiso. Volvé a ingresar.');
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || 'Ocurrió un error en el servidor');
    }

    return data;
};

// --- AUTENTICACIÓN Y RECUPERACIÓN ---
export const loginAPI = async (password) => {
    const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar sesión'); 
    }
    return data;
};

export const obtenerPreguntaSeguridadAPI = async () => {
    const res = await fetch(`${API_BASE_URL}/recuperar-pregunta`);
    return procesarRespuesta(res);
};

export const resetPasswordAPI = async (respuesta, nuevaPassword) => {
    const res = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respuesta, nuevaPassword })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.error || 'Error al restablecer la contraseña');
    }
    return data;
};

// --- PRODUCTOS ---
export const agregarProductoAPI = async (formData, onSessionExpired) => {
    const res = await fetch(`${API_BASE_URL}/productos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
    });

    if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        if (onSessionExpired) onSessionExpired();
        throw new Error('Tu sesión expiró o no tenés permiso. Volvé a ingresar.');
    }

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al guardar el producto');
    }

    return res;
};

export const obtenerProductosAPI = async () => {
    const res = await fetch(`${API_BASE_URL}/productos`);
    return procesarRespuesta(res);
}; 

export const modificarProductoAPI = async (id, datosProducto, onSessionExpired) => {
    const res = await fetch(`${API_BASE_URL}/productos/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
        },
        body: JSON.stringify(datosProducto)
    });
    return procesarRespuesta(res, onSessionExpired);
};

export const eliminarProductoAPI = async (id, onSessionExpired) => {
    const res = await fetch(`${API_BASE_URL}/productos/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return procesarRespuesta(res, onSessionExpired);
};

// --- MÉTRICAS Y CONTACTO ---
export const registrarVisitaAPI = async () => {
    await fetch(`${API_BASE_URL}/visitas`, { method: 'POST' });
};

export const obtenerVisitasAPI = async () => {
    const res = await fetch(`${API_BASE_URL}/visitas`, {
        headers: getAuthHeaders()
    });
    return procesarRespuesta(res);
};

export const enviarMensajeDevAPI = async (mensaje) => {
    const res = await fetch(`${API_BASE_URL}/contacto-dev`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje })
    });
    return procesarRespuesta(res);
};