import { useState, useEffect } from 'react'
import Header from './components/Header'
import InfoUbicaciones from './components/InfoUbicaciones'
import Catalog from './components/Catalog'
import AdminPanel from './components/AdminPanel'
import Footer from './components/Footer'
import LoginModal from './components/LoginModal'
import {obtenerProductosAPI} from './services/api'
import './App.css'

function App() {
  const [productos, setProductos] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(() => { return localStorage.getItem('token') != null })
  const handleLogout = () => {
    localStorage.removeItem('token') // 1. Borramos la "llave" guardada
    setIsAdmin(false)                // 2. Volvemos al estado normal de usuario
  }

  useEffect(() => {
    cargarProductos()
  }, [])

  const handleSesionExpirada = () => {
    alert('Tu sesión ha expirado por seguridad. Por favor, volvé a ingresar.')
    handleLogout()
    setIsModalOpen(true)
  }

  const cargarProductos = () => {
    obtenerProductosAPI()
      .then(response => response)
      .then(data => setProductos(data))
      .catch(error => console.error("Error al traer productos:", error))
  }

  return (
    <>
      <Header />
      {!isAdmin && <InfoUbicaciones />}
      {isModalOpen && <LoginModal
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen} />}
      {isAdmin && <AdminPanel
        handleSesionExpirada={handleSesionExpirada}
        cargarProductos={cargarProductos}
        handleLogout={handleLogout} />}
      {<Catalog
        productos={productos}
        isAdmin={isAdmin}
        handleSesionExpirada={handleSesionExpirada}
        cargarProductos={cargarProductos} />}
      <Footer
        setIsModalOpen={setIsModalOpen}
        isAdmin={isAdmin}
        handleLogout={handleLogout} />
    </>

  )
}

export default App