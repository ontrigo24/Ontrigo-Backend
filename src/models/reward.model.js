const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema(                       // need to rethink latter
    {
        title:{
            type:String,
            required:true,
        },
        icon:{
            type:String,
            required:true,
        },
        points:{
            type:Number,
            required:true,
        },
    },
    {
        timestamps: true,
    }
);


module.exports =  mongoose.model("Reward", rewardSchema);