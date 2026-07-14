import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [productos, setProductos] = useState([])
  const TELEFONO_KUKIKU = "5493544407796"

  // Estado para controlar los campos del formulario
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    descripcion: '',
    imagen: null // Ahora arranca en null porque va a ser un objeto File
  })

  // Cargar productos al iniciar (GET)
  const cargarProductos = () => {
    fetch('http://localhost:5000/api/productos')
      .then(response => response.json())
      .then(data => setProductos(data))
      .catch(error => console.error("Error al traer productos:", error))
  }

  useEffect(() => {
    cargarProductos()
  }, [])

  // Guardar nuevo producto (POST)
  const handleGuardar = (e) => {
    e.preventDefault()

    // Creamos el contenedor especial para enviar el archivo
    const formData = new FormData()
    formData.append('nombre', nuevoProducto.nombre)
    formData.append('descripcion', nuevoProducto.descripcion)
    formData.append('imagen', nuevoProducto.imagen) // Adjuntamos la foto real

    fetch('http://localhost:5000/api/productos', {
      method: 'POST',
      // IMPORTANTE: Al enviar FormData NO hay que poner el header 'Content-Type'
      // El navegador lo configura automáticamente con el "boundary" necesario.
      body: formData
    })
      .then(res => res.json())
      .then(() => {
        // Limpiamos el formulario
        setNuevoProducto({ nombre: '', descripcion: '', imagen: null })
        // Reseteamos visualmente el selector de archivos del HTML
        document.getElementById('file-input').value = ''
        cargarProductos() // Recargamos la grilla
      })
      .catch(err => console.error("Error al guardar:", err))
  }

  // Eliminar producto (DELETE)
  const handleEliminar = (id) => {
    if (confirm("¿Estás segura de que querés eliminar este producto?")) {
      fetch(`http://localhost:5000/api/productos/${id}`, {
        method: 'DELETE'
      })
        .then(() => cargarProductos())
        .catch(err => console.error("Error al eliminar:", err))
    }
  }

  const crearLinkWhatsApp = (nombreProducto) => {
    const mensajeBase = `¡Hola Estela! Me encantó el catálogo web y quería consultar precio y disponibilidad de colores para: ${nombreProducto}.`
    return `https://wa.me/${TELEFONO_KUKIKU}?text=${encodeURIComponent(mensajeBase)}`
  }

  return (
    <>
      {/* HEADER UNIFICADO */}
      <header className="header">
        <div className="logo">Kukiku 🧶</div>
        <div className="banner-text">🚀 Envíos a todo el país</div>
        <a href="https://www.instagram.com/tejidoskukiku/" target="_blank" rel="noopener noreferrer" className="insta-link">
          Instagram
        </a>
      </header>

      <div className="app-container">
        <h1>Kukiku Tejidos</h1>
        <p className="subtitle">Prendas artesanales tejidas a mano por Estela</p>

        {/* TARJETAS DE UBICACIÓN */}
        <div className="info-ubicaciones">
          <div className="ubicacion-card">
            📍 <strong>Mina Clavero</strong> <br /> Córdoba, Argentina
          </div>
          <div className="ubicacion-card">
            🎪 <strong>Feria de Villa de Las Rosas</strong> <br /> Todos los Sábados
          </div>
        </div>

        {/* Grilla principal de productos */}
        <div className="productos-grid">
          {productos.map(prod => (
            <div key={prod.id} className="producto-card">
              <img
                src={`/productos/${prod.imagen || 'placeholder.png'}`}
                alt={`${prod.nombre} tejido a mano en Traslasierra`}
                className="producto-imagen"
              />
              <h3>{prod.nombre}</h3>
              <p>{prod.descripcion}</p>

              <div className="whatsapp-container">
                <span className="whatsapp-texto">Consultar:</span>
                <a href={crearLinkWhatsApp(prod.nombre)} target="_blank" rel="noopener noreferrer">
                  <img src="/logo.png" alt="Consultar por WhatsApp" className="btn-whatsapp-gatito" />
                </a>
              </div>

              {/* Botón de eliminar rápido para administración temporal */}
              <div className="admin-actions-card">
                <button className="btn-delete" onClick={() => handleEliminar(prod.id)}>
                  🗑️ Eliminar Producto
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* PANEL DEL FORMULARIO CON GRADIENTE */}
        <section className="admin-panel">
          <h2>Panel de Administración 🎨</h2>
          <p className="admin-subtitle">Subí tus nuevos tejidos artesanales al catálogo al instante</p>

          <form className="admin-form" onSubmit={handleGuardar}>
            <div className="form-group">
              <label>Nombre de la prenda: *</label>
              <input
                type="text"
                placeholder="Ej. Saco de lana Merino"
                className="form-input"
                required // <--- Campo obligatorio
                value={nuevoProducto.nombre}
                onChange={e => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Descripción / Talles / Colores: *</label>
              <textarea
                rows="3"
                placeholder="Ej. Tejido a dos agujas en talle M y L. Súper abrigado."
                className="form-input"
                required // <--- Campo obligatorio
                value={nuevoProducto.descripcion}
                onChange={e => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Foto de la prenda: *</label>
              <input
                id="file-input"
                type="file"
                accept="image/*" // <--- Solo permite subir fotos
                className="form-input"
                required // <--- Campo obligatorio
                onChange={e => setNuevoProducto({ ...nuevoProducto, imagen: e.target.files[0] })} // Guarda el archivo físico
              />
            </div>

            <button type="submit" className="btn-submit">
              ✨ Publicar Tejido
            </button>
          </form>



        </section>
      </div>
    </>
  )
}

export default App