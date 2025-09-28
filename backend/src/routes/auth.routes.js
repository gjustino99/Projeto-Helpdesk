const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');


router.post('/register', async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Dados incompletos' });
    }

    try {
        const hash = await bcrypt.hash(senha, 10);

        const [r] = await pool.execute(
            'INSERT INTO users (nome, email, senha_hash) VALUES (?, ?, ?)',
            [nome, email, hash] 
        );

        res.status(201).json({ id: r.insertId, nome, email });

    } catch (e) {
        res.status(400).json({ error: 'Email já cadastrado? ' + e.message });
    }
});


router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: 'Dados incompletos' });
    }

    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const ok = await bcrypt.compare(senha, user.senha_hash);

        if (!ok) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, nome: user.nome },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                nome: user.nome,
                role: user.role
            }
        });
    } catch (e) {
        res.status(500).json({ error: 'Erro ao realizar login: ' + e.message });
    }
});

module.exports = router;
