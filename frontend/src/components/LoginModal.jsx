import React, { useState } from 'react'

function LoginModal({ isAdmin, setIsAdmin, isModalOpen, setIsModalOpen }) {
    const [password, setPassword] = useState('')
    const [modoRecuperar, setModoRecuperar] = useState(false)
    const [respuesta, setRespuesta] = useState('')
    const [nuevaPassword, setNuevaPassword] = useState('')

    const handleLoginSubmit = (e) => {
        e.preventDefault()

        fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        })
            .then(response => {
                if (response.ok) {
                    return response.json()
                } else {
                    throw new Error('Contraseña incorrecta')
                }
            })
            .then(data => {
                // Guardamos el token en el navegador de Estela
                localStorage.setItem('token', data.token)
                setIsAdmin(true)
                setIsModalOpen(false)
                setPassword('')
            })
            .catch(error => alert(error))
    }

    const handleResetSubmit = (e) => {
        e.preventDefault()
        fetch('http://localhost:5000/api/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ respuesta, nuevaPassword })
        })
            .then(res => res.ok ? res.json() : Promise.reject('Respuesta incorrecta'))
            .then(() => {
                alert('¡Contraseña cambiada con éxito! Ya podés ingresar.')
                setModoRecuperar(false)
                setRespuesta('')
                setNuevaPassword('')
                setIsModalOpen(false)
            })
            .catch(err => alert(err))
    }


    return (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="btn-close-modal" onClick={() => setIsModalOpen(false)}>✕</button>
                <h3>{modoRecuperar ? 'Recuperar contraseña 🔑' : 'Acceso de Estela 🧶'}</h3>
                {!modoRecuperar ? (
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
                        <button
                            type="button"
                            style={{ background: 'none', border: 'none', color: '#666', marginTop: '10px', cursor: 'pointer', fontSize: '0.85rem' }}
                            onClick={() => setModoRecuperar(true)}
                        >
                            ¿Olvidaste tu contraseña?
                        </button>

                    </form>)
                    : (

                        <form onSubmit={handleResetSubmit} className="admin-form" style={{ boxShadow: 'none', padding: 0, margin: 0 }}>
                            <div className="form-group">
                                <label>Pregunta de Seguridad:</label>
                                <p style={{ fontWeight: 'bold', margin: '5px 0' }}>¿Cómo se llama tu primera mascota?</p>
                                <input
                                    type="text"
                                    placeholder="Tu respuesta"
                                    className="form-input"
                                    required
                                    value={respuesta}
                                    onChange={e => setRespuesta(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Nueva Contraseña:</label>
                                <input
                                    type="password"
                                    placeholder="Nueva clave"
                                    className="form-input"
                                    required
                                    value={nuevaPassword}
                                    onChange={e => setNuevaPassword(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="btn-submit">Cambiar Contraseña</button>
                            <button
                                type="button"
                                style={{ background: 'none', border: 'none', color: '#666', marginTop: '10px', cursor: 'pointer', fontSize: '0.85rem' }}
                                onClick={() => setModoRecuperar(false)}
                            >
                                Volver al ingreso
                            </button>
                        </form>
                    )}
            </div>
        </div>
    )
}

export default LoginModal
