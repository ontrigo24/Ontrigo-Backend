const mongoose = require("mongoose");


const iternary = new mongoose.Schema(
    {
        rating:{
            type:Number,
            required:true,
            max:5,
        },
        review:{
            type:String,
            required:true,
        }
    },
    {
       timestamps:true 
    }
)