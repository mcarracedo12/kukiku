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
    imagen: null,
    precio: ''
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
  

  // Cerrar sesión


  const crearLinkWhatsApp = (nombreProducto) => {
    const mensajeBase = `¡Hola Estela! Me encantó el catálogo web y quería consultar precio y disponibilidad de colores para: ${nombreProducto}.`
    return `https://wa.me/${TELEFONO_KUKIKU}?text=${encodeURIComponent(mensajeBase)}`
  }

  return (
    <>
      

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
              {isAdmin && <p>Precio: ${prod.precio}</p>}
              {/* <p>Precio: ${prod.precio}</p> */}

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
                  <button className="btn-modify" onClick={() => handleModificar(prod.id)}>
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

   
       
   
      </div>
    </>
  )
}

export default App