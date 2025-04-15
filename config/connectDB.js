const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING;

const mongoose = require('mongoose');

const connectToDB = async () =>{
    try {
        await mongoose.connect(DB_CONNECTION_STRING);
    } catch (error) {
        console.error("Error connecting to the database:", error);
    }
}


module.exports = connectToDB;