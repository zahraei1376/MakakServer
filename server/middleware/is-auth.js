const jwt=require('jsonwebtoken');

module.exports=(req,res,next)=>{
    const authHeader=req.get('Authorization')
    if(!authHeader){
        const error=new Error('احراز هویت نشده :( ');
        error.statusCode=401;
        throw err;
    }
    const token=authHeader.split(' ')[1];
    let decodedToken;
    try{
        decodedToken = jwt.verify(token ,'MySuperSecret')
    }catch(err){
        err.statusCode=500;
        throw err;
    }
    if(!decodedToken){
        const error=new Error('تصدیق نشده است');
        error.statusCode=401;
        throw err;
    }
    req.userId=decodedToken.userId;
    next();
}