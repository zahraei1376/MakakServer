const mongoose=require('mongoose');

const schema=mongoose.Schema;

const CoursesSchema=new schema({
    nameCours:{
        type:String
    },
    // User:[{
    //     type:schema.Types.ObjectId,
    //     ref:'user'
    // }],
    files:[{
        type:schema.Types.ObjectId,
        ref:'file'
    }]
});

CoursesSchema.pre('remove',function(next){
    const filemodel=mongoose.model('file');
    filemodel.delete({_id:{$in:this.files}})
    .then(()=>next());
})

const ModelCourse=mongoose.model('course',CoursesSchema);
module.exports=ModelCourse;