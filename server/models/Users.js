const mongoose=require('mongoose');

const schema=mongoose.Schema;

const UserSchema=new schema({
    name:{
        type:String,
        required:[true,'فیلد نام  را پر کنید!!!']
    },
    mobileNumber:{
        type:String
        // required:[true,'فیلد شماره تلفن  را پر کنید!!!']
    },
    email:{
        type:String
    },
    username:{
        type:String,
        minlength: 5,
        unique: true,
        required:[true,'Username is required!!!']
    },
    password:{
        type:String,
        validate:{
            validator:(password)=>password.length>2,
            message:"پسورد باید بیشتر از 2 حرف باشد!!!"
        },
        required:[true,'password is required!!!']
    },
    describtion:{//for teacher
        type:String
        // validate:{
        //     validator:(describtion)=>describtion.length>2,
        //     message:"نام باید بیشتر از 2 حرف باشد!!!"
        // },
        // required:[true,'describtion is required!!!']
    },
    university:{
        type:String
    },
    Grade:{
        type:String
    },
    field:{
        type:String
    },
    isAdmin:{
        type:Boolean
    },
    isTeacher:{
        type:Boolean
    },
    Accepted:{
        type:Boolean
    },
    ImageUrl:{
        type:String
    },
    Comments:[{
        type:schema.Types.ObjectId,
        ref:'Comment'
    }],
    Courses:[{
        type:schema.Types.ObjectId,
        ref:'course'
    }]
},{timestamps:true})

const User=mongoose.model('user',UserSchema);
module.exports=User;