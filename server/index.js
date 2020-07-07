const express=require('express');
const path=require('path');
const mongoose=require('mongoose');
const multer=require('multer');
// ============================================
mongoose.connect('mongodb://localhost/makak',{useNewUrlParser:true});
mongoose.connection
.once('open',()=>{
    console.log("you are connect to db");
})
.on('error',(error)=>{
    console.log('warning',error);
})


var app=express();
// ============================================
app.use(express.static(__dirname +'/public'));
app.use('/image',express.static(path.join(__dirname ,'images')));
app.use(express.json());//api example mobile app
app.use(express.urlencoded({extended:true}));//json web
// ============================================
const fileStorage=multer.diskStorage({
    destination:(req,file,cb)=>{//مقصد
        cb(null,'image');
    },
    filename:(req,file,cb)=>{//نام فایل
        cb(null,new Date().toISOString() + '-'+ file.originalname)
    }
})

const fileFilter=(req,file,cb)=>{
    if(file.mimetype==='image/pmg'|| file.mimetype==='image/jpg' || file.mimetype==='image/jpeg'){
        cb(null,true);
    }else{
        cb(null,false);
    }
}

app.use(multer({storage:fileStorage,fileFilter:fileFilter}).single('image'));
// ============================================
var router=require('./Routes/Rout');
// app.set('view engine','ejs');

app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods',"OPIONS,GET,POST,PUT,PATCH,DELETE");
    res.setHeader('Access-Control-Allow-Headers','Content-Type','Authorizaion');
    next();
});

// router(app);
app.use(router)
app.use((error,req,res,next)=>{
    console.log(error);
    const status=error.statusCode || 500;
    const message=error.message;
    const data=error.data;
    res.status(status).json({message:message , data:data});   
})


app.listen(7000);