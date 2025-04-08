

const mongoose=require("mongoose");

const songSchema=new mongoose.Schema({
    song:{
        type:String,
       
    },
    artist:{
        type:String,
    },
    album:{
        type:String,
    },
    duration:{
        type:String,
    },
    image:{
        type:String,
    },
    
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"userModel",
    }
});

const songMOdel=mongoose.model("song",songSchema);

module.exports=songMOdel;