import React, { useState } from 'react';
import { enviarMensajeDevAPI } from '../services/api';

function DevContactModal({ isOpen, onClose }) {
  const [mensaje, setMensaje] = useState('');
  const [contacto, setContacto] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);

    try {
      const res = await enviarMensajeDevAPI({ mensaje, contacto });
      if (res.exito) {
        alert('¡Mensaje enviado con éxito al desarrollador!');
        setMensaje('');
        setContacto('');
        onClose();
      } else {
        alert('Ocurrió un error al enviar el mensaje.');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="btn-close" onClick={onClose}>✕</button>
        <h3>💬 Contactar al Desarrollador</h3>
        <p>¿Encontraste un problema o querés sugerir una mejora?</p>

        <form onSubmit={handleSubmit} className="dev-modal-form">
          <div className="form-group">
            <label>Mensaje:</label>
            <textarea
              rows="4"
              placeholder="Describí tu consulta o problema..."
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Tu mail o teléfono (opcional):</label>
            <input
              type="text"
              placeholder="Para poder responderte"
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-submit" disabled={enviando}>
            {enviando ? 'Enviando...' : '🚀 Enviar Correo'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default DevContactModal;