require('dotenv').config();
const { Resend } = require('resend');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY;
const CONFIG_PATH = path.join(__dirname, 'config.json');
const JSON_PATH = path.join(__dirname, 'productos.json');

let contadorVisitas = 0;
// Usar variable de entorno para no exponer credenciales
const resend = new Resend(process.env.RESEND_API_KEY);

// --- FUNCIONES AUXILIARES DE CONFIGURACIÓN ---
const leerConfig = () => {
  try {
    const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error al leer config.json:", error);
    return null;
  }
};

const guardarConfig = (config) => {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error al guardar config.json:", error);
  }
};

app.use(cors());
app.use(express.json());

// --- AUTENTICACIÓN ---
app.post('/api/login', async (req, res) => {
  const { password } = req.body;
  const config = leerConfig();
  if (!config) {
    return res.status(500).json({ error: "Error de configuración en el servidor" });
  }
  const esCorrecta = await bcrypt.compare(password, config.adminPasswordHash);

  if (esCorrecta) {
    const token = jwt.sign({ role: 'admin' }, SECRET_KEY, { expiresIn: '2h' });
    return res.json({ token });
  }
  return res.status(401).json({ error: 'Contraseña incorrecta' });
});

app.get('/api/recuperar-pregunta', (req, res) => {
  const config = leerConfig();
  if (!config) return res.status(500).json({ error: "Error en el servidor" });
  return res.json({ pregunta: config.preguntaSeguridad });
});

app.post('/api/reset-password', async (req, res) => {
  const { respuesta, nuevaPassword } = req.body;
  if (!respuesta || !nuevaPassword) return res.status(400).json({ error: "Faltan datos obligatorios" });
  
  const config = leerConfig();
  if (!config) return res.status(500).json({ error: "Error en el servidor" });

  const respuestaLimpia = respuesta.trim().toLowerCase();
  const esRespuestaValida = await bcrypt.compare(respuestaLimpia, config.respuestaSeguridadHash);

  if (esRespuestaValida) {
    const nuevoPasswordHash = await bcrypt.hash(nuevaPassword, 10);
    config.adminPasswordHash = nuevoPasswordHash;
    guardarConfig(config);
    return res.json({ mensaje: "Contraseña actualizada con éxito" });
  }
  return res.status(401).json({ error: "Respuesta de seguridad incorrecta" });
});

// --- CONFIGURACIÓN DE MULTER ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '..', 'frontend', 'public', 'productos');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Generar un hash único de 8 bytes para el nombre del archivo sin depender de req.body
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `prod-${Date.now()}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const tiposPermitidos = /jpeg|jpg|png|webp|gif/;
  const mimeValido = tiposPermitidos.test(file.mimetype);
  const extValida = tiposPermitidos.test(path.extname(file.originalname).toLowerCase());

  if (mimeValido && extValida) {
    return cb(null, true);
  }
  cb(new Error('Formato no soportado. Solo se permiten imágenes (JPG, PNG, WEBP, GIF)'));
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

// --- HELPERS Y MIDDLEWARES ---
const leerProductos = () => {
  try {
    const data = fs.readFileSync(JSON_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error al leer el archivo JSON:", error);
    return [];
  }
};

const guardarProductos = (productos) => {
  try {
    fs.writeFileSync(JSON_PATH, JSON.stringify(productos, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error al escribir en el archivo JSON:", error);
  }
};

const verificarToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const token = bearerHeader.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Token inválido o expirado' });
      }
      req.user = decoded;
      next();
    });
  } else {
    res.status(401).json({ error: 'Acceso no autorizado: falta token' });
  }
};

// --- RUTAS DE PRODUCTOS ---
app.get('/api/productos', (req, res) => {
  const productos = leerProductos();
  res.json(productos);
});

app.post('/api/productos', verificarToken, (req, res) => {
  upload.single('imagen')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'La imagen supera el límite permitido de 5 MB.' });
      }
      return res.status(400).json({ error: `Error de carga: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    const productos = leerProductos();
    const nombreImagen = req.file ? req.file.filename : 'placeholder.png';

    const nuevoProducto = {
      id: Date.now(),
      nombre: req.body.nombre,
      descripcion: req.body.descripcion,
      imagen: nombreImagen,
      precio: req.body.precio
    };

    productos.push(nuevoProducto);
    guardarProductos(productos);

    return res.status(201).json({ mensaje: "Producto agregado con éxito", producto: nuevoProducto });
  });
});

app.put('/api/productos/:id', verificarToken, (req, res) => {
  const id = parseInt(req.params.id);
  let productos = leerProductos();
  const index = productos.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  productos[index] = {
    ...productos[index],
    nombre: req.body.nombre || productos[index].nombre,
    descripcion: req.body.descripcion || productos[index].descripcion,
    precio: req.body.precio
  };

  guardarProductos(productos);
  res.json({ mensaje: "Producto modificado con éxito", producto: productos[index] });
});

app.delete('/api/productos/:id', verificarToken, (req, res) => {
  const id = req.params.id;
  let productos = leerProductos();

  const productoAEliminar = productos.find(p => String(p.id) === String(id));

  if (!productoAEliminar) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  if (productoAEliminar.imagen && productoAEliminar.imagen !== 'placeholder.png') {
    const rutaImagen = path.join(__dirname, '..', 'frontend', 'public', 'productos', productoAEliminar.imagen);
    if (fs.existsSync(rutaImagen)) {
      fs.unlinkSync(rutaImagen);
    }
  }

  const filtrados = productos.filter(p => String(p.id) !== String(id));
  guardarProductos(filtrados);

  res.json({ mensaje: "Producto eliminado con éxito" });
});

// --- METRICAS Y CONTACTO ---
app.post('/api/visitas', (req, res) => {
  contadorVisitas++;
  res.json({ success: true });
});

app.get('/api/visitas', verificarToken, (req, res) => {
  res.json({ totalVisitas: contadorVisitas });
});

app.post('/api/contacto-dev', async (req, res) => {
  const { mensaje, contacto } = req.body;

  if (!mensaje) {
    return res.status(400).json({ error: "El mensaje está vacío" });
  }

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: process.env.MAIL_DESTINO,
      subject: '📩 Nuevo mensaje de la app de Tejidos',
      html: `
        <h2>¡Tenés un nuevo mensaje de la web!</h2>
        <p><strong>Mensaje:</strong> ${mensaje}</p>
        <p><strong>Contacto/Remitente:</strong> ${contacto || 'No especificado'}</p>
      `
    });

    return res.json({ exito: true });
  } catch (error) {
    console.error("Error enviando el mail:", error);
    return res.status(500).json({ error: "No se pudo enviar el correo" });
  }
});

// --- ARRANCAR SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});