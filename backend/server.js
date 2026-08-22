// backend/server.js

// 1. Importar dependencias
require('dotenv').config();
const express        = require('express');
const cors           = require('cors');
const mongoose       = require('mongoose');
const Producto       = require('./models/Producto');
const authRoutes     = require('./routes/auth');         // ← NUEVO S14
const verificarToken = require('./middleware/auth');     // ← NUEVO S14
const verificarAdmin = require('./middleware/admin');    // ← NUEVO S14

// 2. Crear la aplicación y definir el puerto
const app  = express();
const PORT = process.env.PORT || 3000;

// 3. Activar middlewares globales
app.use(cors());
app.use(express.json());

// 11. Rutas de autenticación ← NUEVO S14
app.use('/api/auth', authRoutes);

// 4. Conectar con MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch((err) => console.error('❌ Error de conexión:', err));

// 5. GET /api/productos — público (cualquiera puede ver el catálogo)
app.get('/api/productos', async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// 6. POST /api/productos — solo admin
app.post('/api/productos', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const nuevoProducto = await Producto.create(req.body);
    res.status(201).json(nuevoProducto);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 7. PUT /api/productos/:id — solo admin
app.put('/api/productos/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const actualizado = await Producto.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!actualizado) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(actualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 8. DELETE /api/productos/:id — solo admin
app.delete('/api/productos/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const eliminado = await Producto.findByIdAndDelete(req.params.id);
    if (!eliminado) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ mensaje: 'Producto eliminado correctamente', eliminado });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 9. Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'Servidor NEXO ✅' });
});

// 10. Arrancar el servidor
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});