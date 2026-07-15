import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [productos, setProductos] = useState([])
  const TELEFONO_KUKIKU = "5491123456789"

  // --- ESTADOS PARA ADMINISTRACIÓN ---
  const [isAdmin, setIsAdmin] = useState(false) // Controla si Estela está logueada
  const [isModalOpen, setIsModalOpen] = useState(false) // Controla si se muestra el modal
  const [password, setPassword] = useState('') // El input de la contraseña

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    descripcion: '',
    imagen: null
  })

  // Cargar productos al iniciar
  const cargarProductos = () => {
    fetch('http://localhost:5000/api/productos')
      .then(response => response.json())
      .then(data => setProductos(data))
      .catch(error => console.error("Error al traer productos:", error))
  }

  useEffect(() => {
    cargarProductos()
    // Si ya había iniciado sesión antes, la recordamos (opcional)
    const sesionGuardada = localStorage.getItem('kukiku_admin')
    if (sesionGuardada === 'true') {
      setIsAdmin(true)
    }
  }, [])

  // Guardar nuevo producto
  const handleGuardar = (e) => {
    e.preventDefault()
    
    const formData = new FormData()
    formData.append('nombre', nuevoProducto.nombre)
    formData.append('descripcion', nuevoProducto.descripcion)
    formData.append('imagen', nuevoProducto.imagen)

    fetch('http://localhost:5000/api/productos', {
      method: 'POST',
      body: formData 
    })
      .then(res => res.json())
      .then(() => {
        setNuevoProducto({ nombre: '', descripcion: '', imagen: null })
        document.getElementById('file-input').value = ''
        cargarProductos()
      })
      .catch(err => console.error("Error al guardar:", err))
  }

  // Eliminar producto
  const handleEliminar = (id) => {
    if (confirm("¿Estás segura de que querés eliminar este producto?")) {
      fetch(`http://localhost:5000/api/productos/${id}`, {
        method: 'DELETE'
      })
        .then(() => cargarProductos())
        .catch(err => console.error("Error al eliminar:", err))
    }
  }

  // Manejo del Login de Estela
  const handleLoginSubmit = (e) => {
    e.preventDefault()
    // Definimos una contraseña simple de ejemplo. Podés cambiarla por la que quieras.
    if (password === 'estela123') { 
      setIsAdmin(true)
      setIsModalOpen(false)
      setPassword('')
      localStorage.setItem('kukiku_admin', 'true') // Mantiene la sesión iniciada
    } else {
      alert('Contraseña incorrecta 🧶')
    }
  }

  // Cerrar sesión
  const handleLogout = () => {
    setIsAdmin(false)
    localStorage.removeItem('kukiku_admin')
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
                alt={`${prod.nombre} tejido a mano`} 
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

              {/* Botón de eliminar: SOLO VISIBLE SI ESTELA INICIÓ SESIÓN */}
              {isAdmin && (
                <div className="admin-actions-card">
                  <button className="btn-delete" onClick={() => handleEliminar(prod.id)}>
                    🗑️ Eliminar Producto
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* PANEL DEL FORMULARIO CON GRADIENTE: SOLO VISIBLE SI ESTA LOGUEADA */}
        {isAdmin && (
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
                  onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Descripción / Talles / Colores:</label>
                <textarea 
                  rows="3"
                  placeholder="Ej. Tejido a dos agujas en talle M y L." 
                  className="form-input"
                  required
                  value={nuevoProducto.descripcion}
                  onChange={e => setNuevoProducto({...nuevoProducto, descripcion: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Foto de la prenda:</label>
                <input 
                  id="file-input"
                  type="file" 
                  accept="image/*"
                  className="form-input"
                  required
                  onChange={e => setNuevoProducto({...nuevoProducto, imagen: e.target.files[0]})}
                />
              </div>

              <button type="submit" className="btn-submit">
                ✨ Publicar Tejido
              </button>
            </form>

            <button className="btn-logout" onClick={handleLogout}>
              🔒 Cerrar Sesión de Administrador
            </button>
          </section>
        )}

        {/* PIE DE PÁGINA CON EL CANDADO SECRETO */}
        <footer className="footer">
          <p>© {new Date().getFullYear()} Kukiku Tejidos. Todos los derechos reservados.</p>
          <button 
            className="btn-lock" 
            onClick={() => setIsModalOpen(true)}
            title="Acceso Administración"
          >
            {isAdmin ? '🔓' : '🔒'}
          </button>
        </footer>

        {/* MODAL DE LOGIN (Sólo si isModalOpen es true) */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            {/* stopPropagation evita que se cierre el modal al hacer clic dentro de la caja blanca */}
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="btn-close-modal" onClick={() => setIsModalOpen(false)}>✕</button>
              <h3>Acceso de Estela 🧶</h3>
              
              <form onSubmit={handleLoginSubmit} className="admin-form" style={{ boxShadow: 'none', padding: 0, margin: 0 }}>
                <div className="form-group">
                  <label>Contraseña:</label>
                  <input 
                    type="password" 
                    placeholder="Contraseña" 
                    className="form-input"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoFocus
                  />
                </div>
                <button type="submit" className="btn-submit">Ingresar</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default App