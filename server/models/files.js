const mongoose=require('mongoose');

const schema=mongoose.Schema;
const FileSchema=new schema({
    titleFile:String,
    // file:File,
    user:{ type:schema.Types.ObjectId , ref:'user'}
})

FileSchema.pre('remove',function(next){
    const usermodel=mongoose.model('user');
    usermodel.delete({_id:{$in:this.user}})
    .then(()=>next());
})

const fileModel=mongoose.model('file',FileSchema);
module.exports=fileModel;