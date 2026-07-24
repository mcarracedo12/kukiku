function InfoUbicaciones() {
    return (
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
        </div>
    )
}

export default InfoUbicaciones