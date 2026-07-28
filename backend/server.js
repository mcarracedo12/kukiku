require('dotenv').config();
const { Resend } = require('resend');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer'); // Librería para procesar archivos
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT ||5000;
const SECRET_KEY = process.env.SECRET_KEY;
const CONFIG_PATH = path.join(__dirname, 'config.json');
const JSON_PATH = path.join(__dirname, 'productos.json');
let contadorVisitas = 0;
const resend = new Resend('re_RYXNXXH1_NXkztzL6ngL4bqp9ehtTeWHi')

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

// Endpoint de autenticación
app.post('/api/login', async (req, res) => {
  const { password } = req.body
  const config = leerConfig();
  if (!config) {
    return res.status(500).json({ error: "Error de configuracion en el servidor" });
  }
  const esCorrecta = await bcrypt.compare(password, config.adminPasswordHash);

  if (esCorrecta) {
    const token = jwt.sign({ role: 'admin' }, SECRET_KEY, { expiresIn: '2h' })
    return res.json({ token })
  }
  return res.status(401).json({ error: 'Contraseña incorrecta' })
});

// Endpoint para obtener la pregunta de seguridad
app.get('/api/recuperar-pregunta', (req, res) => {
  const config = leerConfig();
  if (!config) return res.status(500).json({ error: "Error en el servidor" })
  return res.json({ pregunta: config.preguntaSeguridad });
});

//Endpoint de reseteo de contraseña
app.post('/api/reset-password', async (req, res) => {
  const { respuesta, nuevaPassword } = req.body;
  if (!respuesta || !nuevaPassword) return res.status(400).json({ error: "Faltan datos obligatorios" })
  const config = leerConfig();
  if (!config) return res.status(500).json({ error: "Error en el servidor" })
  const respuestaLimpia = respuesta.trim().toLowerCase();
  const esRespuestaValida = await bcrypt.compare(respuestaLimpia, config.respuestaSeguridadHash);
  if (esRespuestaValida) {
    const nuevoPasswordHash = await bcrypt.hash(nuevaPassword, 10);
    config.adminPasswordHash = nuevoPasswordHash;
    guardarConfig(config);
    return res.json({ mensaje: "Contraseña actualizada con exito" });
  }
  return res.status(401).json({ error: "Respuesta de seguridad incorrecta" })
});

// --- CONFIGURACIÓN DE MULTER (Subida de fotos) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Apuntamos directo a la carpeta public del frontend
    const dir = path.join(__dirname, '..', 'frontend', 'public', 'productos');

    // Si por alguna razón la carpeta no existe, la creamos
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
   
    const nombreProducto = req.body.nombre || 'producto';
    // Limpiamos el nombre: pasamos a minúsculas, sacamos tildes, espacios y caracteres raros
    const nombreLimpio = nombreProducto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Saca acentos
      .replace(/[^a-z0-9]/g, '-')     // Reemplaza todo lo que no sea letra o número por "-"
      .replace(/-+/g, '-')             // Evita guiones dobles
      .trim();

    // Obtenemos la extensión del archivo original (ej: .jpg, .png)
    const ext = path.extname(file.originalname);

    // El nombre final será: "saco-merino-1718923487.jpg" (agregamos timestamp para evitar colisiones de caché)
    cb(null, `${nombreLimpio}-${Date.now()}${ext}`);
  }
});

const upload = multer({ storage: storage });

// --- FUNCIONES AUXILIARES ---
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

// Middleware para verificar token JWT
const verificarToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization']
  if (typeof bearerHeader !== 'undefined') {
    const token = bearerHeader.split(' ')[1] // Formato: "Bearer TOKEN"
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Token inválido o expirado' })
      }
      req.user = decoded
      next() 
    })
  } else {
    res.status(401).json({ error: 'Acceso no autorizado: falta token' })
  }
}

// --- RUTAS DE LA API ---

// 1. GET: Traer todos los productos
app.get('/api/productos', (req, res) => {
  const productos = leerProductos();
  res.json(productos);
});

// 2. POST: Agregar producto con foto real (Multer)
// 'imagen' es el nombre del campo que enviará el formulario del front
app.post('/api/productos', verificarToken, upload.single('imagen'), (req, res) => {
  const productos = leerProductos();

  // Si se subió un archivo, multer nos da sus datos en req.file
  const nombreImagen = req.file ? req.file.filename : 'placeholder.png';

  const nuevoProducto = {
    id: Date.now(),
    nombre: req.body.nombre,
    descripcion: req.body.descripcion,
    imagen: nombreImagen, // Guardamos el nombre limpio que generó el backend
    precio: req.body.precio
  };

  productos.push(nuevoProducto);
  guardarProductos(productos);

  res.status(201).json({ mensaje: "Producto agregado con éxito", producto: nuevoProducto });
});

// 3. PUT: Modificar un producto
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
    // Por ahora no modificamos la foto para ir paso a paso
  };

  guardarProductos(productos);
  res.json({ mensaje: "Producto modificado con éxito", producto: productos[index] });
});

// 4. DELETE: Eliminar un producto (Arreglado para coincidencia de tipos)
app.delete('/api/productos/:id', verificarToken, (req, res) => {
  const id = req.params.id;
  let productos = leerProductos();

  // Buscamos si existe para poder borrar físicamente la foto antes de sacar el registro del JSON
  const productoAEliminar = productos.find(p => String(p.id) === String(id));

  if (!productoAEliminar) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  // Borramos la imagen de la carpeta public si no es el placeholder por defecto
  if (productoAEliminar.imagen && productoAEliminar.imagen !== 'placeholder.png') {
    const rutaImagen = path.join(__dirname, '..', 'frontend', 'public', 'productos', productoAEliminar.imagen);
    if (fs.existsSync(rutaImagen)) {
      fs.unlinkSync(rutaImagen); // Elimina el archivo físico de la computadora
    }
  }

  const filtrados = productos.filter(p => String(p.id) !== String(id));
  guardarProductos(filtrados);

  res.json({ mensaje: "Producto eliminado con éxito" });
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});




// Endpoint público para registrar cada visita
app.post('/api/visitas', (req, res) => {
  contadorVisitas++;
  res.json({ success: true });
});

// Endpoint protegido para consultar el total (solo admin)
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
            from: 'onboarding@resend.dev', // Dominio de prueba gratuito que te da Resend
            to: 'tu_mail_personal@gmail.com', // 👈 ACÁ PONES TU MAIL PERSONAL
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