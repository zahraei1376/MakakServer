const express=require('express');
const UserController=require('../Controller/UserController');
const Users=require('../models/Users');
const isAuth=require('../middleware/is-auth');
const { check ,body } = require('express-validator/check');

let Usercnl=new UserController();
const router=express.Router();

router.post('/register',
[
    check('email')
    .isEmail()
    .withMessage('لطفا یک ایمیل معتبر وارد کنید :(')
    .normalizeEmail()
    .custom((value,{req})=>{
        return Users.findOne({email:value}).then(userDoc=>{
            if(userDoc){
                return Promise.reject('ایمیل وجود دارد')
            }
        })
    }),
    body('username')
    .trim()
    .isAlphanumeric()
    .isLength({min:5})
    .withMessage('نام کاربری باید حداقل 5 کارکتر و شامل حروف باشد :(')
    .custom((value,{req})=>{
        return Users.findOne({username:value}).then(userDoc=>{
            if(userDoc){
                return Promise.reject('نام کاربری وجود دارد')
            }
        })
    }),
    body('name')
    .trim()
    .isAlpha()
    .not().isEmpty()
    .withMessage('نام و نام خوانوادگی نبابد خالی و باید شامل  کارکتر و حروف باشد :('),
    body(
        'password',
        'پسورد باید حداقل 5 کارکتر و شامل اعداد و کارکتر های معتبر باشد'
        )
    .isLength({min:5})
    .isAlphanumeric()
    .trim(),
    body('confirmPassword')
    .trim()
    .custom((value,{req})=>{
        if(value!==req.body.password)
        {
            throw new Error('پسورد ها با هم مطابقت ندارند :(')
        }
        return true;
    }),
    body('mobileNumber')
    .trim()
    .isLength(11)
    .isNumeric()
    .withMessage('شماره موبایل باید 11 عدد باشد'),
],
    Usercnl.register)
router.post('/Login',Usercnl.login)
router.put('/RegisterTeacher',isAuth,[
    body('university')
    .trim()
    .isAlpha()
    .isLength({min:2})
    .withMessage('نام دانشگاه باید حداقل 2 کارکتر و شامل حروف باشد :('),
    body(
        'Grade',
        'مقطع تحصیلی باید حداقل 2 کارکتر و شامل  کارکتر های معتبر باشد'
        )
    .isLength({min:2})
    .isAlpha()
    .trim(),
    body(
        'field',
        'رشته تحصیلی باید حداقل 2 کارکتر و شامل کارکتر های معتبر باشد'
        )
    .isLength({min:2})
    .isAlphanumeric()
    .trim(),
],Usercnl.RegisterTeacher)
router.delete('/RemoveTeacher/:teacherId',Usercnl.RemoveTeacher)
router.post('/Needverify',Usercnl.Needverify)
router.post('/verifyTeacher',Usercnl.verifyTeacher)
router.post('/Addcomment',Usercnl.AddComment)
router.get('/ShowTeacher',Usercnl.ShowTeacher)
router.post('/AddAdmin',Usercnl.AddAdmin)
router.post('/getCourse',Usercnl.getCourse)
router.post('/UploadFile',Usercnl.UploadFile)
router.get('/dashbord/:username',Usercnl.dashbord)
router.put('/EditProfile',Usercnl.EditProfile)
router.get('/download/:fileId',Usercnl.getFile)

router.use('*',(req,res,next)=>{
    res.send(
        '<h1 style=color:red>404</h1>'
        )
})

module.exports=router;





// module.exports=(app)=>{
    // .isAlphaNumber ---->برای چک کردن ای
// app.post('/register',
// [
//     check('email')
//     .isEmail()
//     .withMessage('لطفا یک ایمیل معتبر وارد کنید :(')
//     .normalizeEmail()
//     .custom((value,{req})=>{
//         return Users.findOne({email:value}).then(userDoc=>{
//             if(userDoc){
//                 return Promise.reject('ایمیل وجود دارد')
//             }
//         })
//     }),
//     body('username')
//     .trim()
//     .isAlphanumeric()
//     .isLength({min:5})
//     .withMessage('نام کاربری باید حداقل 5 کارکتر و شامل حروف باشد :(')
//     .custom((value,{req})=>{
//         return Users.findOne({username:value}).then(userDoc=>{
//             if(userDoc){
//                 return Promise.reject('نام کاربری وجود دارد')
//             }
//         })
//     }),
//     body('name')
//     .trim()
//     .isAlpha()
//     .not().isEmpty()
//     .withMessage('نام و نام خوانوادگی نبابد خالی و باید شامل  کارکتر و حروف باشد :('),
//     body(
//         'password',
//         'پسورد باید حداقل 5 کارکتر و شامل اعداد و کارکتر های معتبر باشد'
//         )
//     .isLength({min:5})
//     .isAlphanumeric()
//     .trim(),
//     body('confirmPassword')
//     .trim()
//     .custom((value,{req})=>{
//         if(value!==req.body.password)
//         {
//             throw new Error('پسورد ها با هم مطابقت ندارند :(')
//         }
//         return true;
//     }),
//     body('mobileNumber')
//     .trim()
//     .isLength(11)
//     .isNumeric()
//     .withMessage('شماره موبایل باید 11 عدد باشد'),
// ],
//     Usercnl.register)
// app.post('/Login',Usercnl.login)
// app.put('/RegisterTeacher',[
//     body('university')
//     .trim()
//     .isAlpha()
//     .isLength({min:2})
//     .withMessage('نام دانشگاه باید حداقل 2 کارکتر و شامل حروف باشد :('),
//     body(
//         'Grade',
//         'مقطع تحصیلی باید حداقل 2 کارکتر و شامل  کارکتر های معتبر باشد'
//         )
//     .isLength({min:2})
//     .isAlpha()
//     .trim(),
//     body(
//         'field',
//         'رشته تحصیلی باید حداقل 2 کارکتر و شامل کارکتر های معتبر باشد'
//         )
//     .isLength({min:2})
//     .isAlphanumeric()
//     .trim(),
// ],Usercnl.RegisterTeacher)
// app.delete('/RemoveTeacher/:teacherId',Usercnl.RemoveTeacher)
// app.post('/Needverify',Usercnl.Needverify)
// app.post('/verifyTeacher',Usercnl.verifyTeacher)
// app.post('/Addcomment',Usercnl.AddComment)
// app.get('/ShowTeacher',Usercnl.ShowTeacher)
// app.post('/AddAdmin',Usercnl.AddAdmin)
// app.post('/getCourse',Usercnl.getCourse)
// app.post('/UploadFile',Usercnl.UploadFile)
// app.get('/dashbord/:username',Usercnl.dashbord)
// app.put('/EditProfile',Usercnl.EditProfile)
// app.get('/download/:fileId',Usercnl.getFile)

// app.use('*',(req,res,next)=>{
//     res.send(
//         '<h1 style=color:red>404</h1>'
//         )
// })

// }