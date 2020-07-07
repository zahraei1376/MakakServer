const mongoose=require('mongoose');
const schema=mongoose.Schema;

const CommentSchema=new schema({
    content:String,
    User:[{
        type:schema.Types.ObjectId,
        ref:'user'
    }]
});

CommentSchema.pre('remove',function(next){
    const usermodel=mongoose.model('user');
    usermodel.delete({_id:{$in:this.User}})
    .then(()=>next());
})

const CommentModel=mongoose.model('Comment',CommentSchema);
module.exports=CommentModel;





// const mongoose=require('mongoose');
// const schema=mongoose.Schema;

// const CommentSchema=new schema({
//     content:String,
//     user:{
//         type:schema.Types.ObjectId,
//         ref:'user'
//     }
// })

// const CommentModel=mongoose.model('Comment',CommentSchema);
// module.exports=CommentModel;