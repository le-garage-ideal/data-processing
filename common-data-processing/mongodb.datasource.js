import mongoose from 'mongoose';
import { mongodbPasswords } from './passwords.js';

export default async function connectToMongoDb() {

    //Set up default mongoose connection
    var mongoDB = `mongodb://uepch5uqblw5mad6k1x1:${mongodbPasswords}@bmbu7ynqra11rqi-mongodb.services.clever-cloud.com:27017/bmbu7ynqra11rqi`;
    mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

    //Get the default connection
    var db = mongoose.connection;

    //Bind connection to error event (to get notification of connection errors)
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));

    return db;

}