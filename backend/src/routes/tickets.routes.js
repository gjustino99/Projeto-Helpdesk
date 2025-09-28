const router = require('express').Router();
const pool = require('../config/db');
const auth = require('../middlewares/auth');

router.get('/', auth, async (req,res)=>{
    const {q='', status='', category_id=''} = req.query;
    const where = [];
    const args = [];
    if(q) { where.push('(titulo LIKE ? OR descricao LIKE ?)'); args.push(`%${q}`,`%${q}%`); }
    if (status){where.push('status = ?'); args.push(status);}
    if (category_id){where.push('category_id = ?'); args.push(category_id);}
    const sql = `
        SELECT t.*, u.nome AS autor, c.nome AS categoria
        FROM tickets t
        JOIN users u ON u.id=t.user_id
        LEFT JOIN categories c ON c.id=t.category_id
        ${where.length ? 'WHERE '+where.join(' AND '):''}
        ORDER BY t.updated_at DESC
        `;
        const [rows] = await pool.execute(sql, args);
        res.json(rows);
});

router.get('/:id', auth, async (req,res)=>{
    const [rows] = await pool.execute(
        `SELECT t.* u.nome autor, c.nome categoria
        FROM tickets t JOIN users u ON u.id=t.user_id
        LEFT JOIN categories c ON c.id=t.category_id
        WHERE t.id=?`, [req.params.id]
    );
    if(!rows[0]) return res.status(404).json({error:'não encontrado'});
    res.json(rows[0]);
});

router.post('/', auth, async (req,res)=>{
    const {titulo, descricao, category_id} = req.body;
    if(!titulo || !descricao) return res.status(400).json({error:'título e descrição são obrigatórios'});
    const [r] = await pool.execute(
        `INSERT INTO tickets(user_id,category_id,titulo,descricao)
        VALUES (?,?,?,?)`, [req,user.id, category_id||null, titulo, descricao]
    );
    res.status(201).json({id:r.insertId});
});

router.put('/:id/status',auth, async (req,res)=>{
    const {status} = req.body;
    if(!['aberto','em_andamento','resolvido','fechado'].includes(status))
        return res.status(400).json({error:'status inválido'});
    await pool.execute(`UPDATE tickets SET status=? WHERE id=?`, [status, req.params.id]);
    res.json({ok:true});
});

router.delete('/:id', auth, async (req,res)=>{
    await pool.execute('DELETE FROM tickets WHERE id=? AND user_id=?',[req.params.id,req.user.id]);
    res.json({ok:true});
});

module.exports = router;