const dotenv =  require("dotenv");
const connectDB = require("./config/mongo.config.js");
const app =  require("./app.js");

dotenv.config({
    path: "./.env"
});

const PORT = process.env.PORT || 8000;

connectDB()
.then(() => {

    app.listen(PORT, () => {
        console.log(`server running at port ${PORT}`);
    });

    app.on("error", (err) => {
        console.log("ERROR from express", err);
        throw err;
    });
})
.catch((err) => {
        console.log("MONGO db connection async Error ", err);
});