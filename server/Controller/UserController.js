const Users=require('../models/Users');
const Filesmodel=require('../models/files');
const CommentModel=require('../models/Comments');
const Courses=require('../models/Courses');
const fileHelper=require('../Utill/file');

const jwt=require('jsonwebtoken');
const bcrypt=require('bcryptjs');
const fs=require('fs');
const pdfkit=require('pdfkit');
const {validationResult} = require('express-validator/check');

module.exports=class UserController{
    // /////////////////////////////////
    AddAdmin(req,res){
        var username=req.body.username;
        var name=req.body.name;
        var mobileNumber=req.body.mobileNumber;
        var pass=req.body.password;
        var password=bcrypt.hashSync(req.body.password,10);
        if(username.length<5)
        {
            res.status(500).json({'seccess':false,message:"نام کاربری باید 5 کلمه یا بیشتر باشد"});
        }
        else if(pass<5)
        {
            res.status(500).json({'seccess':false,message:"پسورد باید 5 کلمه یا بیشتر باشد"});
        }
        else if(name.length<2){
            res.status(500).json({'seccess':false,message:"نام  باید 2 کلمه یا بیشتر باشد"});
        }
        else if(mobileNumber.length<11)
        {
            res.status(500).json({'seccess':false,message:"شماره موبایل باید11 عدد باشد"});
        }
        else{
            Users.findOne({username:username})
            .then((user)=>{
                if(user){
                    res.status(500).json({'seccess':false,message:"نام کاربری وجود دارد"})
                }
                else{
                    const UserRegister=new Users({
                        username:username,
                        password:password,
                        name:name,
                        mobileNumber:mobileNumber,
                        isAdmin:true,
                        isTeacher:false,
                        Accepted:false,
                        describtion:"",
                        university:"",
                        Grade:"",
                        field:""
                    })
                    // console.log(UserRegister);
                    UserRegister.save();
                    res.status(200).json({'seccess':true});
                } 
            })
        }
        
    }
    // /////////////////////////////////////////////////////////////
    EditProfile(req,res){

    }

    // /////////////////////////////////////////////////////////////
    dashbord(req,res)
    {
        // var name=req.param("username");///user?name=zahra
        // res.send(`hello ${name}`)
        let usr=req.session.auth.id;
        Users.findById({ _id : usr }).populate('Courses')
        .then((user)=>{
            // res.send(user);
            if(user.isTeacher==true && user.Accepted==true){
                res.send({
                    status:"1",//teacher
                    username:user.username,
                    name:user.name,
                    ImageUrl:user.ImageUrl,
                    mobileNumber:user.mobileNumber,
                    email:user.email,
                    describtion:user.describtion,
                    university:user.university,
                    Grade:user.Grade,
                    field:user.field
                    // Courses
                });
            }
            else{
               res.send(user);
            }
        })
    }
    // /////////////////////////////////////////////////////////////
     UploadFile(req,res){
        // let id="";
        let teacher=req.session.auth.id;
        Users.findById({_id:teacher})
        .then((user)=>{
            if(user.isTeacher==true){
                let title=req.body.title;
                let Cname=req.body.Cname;
                const filee=new Filesmodel({
                    titleFile:title,
                    user:user
                })
                filee.save();
                Courses.find({'_id':user.Courses})
                .then((cr)=>{
                    for(let i=0;i<cr.length;i++)
                    {
                        if(cr[i].nameCours==Cname)
                        {
                            cr[i].files.push(filee)
                            cr[i].save(function(err){
                            if(err){
                                res.status(500).json({'seccess':false,message:"پس از مدتی مجددا امتحان کنید"})
                            }
                            res.status(201).json({'seccess':true,message:"فایل آپلود شد"})
                            })
                        }
                    }
                    // for(let crs of cr)
                    // res.status(401).json({'status':false,message:"شما این درس را اخذ نکرده اید"})
                })
            }
            else{
                res.status(401).json({'seccess':false,message:"شما اجازه دسترسی ندارید"})
            }
        })
    }
    // /////////////////////////////////////////////////////////////
    getCourse(req,res){
        let courseName="";
        let id=req.session.auth.id;
        let courseId=req.body.value;
        switch(courseId)
        {
            case 1:courseName="C#";break;
            case 2:courseName="C++";break;
            case 3:courseName="java";break;
            case 4:courseName="python";break;
        }
        Users.findOne({"_id":id})
        .then((user)=>{
            if(user.isTeacher==true){
                const Course=new Courses({
                    nameCours:courseName
                    // User:user
                })
                Course.save()
                user.Courses.push(Course);
                user.save(function(err){
                    if(err){
                        res.status(500).json({'seccess':false,message:"پس از مدتی مجددا امتحان کنید"})
                         return;
                    }
                    res.status(201).json({'seccess':user})
                })
            }
            else{
                res.status(401).json({'seccess':false,message:"شما اجازه دسترسی ندارید"});
            }
        })
    }
    // /////////////////////////////////////////////////////////////
    AddComment(req,res){
        let id=req.session.auth.id
        // let usernamee=req.session.auth.username;
        var content=req.body.content;
        Users.findOne({_id:id})
        .then((user)=>{
            const comment=new CommentModel({
                content:content,
                User:user
            });
            comment.save();
            user.Comments.push(comment);
            // Promise.all(comment.save(),user.save())
            user.save(function(err){
                if(err){
                    res.status(500).json({'seccess':false,message:"پس از مدتی مجددا امتحان کنید"})
                     return;
                }
                res.status(201).json({'seccess':user})
            })
            // res.status(201).json({'status':user})
        })
    }
    // /////////////////////////////////////////////////////////////
    Needverify(req,res){
        Users.find({isTeacher:true,Accepted:false})
        .then((teachers)=>{
            res.send(teachers);
        })
    }
    // /////////////////////////////////////////////////////////////
    verifyTeacher(req,res){
        var id=req.session.auth.id;
        Users.findById({_id:id})
        .then((admin)=>{
            if(admin.isAdmin===true){
                var verify=req.body.verify;
                var username=req.body.username;
                if(verify===true){
                    Users.findOneAndUpdate({username:username},{Accepted:true})
                    .then(
                        res.status(200).json({'seccess':true,message:"به عنوان معلم درج شد!!"})
                    )  
                }else{
                    Users.findOneAndUpdate({username:username},{describtion:"",isTeacher:false,university:"",Grade:"",field:"",Accepted:false})
                    .then(
                        res.status(200).json({'seccess':true,message:"اطلاعات پاک شد!!"})
                    )  
                }
            }else{
                res.status(200).json({'seccess':true,message:"شما اجازه دسترسی ندارید"})
            }
        })
    }
    
     // /////////////////////////////////////////////////////////////
     getFile(req,res){
         const fileId=req.params.fileId;
         const fileName='file-'+ fileId + 'pdf';
         const filePath=path.join('','',fileName);
        //  fs.readFile(filePath,(err,data)=>{
        //     if(err){
        //         return next(err);
        //     }
        //     res.setHeader('Content-Type','application/pdf');
        //     // res.setHeader('Content-Disposition','attachment;fileName="'+ fileName +'"');
        //     res.setHeader('Content-Disposition','inline;fileName="'+ fileName +'"');
        //     res.send(data);
        //  })
        const file=fs.createReadStream(filePath);
        res.setHeader('Content-Type','application/pdf');
        res.setHeader('Content-Disposition','inline;fileName="'+ fileName +'"');
        file.pipe(res);
        //create pdf
        // const pdfDoc=new pdfkit();
        // res.setHeader('Content-Type','application/pdf');
        // res.setHeader('Content-Disposition','inline;fileName="'+ fileName +'"');
        // pdfDoc.pipe(fs.createReadStream(filePath));
        // pdfDoc.pipe(res);
        // pdfDoc.fontSize(26).text('ghskhdjd',{
        //     underline:true
        // })
        // pdfDoc.text('hello!!');
        // pdfDoc.end();
     }
      // /////////////////////////////////////////////////////////////
    ShowTeacher(req,res){
        // const coo=req.get('Cookie').split(';')[0].trim().split('=')[1];
        // res.send(coo);
        const currentPage=req.query.page || 1 ;
        const perpage=2;
        let totalItem;
        Users.find({isTeacher:true,Accepted:true})
        .countDocuments()
        .then((count)=>{
            totalItem=count;
            return Users.find({isTeacher:true,Accepted:true})
                .skip(( currentPage - 1 )*perpage)
                .limit(perpage)
        })
        .then((teachers)=>{
            res.status(200).json({message:"بارگیری شد!!",teachers:teachers , totalItem:totalItem})
        })
        .catch(err=>{
            if(!err.statusCode){
                err.statusCode=500;
            }
            next(err);
        })
    }
     // /////////////////////////////////////////////////////////////
    RemoveTeacher(req,res){
        const admin=req.session.auth.id;
        
        Users.findById({_id:admin})
        .then((user)=>{
            if(user.isAdmin==true){
                // let ReTeacher=req.body.username;
                const tchId=req.params.teacherId
                Users.findOne({_id:tchId})
                .then((us)=>{
                    if(!us){
                        const error=new Error('معلم پیدا نشد :(');
                        error.statusCode=404;
                        throw error
                    }
                    Filesmodel.deleteMany({ user : us._id },function(err){
                        if(err){
                            throw err
                        } 
                        else{
                            Courses.deleteMany({ _id : { $in : us.Courses } },function(err){
                                if(err){
                                    throw err
                                }
                                else{
                                    fileHelper.deletefile(us.ImageUrl)
                                    return Users.findByIdAndRemove(tchId)
                                    .then(result=>{
                                        console.log(result)
                                        res.status(200).json({'seccess':true,message:"removed teacher"})
                                    }
                                        // us.remove()
                                        // .then(
                                        //     res.status(200).json({'seccess':true,message:"removed teacher"})
                                        // )
                                    )
                                }
                            })
                        }
                    })
                })
                .catch(err=>{
                    if(!err.statusCode){
                        err.statusCode=500;
                    }
                    next(err);
                })
            }
            else{
                res.status(401).json({'seccess':false,message:"شما اجازه دسترسی ندارید"})
            }
        })
    }
    // /////////////////////////////////////////////////////////////
    RegisterTeacher(req,res){
        const id=req.session.auth.id;
        const university=req.body.university;
        const Grade=req.body.Grade;//مقطع تحصیلی
        const field=req.body.field;//رشته
        const image=req.file;
        const desc=req.body.describtion;
        const errors=validationResult(req);
        if(!errors.isEmpty()){
            const error=new Error('داده درست را وارد کنید :( ');
            error.statusCode=422;
            throw err;
        }
        if(!image){
            const error=new Error('تصویری آپلود نشده است :( ');
            statusCode=422;
            throw error;
            // res.status(200).json({'seccess':true,message:''})
        }
        ImageUrl=image.path;
        Users.findByIdAndUpdate(id,{describtion:desc,isTeacher:true,university:university,Grade:Grade,field:field,Accepted:false,ImageUrl:ImageUrl})
        .then(
            res.status(200).json({'seccess':true,message:'اطلاعات شما ثبت شد منتطر تایید مدیر سایت باشید با تشکر'})
        )  
        .catch(err=>{
            if(!err.statusCode){
                err.statusCode=500;
            }
            next(err);
        })             
    }
     // /////////////////////////////////////////////////////////////
    register(req,res){
        const errors=validationResult(req);
        if(!errors.isEmpty()){
            const error=new Error("داده وارد شده نامعتبر است :(");
            error.statusCode=422;
            error.data=errors.array()
            throw error;
            // return res
            // .status(422)
            // .json({
            //     message:"داده وارد شده نامعتبر است :(",
            //     errors:errors.array()
            // });
        }
        const username=req.body.username;
        const name=req.body.name;
        const mobileNumber=req.body.mobileNumber;
        const email=req.body.email;
        const password=req.body.password;
        bcrypt.hash(password,12)
        .then(hashPw=>{
            const UserRegister=new Users({
                username:username,
                password:hashPw,
                name:name,
                email:email,
                mobileNumber:mobileNumber,
                isAdmin:false,
                isTeacher:false,
                Accepted:false,
                describtion:"",
                university:"",
                Grade:"",
                field:""
            });
            return UserRegister.save();  
        })
        .then(result=>{
            res.status(201).json({'seccess':true,message:'کاربر تشکیل شد!!',userId:result._id});
        })
        .catch(err=>{
            if(!err.statusCode){
                err.statusCode=500;
            }
            next(err)
        })
        // const password=bcrypt.hashSync(req.body.password,12)
        // Users.findOne({username:username})
        // .then((user)=>{
        //     if(user){
        //         res.status(401).json({'seccess':false,message:"نام کاربری وجود دارد"})
        //     }
        //     else{
        //         const UserRegister=new Users({
        //             username:username,
        //             password:password,
        //             name:name,
        //             email:email,
        //             mobileNumber:mobileNumber,
        //             isAdmin:false,
        //             isTeacher:false,
        //             Accepted:false,
        //             describtion:"",
        //             university:"",
        //             Grade:"",
        //             field:""
        //         })
        //         UserRegister.save()
        //         .then(result=>{
        //             res.status(200).json({'seccess':true,'user':result});
        //         })
        //         .catch(err=>{
        //             if(!err.statusCode){
        //                 err.statusCode=500;
        //             }
        //             next(err)
        //         })
        //         // res.status(200).json({'seccess':true});
        //     } 
        // })
        // /////////////////
        // if(username.length<5)
        // {
        //     res.status(401).json({'seccess':false,message:"نام کاربری باید 5 کلمه یا بیشتر باشد"});
        // }
        // else if(pass<5)
        // {
        //     res.status(401).json({'seccess':false,message:"پسورد باید 5 کلمه یا بیشتر باشد"});
        // }
        // else if(name.length<2){
        //     res.status(401).json({'seccess':false,message:"نام  باید 2 کلمه یا بیشتر باشد"});
        // }
        // else if(mobileNumber.length<11)
        // {
        //     res.status(401).json({'seccess':false,message:"شماره موبایل باید11 عدد باشد"});
        // }
        // else{
        //     Users.findOne({username:username})
        //     .then((user)=>{
        //         if(user){
        //             res.status(401).json({'seccess':false,message:"نام کاربری وجود دارد"})
        //         }
        //         else{
        //             const UserRegister=new Users({
        //                 username:username,
        //                 password:password,
        //                 name:name,
        //                 email:email,
        //                 mobileNumber:mobileNumber,
        //                 isAdmin:false,
        //                 isTeacher:false,
        //                 Accepted:false,
        //                 describtion:"",
        //                 university:"",
        //                 Grade:"",
        //                 field:""
        //             })
        //             // console.log(UserRegister);
        //             UserRegister.save();
        //             res.status(200).json({'seccess':true});
        //         } 
        //     })
        // }
    }
    // /////////////////////////////////////////////////////////////
    login(req,res){
        let username=req.body.username;
        let password=req.body.password;
        let loadedUser;
        Users.findOne({username:username})
        .then((userlogin)=>{
            if(!userlogin){
                const error = new Error('کاربر با این نام کاربری وجود ندارد :( ');
                error.statusCode = 401;
                throw error;
            }
            loadedUser=userlogin;
            return bcrypt.compare(password,userlogin.password)
        })
        .then(isEqual=>{
            if(!isEqual){
                const error=new Error('پسورد اشتباه است :( ');
                error.status=401;
                throw error;
            }
            const token= jwt.sign({
                email:loadedUser.email,
                userId:loadedUser._id.tostring()
            },
            'MySuperSecret',
            {expiresIn:'1h'}
            );
            res.statusCode(200).json({token:token,userId:loadedUser._id.tostring()})
        })
        .catch(err=>{
            if(!err.statusCode){
                err.statusCode=500;
            }
            next(err);
        })
        //     if(userlogin===null){
        //         res.status(401).json({'seccess':false,message:'نام کاربری یا پسورد اشتباه است :('});
        //     }
        //     if(!(bcrypt.compareSync(password,userlogin.password)) )
        //     {
        //         res.status(401).json({'seccess':false,message:"نام کاربری یا پسورد اشتباه است :("});
        //     }
        //     // req.session.auth={id: userlogin._id};
        //     // res.setHeader('Set-Cookie','LoggedIn=true');
        //     // res.redirect('/');
        //     // req.session.auth.username=userlogin.username;
        //     res.status(200).json({'seccess':true,username:userlogin.username});
        // // })
        // const errors=validationResult(req);
        // if(!errors.isEmpty()){
        //     const error=new Error("داده وارد شده نامعتبر است :(");
        //     error.statusCode=422;
        //     throw error;
        // }
        // else{
        //     Users.findOne({username:username})
        //     .then((userlogin)=>{
        //         if(userlogin===null){
        //             res.status(401).json({'seccess':false,message:'نام کاربری یا پسورد اشتباه است :('});
        //         }
        //         if(!(bcrypt.compareSync(password,userlogin.password)) )
        //         {
        //             res.status(401).json({'seccess':false,message:"نام کاربری یا پسورد اشتباه است :("});
        //         }
        //         // req.session.auth={id: userlogin._id};
        //         // res.setHeader('Set-Cookie','LoggedIn=true');
        //         // res.redirect('/');
        //         // req.session.auth.username=userlogin.username;
        //         res.status(200).json({'seccess':true,username:userlogin.username});
        //     })
        // }
       
    }
    // /////////////////////////////////////////////////////////////
    // /////////////////////////////////////////////////////////////
}