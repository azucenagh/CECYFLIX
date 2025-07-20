const express = require('express');
//const router = express.Router();
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
const peliculasRouter = require('./routers/peliculas');
require('dotenv').config();

//module.exports = router;
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.get('/', (req, res) => {
  res.send('Backend funcionando correctamente ✅');
});

app.post('/api/recomendaciones', async (req, res) => {
    const { prompt } = req.body;
    try {
        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'openrouter/cypher-alpha:free',
                messages: [{ role: 'user', content: prompt }],
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        const recomendacion = response.data.choices[0].message.content;
        res.json({ recomendacion });
    } catch (error) {
        console.error('Error en la API:', error.response?.data || error.message);
        res.status(500).json({ error: 'Error en el servidor proxy' });
    }
});

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ Conectado a MongoDB Atlas'))
    .catch((err) => console.error('❌ Error al conectar a MongoDB:', err));

// Usar la ruta de películas
app.use('/api/peliculas', peliculasRouter);
// (Tu ruta de /api/recomendaciones puede ir aquí también)

app.listen(PORT, () => {
    console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});