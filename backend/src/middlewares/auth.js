const jwt = require('jsonwebtoken');
module.exports = (req,res,next)=>{
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if(!token) return res.status(401).json({error:'token ausente'});
    try{
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        next();
    } catch(e){
        res.status(401).json({error:'token inválido'});
    }
};
