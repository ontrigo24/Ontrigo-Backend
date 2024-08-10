const mongoose = require("mongoose");
const {DB_NAME} = require("../constants");

const connectDb = async()=>{
    try{

        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n mongodb connected DB HOST: ${connectionInstance.connection.host}`)
    
    }catch(err){
        console.log("MONGODB CONNECTION FAILED:- ", err);
        process.exit(1)
    }
}

module.exports = connectDb;