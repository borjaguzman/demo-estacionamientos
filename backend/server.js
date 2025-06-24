const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;
const DB_FILE = 'ocupacion.db';

app.use(cors({ origin: '*' }));
app.use(express.json());

// Crear BD y tabla si no existe
const db = new sqlite3.Database(DB_FILE);
db.run(`
  CREATE TABLE IF NOT EXISTS ocupacion (
    hora TEXT PRIMARY KEY,
    A INTEGER, B INTEGER, C INTEGER, D INTEGER
  )
`);

// GET → consulta por hora actual
app.get('/api/estado', (req, res) => {
  console.log('Consulta estado actual');
    const now = new Date();
  const horaActual = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  db.get(`
    SELECT * FROM ocupacion
    WHERE hora <= ?
    ORDER BY hora DESC
    LIMIT 1
  `, [horaActual], (err, row) => {
    if (err) return res.status(500).json({ error: 'Error en BD' });
    if (!row) return res.status(404).json({ error: 'Sin datos disponibles' });

    res.json({
      hora: row.hora,
      zonas: { A: row.A, B: row.B, C: row.C, D: row.D }
    });
  });
});


// POST → guarda datos con upsert
app.post('/api/guardar', (req, res) => {

    console.log('Datos recibidos:', req.body);
    const { hora, zonas } = req.body;
  console.log('Guardando datos:', hora, zonas);
  db.run(`
    INSERT INTO ocupacion (hora, A, B, C, D)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(hora) DO UPDATE SET A=?, B=?, C=?, D=?
  `, [hora, zonas.A, zonas.B, zonas.C, zonas.D, zonas.A, zonas.B, zonas.C, zonas.D],
    (err) => {
      if (err) return res.status(500).json({ error: 'Error al guardar' });
      res.json({ message: 'Datos guardados correctamente' });
    });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
