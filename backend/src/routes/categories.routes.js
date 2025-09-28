const router = require('express').Router();
const pool = require('../config/db');
const auth = require('../middlewares/auth');

router.get('/', auth, async (_req,res)=>{
    const [rows] = await pool.execute('SELECT * FROM categories ORDER BY nome');
    res.json(rows);
});

router.post('/', auth, async(req,res)=>{
    if(req.user.role!=='admin') return res.status(403).json({error:'admin apenas'});
    const {nome} = req.body;
    await pool.execute('INSERT INTO categories (nome) VALUES (?)',[nome]);
    res.status(201).json({ok:true});
});
module.exports = router;
