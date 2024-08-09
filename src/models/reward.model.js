const mongoose = require('mongoose');

const rewardSchema = mongoose.Schema(                       // need to rethink latter
    {
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required: true,
        },
        totalAmount:{
            type:Number,
            required:true,
        },
        rewards:[{
            amount:Number,
            action:Number,                 
        }]
    },
    {
        timeStamps: true,
    }
);


module.exports =  mongoose.model("Reward", rewardSchema);