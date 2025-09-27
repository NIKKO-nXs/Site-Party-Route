const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./models');

const app = express();
const PORT = 3000;
const SECRET = "segredo_super_seguro_party_route";

app.use(cors());
app.use(express.json());

app.post('/api/register', (req, res) => {
  const { nome, email, senha } = req.body;
  const hash = bcrypt.hashSync(senha, 10);
  db.run(`INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)`,
    [nome, email, hash],
    function (err) {
      if (err) return res.status(400).json({ error: "Usuário já existe" });
      res.json({ success: true });
    });
});

app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;
  db.get(`SELECT * FROM usuarios WHERE email = ?`, [email], (err, user) => {
    if (!user) return res.status(400).json({ error: "Usuário não encontrado" });
    const valid = bcrypt.compareSync(senha, user.senha);
    if (!valid) return res.status(400).json({ error: "Senha incorreta" });
    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "1h" });
    res.json({ token });
  });
});

app.listen(PORT, () => console.log(`✅ Party Route rodando em http://localhost:${PORT}`));