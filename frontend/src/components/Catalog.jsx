import React from "react"
import { eliminarProductoAPI, modificarProductoAPI } from "../services/api"

function Catalog({ productos, cargarProductos, isAdmin, handleSesionExpirada }) {
    const TELEFONO_KUKIKU = "5493544407796"
    const crearLinkWhatsApp = (nombreProducto) => {
        const mensajeBase = `¡Hola Estela! Me encantó el catálogo web y quería consultar precio y disponibilidad de colores para: ${nombreProducto}.`
        return `https://wa.me/${TELEFONO_KUKIKU}?text=${encodeURIComponent(mensajeBase)}`
    }

    const handleModificar = (prod) => {
        // Aquí iría la lógica para modificar un producto
        const newPrice = prompt(`Modificar precio para ${prod.nombre}:`, prod.precio)
        if (newPrice === null) return; // Si el usuario cancela, no hacer nada
        const precioNumerico = Number(newPrice)
        // Validamos que sea un número real y que no sea menor o igual a 0
        if (isNaN(precioNumerico) || precioNumerico <= 0) {
            alert("Precio no válido.")
            return
        }
        modificarProductoAPI(prod.id, { ...prod, precio: precioNumerico }, handleSesionExpirada)
            .then(() => {
                cargarProductos()
            })
            .catch(error => console.error('Error:', error))

    }
    const handleEliminar = (id) => {
        if (confirm("¿Estás segura de que querés eliminar este producto?")) {
            eliminarProductoAPI(id, handleSesionExpirada)
                .then(response => {
                        cargarProductos()
                })
                .catch(error => console.error('Error al eliminar:', error))
        }
    }

    return (


        <div className="productos-grid">
            {productos.map(prod => (
                <div key={prod.id} className="producto-card">
                    <img
                        src={`/productos/${prod.imagen || 'placeholder.png'}`}
                        alt={`${prod.nombre} tejido a mano`}
                        className="producto-imagen"
                    />
                    <h3>{prod.nombre}</h3>
                    <p>{prod.descripcion}</p>
                    <p>Precio: ${prod.precio}</p>

                    {/* BOTÓN DE WHATSAPP: SOLO VISIBLE SI NO ESTÁ LOGUEADA */}
                    {!isAdmin &&
                        <div className="whatsapp-container">
                            <span className="whatsapp-texto">Consultar:</span>
                            <a href={crearLinkWhatsApp(prod.nombre)} target="_blank" rel="noopener noreferrer">
                                <img src="/logo.png" alt="Consultar por WhatsApp" className="btn-whatsapp-gatito" />
                            </a>
                        </div>
                    }

                    {/* Botón de eliminar: SOLO VISIBLE SI ESTELA INICIÓ SESIÓN */}
                    {isAdmin && (
                        <div className="admin-actions-card">
                            <button className="btn-modify" onClick={() => handleModificar(prod)}>
                                �️ Modificar
                            </button>
                            <button className="btn-modify" onClick={() => handleEliminar(prod.id)}>
                                🗑️ Eliminar
                            </button>
                        </div>
                    )}

                </div>
            ))}
        </div>


    )

}
export default Catalog