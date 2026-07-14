import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [productos, setProductos] = useState([])

  // Reemplazá este número por el de tu amiga (Código de país + área + número, sin + ni espacios)
  const TELEFONO_KUKIKU = "5493544407796" 

  useEffect(() => {
    fetch('http://localhost:5000/api/productos')
      .then(response => response.json())
      .then(data => setProductos(data))
      .catch(error => console.error("Error al traer productos:", error))
  }, [])

  // Función mágica para armar el link dinámico
  const crearLinkWhatsApp = (nombreProducto) => {
    const mensajeBase = `¡Hola Estela! Me encantó el catálogo web y quería consultar precio y disponibilidad de colores para ${nombreProducto}`
    // encodeURIComponent convierte los espacios y emojis en caracteres válidos para un link de internet
    return `https://wa.me/${TELEFONO_KUKIKU}?text=${encodeURIComponent(mensajeBase)}`
  }

  return (
    <>
   {/* HEADER UNIFICADO (Contiene Logo, Info de Envíos e Instagram) */}
      <header className="header">
        <div className="logo">Kukiku 🧶</div>
        
        <div className="banner-text">
          🚀 Envíos a todo el país
        </div>
        
        <a 
          href="https://www.instagram.com/tejidoskukiku/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="insta-link"
        >
          Instagram
        </a>
      </header>

      <div className="app-container">
        <h1>Kukiku Tejidos</h1>
        <p className="subtitle">Prendas artesanales tejidas a mano por Estela</p>

        {/* AQUÍ VOLVEMOS A PONER LAS TARJETAS (SEO Local) */}
        <div className="info-ubicaciones">
          <div className="ubicacion-card">
            📍 <strong>Mina Clavero</strong> <br /> Córdoba, Argentina
          </div>
          <div className="ubicacion-card">
            🎪 <strong>Feria de Villa de Las Rosas</strong> <br /> Todos los Sábados
          </div>
        </div>

        <div className="productos-grid">
          {productos.map(prod => (
            <div key={prod.id} className="producto-card">
              <img 
                src={`/productos/${prod.imagen}`} 
                alt={prod.nombre} 
                className="producto-imagen" 
              />
              <h3>{prod.nombre}</h3>
              <p>{prod.descripcion}</p>
              
              {/* SECCIÓN DEL GATITO WHATSAPP */}
              <div className="whatsapp-container">
                <span className="whatsapp-texto">Consultar:</span>
                <a 
                  href={crearLinkWhatsApp(prod.nombre)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <img 
                    src="/logo.png" 
                    alt="Consultar a Estela por WhatsApp" 
                    className="btn-whatsapp-gatito" 
                  />
                </a>
              </div>

            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default App