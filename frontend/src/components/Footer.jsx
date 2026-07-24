import React from 'react'

function Footer({isAdmin, setIsModalOpen, handleLogout}) {
  return (
        <footer className="footer">
          <p>© {new Date().getFullYear()} Kukiku Tejidos. Todos los derechos reservados.</p>
          <button
            className="btn-lock"
            onClick={() => isAdmin ? handleLogout() : setIsModalOpen(true)}
            title={isAdmin ? "Salir de Administración" : "Acceso Administración"}
          >
            {isAdmin ? '🔓' : '🔒'}
          </button>
        </footer>
  )
}
export default Footer