const fs=require('fs');

const deletefile=(filePath)=>{
    fs.unlink(filePath ,(err)=>{
        if(err){
            throw err;
        }
    })
}
module.deletefile=deletefile;