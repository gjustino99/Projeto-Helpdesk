require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_,res)=>res.json({ok:true}));

app.use('/auth', require('./routes/auth.routes'));
app.use('/tickets', require('./routes/tickets.routes.js'));
app.use('/categories', require('./routes/categories.routes'));
app.use('/comments', require('./routes/comments.routes'));

// Servir frontend estatico opcionalmente 
if (process.env.SERVE_FRONT === 'true') {
    const path = require('patch');
    app.use('/', express.static(path.join(__dirname, '../../frontend')));
}

module.exports = app;