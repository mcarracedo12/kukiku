// const API_BASE_URL = 'http://localhost:5000/api'
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'


// Función auxiliar para obtener el token desde localStorage
const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
        'Authorization': `Bearer ${token}`
    }
}

// Función auxiliar para detectar vencimiento de sesión
const procesarRespuesta = async (response, onSessionExpired) => {
    if (response.status === 401 || response.status === 403) {
        if (onSessionExpired) onSessionExpired()
        throw new Error('Tu sesión expiró. Por favor, volvé a ingresar.')
    }
    if(!response.ok){
        throw new Error('Error en la peticion')
    }
    return response
}


// Autenticación y recuperación
export const loginAPI = async (password) => {
    const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
    })
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Contraseña incorrecta')
    }
    return res.json()
}

export const obtenerPreguntaSeguridadAPI = async () => {
    const res = await fetch(`${API_BASE_URL}/recuperar-pregunta`)
    if (!res.ok) throw new Error('No se pudo obtener la pregunta de seguridad')
    return res.json()
}

export const resetPasswordAPI = async (respuesta, nuevaPassword) => {
    const res = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respuesta, nuevaPassword })
    })
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Respuesta incorrecta')
    }
    return res.json()
}

// 1. Petición POST (Agregar producto con FormData)
export const agregarProductoAPI = async (formData, onSessionExpired) => {
    const res = await fetch(`${API_BASE_URL}/productos`, {
        method: 'POST',
        headers: getAuthHeaders(), // Se adjunta el token JWT
        body: formData
    })
    return procesarRespuesta(res, onSessionExpired)
}

// 2. Peticion GET (Consultar productos)
export const obtenerProductosAPI= async () =>{
    const res= await fetch(`${API_BASE_URL}/productos`)
    return res.json()
} 

// 3. Petición PUT (Modificar precio/datos)
export const modificarProductoAPI = async (id, datosProducto, onSessionExpired) => {
    const res = await fetch(`${API_BASE_URL}/productos/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders() // Se adjunta el token JWT
        },
        body: JSON.stringify(datosProducto)
    })
    return procesarRespuesta(res, onSessionExpired)
}

// 4. Petición DELETE (Eliminar producto)
export const eliminarProductoAPI = async (id, onSessionExpired) => {
    const res = await fetch(`${API_BASE_URL}/productos/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders() // Se adjunta el token JWT
    })
    return procesarRespuesta(res, onSessionExpired)
}