const mongoose = require("mongoose");

const connectDb = async()=>{
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
        console.log(`\n mongodb connected DB HOST: ${connectionInstance.connection.host}`)
    
    }catch(err){
        console.log("MONGODB CONNECTION FAILED:- ", err);
    }
}

module.exports = connectDb;