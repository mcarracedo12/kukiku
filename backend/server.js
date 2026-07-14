const express = require('express');
const cors = require('cors');
const productos = require('./productos.json');

const app = express();
const PORT = 5000; // El backend va a correr en el puerto 5000

// Permitimos que React se conecte desde afuera
app.use(cors());

// Creamos la "ruta" o endpoint para los productos
app.get('/api/productos', (req, res) => {
  res.json(productos);
});

// Ponemos al servidor a escuchar
app.listen(PORT, () => {
  console.log(`Servidor de Kukiku corriendo en http://localhost:${PORT}`);
});