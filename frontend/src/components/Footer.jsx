import React, { useState } from 'react'
import DevContactModal from './DevContactModal';

function Footer({ isAdmin, setIsModalOpen, handleLogout }) {
    const [isDevModalOpen, setIsDevModalOpen] = useState(false);
    return (
        <footer className="footer">
           
            <button
                className="btn-lock"
                onClick={() => isAdmin ? handleLogout() : setIsModalOpen(true)}
                title={isAdmin ? "Salir de Administración" : "Acceso Administración"}
            >
                {isAdmin ? '🔓' : '🔒'}
            </button>

            {!isAdmin && (
                <button
                    className="btn-contact-dev"
                    onClick={() => setIsDevModalOpen(true)}
                >
                    🛠️ Contactar al desarrollador
                </button>
            )}

             <p>© {new Date().getFullYear()} Kukiku Tejidos. Todos los derechos reservados.</p>

            <DevContactModal
                isOpen={isDevModalOpen}
                onClose={() => setIsDevModalOpen(false)}
            />
        </footer>
    );
}
export default Footer