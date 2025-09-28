const router = require('express').Router();
const pool = require('../config/db');
const auth = require('../middlewares/auth');

router.get('/:ticket_id', auth, async (req,res)=>{
    const [rows] = await pool.execute(
        `SELECT c.*, u.nome autor FROM comments c JOIN users u ON u.id=c.user_id
        WHERE ticket_id=? ORDER BY c.created_at ASC`, [req.params.ticket_id]
    );
    res.json(rows);
});

router.post('/ticket_id', auth, async (req,res)=>{
    const {conteudo} = req.body;
    await pool.execute(
        `INSERT INTO comments (ticket_id,user_id,conteudo) VALUES (?,?,?)`,
        [req.params.ticket_id,req.user.id, conteudo]
    );
    res.status(201).json({ok:true});
});
module.exports = router;
