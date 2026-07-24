import React, {useState } from 'react'

function LoginModal({isAdmin, setIsAdmin, isModalOpen, setIsModalOpen}) {
    const [password, setPassword] = useState('')

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
        .catch(error => {
            alert(error.message)
        })
}



    
    return (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
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
    )
}

export default LoginModal
