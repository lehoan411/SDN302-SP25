const mongoose = require('mongoose');
//const Image = require('./Images.model');


const db = {};
//db.Images = Image;


//Ket noi CSDL
db.connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URI)
            .then(() => console.log("Connected to MongoDB"));

    } catch(err) {
        next(err)
        process.exit();
    }
    
}

module.exports = db;