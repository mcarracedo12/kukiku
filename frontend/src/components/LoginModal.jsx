import React, { useEffect, useState } from 'react'
import { loginAPI, obtenerPreguntaSeguridadAPI, resetPasswordAPI } from '../services/api'

function LoginModal({ setIsAdmin, isModalOpen, setIsModalOpen }) {
    const [password, setPassword] = useState('')
    const [modoRecuperar, setModoRecuperar] = useState(false)
    const [pregunta, setPregunta] = useState('')
    const [respuesta, setRespuesta] = useState('')
    const [nuevaPassword, setNuevaPassword] = useState('')
    const [errorMsg, setErrorMsg] = useState('')

    const cerrarModal = () => {
        setIsModalOpen(false)
        setModoRecuperar(false)
        setPassword('')
        setRespuesta('')
        setNuevaPassword('')
        setErrorMsg('')
    }

    useEffect(() => {
        if (modoRecuperar) {
            obtenerPreguntaSeguridadAPI()
                .then(data => setPregunta(data.pregunta))
                .catch(err => setErrorMsg(err.message))
        }
    }, [modoRecuperar])

    const handleLoginSubmit = (e) => {
        e.preventDefault()
        setErrorMsg('')
        loginAPI(password)
            .then(data => {
                localStorage.setItem('token', data.token)
                setIsAdmin(true)
                cerrarModal();
            })
            .catch(err => setErrorMsg(err.message))
    }

    const handleResetSubmit = (e) => {
        e.preventDefault()
        setErrorMsg('')
        resetPasswordAPI(respuesta, nuevaPassword)
            .then(() => {
                alert('¡Contraseña cambiada con éxito! Ya podés ingresar.')
                cerrarModal();
            })
            .catch(err => setErrorMsg(err.message))
    }

    if (!isModalOpen) return null

    return (
        <div className="modal-overlay" onClick={() => cerrarModal()}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="btn-close-modal" onClick={() => cerrarModal()}>✕</button>
                <h3>{modoRecuperar ? 'Recuperar contraseña 🔑' : 'Acceso de Estela 🧶'}</h3>

                {/* 👇 RENDERIZADO DEL ERROR SI EXISTE */}
                {errorMsg && (
                    <p style={{ color: '#d9534f', backgroundColor: '#f9dedc', padding: '8px', borderRadius: '4px', fontSize: '0.85rem', margin: '10px 0' }}>
                        {errorMsg}
                    </p>
                )}

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
                            onClick={() => { setErrorMsg(''); setModoRecuperar(true) }}
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetSubmit} className="admin-form" style={{ boxShadow: 'none', padding: 0, margin: 0 }}>
                        <div className="form-group">
                            <label>Pregunta de Seguridad:</label>
                            <p style={{ fontWeight: 'bold', margin: '5px 0' }}>{pregunta}</p>
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
                            onClick={() => { setErrorMsg(''); setModoRecuperar(false) }}
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