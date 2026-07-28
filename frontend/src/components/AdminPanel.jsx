import React, { useState, useEffect } from 'react'
import { agregarProductoAPI, obtenerVisitasAPI } from '../services/api'

function AdminPanel({ handleLogout, cargarProductos, handleSesionExpirada }) {
    const [nuevoProducto, setNuevoProducto] = useState({ nombre: '', descripcion: '', imagen: null, precio: '' })
    const [visitas, setVisitas] = useState(0);
    const token = localStorage.getItem('token')
    useEffect(() => {
        const cargarVisitas = async () => {
            const data = await obtenerVisitasAPI(token);
            if (data.totalVisitas !== undefined) {
                setVisitas(data.totalVisitas);
            }
        };
        cargarVisitas();
    }, [token]);
    const handleGuardar = (e) => {
        e.preventDefault()
        const precioNumerico = Number(nuevoProducto.precio)
        if (isNaN(precioNumerico) || precioNumerico <= 0) {
            alert("Por favor, ingresá un precio numérico válido.")
            return
        }
        const formData = new FormData()
        formData.append('nombre', nuevoProducto.nombre)
        formData.append('descripcion', nuevoProducto.descripcion)
        formData.append('imagen', nuevoProducto.imagen)
        formData.append('precio', precioNumerico)
        agregarProductoAPI(formData, handleSesionExpirada)
            .then(response => {
                if (response.ok) {
                    alert('Producto agregado con éxito')
                    setNuevoProducto({ nombre: '', descripcion: '', imagen: null, precio: '' })
                    const fileInput = document.getElementById('file-input')
                    if (fileInput) fileInput.value = ''
                    cargarProductos()
                }
            })
            .catch(error => {
                console.error('Error al agregar producto:', error)
                alert('Error de conexión')
            })
    }
    return (
        <section className="admin-panel">
            <h2>Panel de Administración 🎨</h2>
            <p className="admin-subtitle">Subí tus nuevos tejidos artesanales al catálogo al instante</p>
            <form className="admin-form" onSubmit={handleGuardar}>
                <div className="form-group">
                    <label>Nombre de la prenda:</label>
                    <input
                        type="text"
                        placeholder="Ej. Saco de lana Merino"
                        className="form-input"
                        required
                        value={nuevoProducto.nombre}
                        onChange={e => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Descripción / Talles / Colores:</label>
                    <textarea
                        rows="3"
                        placeholder="Ej. Tejido a dos agujas en talle M y L."
                        className="form-input"
                        // required
                        value={nuevoProducto.descripcion}
                        onChange={e => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label>Foto de la prenda:</label>
                    <input
                        id="file-input"
                        type="file"
                        accept="image/*"
                        className="form-input"
                        // required
                        onChange={e => setNuevoProducto({ ...nuevoProducto, imagen: e.target.files[0] })}
                    />
                </div>
                <div className="form-group">
                    <label>Precio:</label>
                    <input
                        type="number"
                        placeholder="Ej. 3500"
                        className="form-input"
                        // required
                        value={nuevoProducto.precio}
                        onChange={e => setNuevoProducto({ ...nuevoProducto, precio: e.target.value })}
                    />
                </div>

                <button type="submit" className="btn-submit">
                    ✨ Publicar Tejido
                </button>
            </form>

            <button className="btn-logout" onClick={handleLogout}>
                🔒 Cerrar Sesión de Administrador
            </button>
            <div className="visitas-badge">
                👁️ Visitas totales: {visitas}
            </div>
        </section>

    )
}
export default AdminPanel