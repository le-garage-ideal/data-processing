
import mongoose from 'mongoose';
import { Car, Model, Brand } from '../mongodb-schema/schema.js';
export function initMongoDb(brands) {

    //Set up default mongoose connection
    var mongoDB = 'mongodb://uepch5uqblw5mad6k1x1:BN5Ufr4twpbJqZjdshDr@bmbu7ynqra11rqi-mongodb.services.clever-cloud.com:27017/bmbu7ynqra11rqi';
    mongoose.connect(mongoDB, { useNewUrlParser: true });

    //Get the default connection
    var db = mongoose.connection;

    //Bind connection to error event (to get notification of connection errors)
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));



    brands.forEach(brand => {
        Brand.create({ name: brand.name }, (brandError, brandInstance) => {
            if (brandError) return handleError(brandError);
            // brand now exists, so lets create a models
            brand.models.forEach(model => {
                Model.create({ name: model.name, brand: brandInstance._id }, (modelError, modelInstance) => {
                    if (modelError) return handleError(modelError);
                    model.cars.forEach(car => {
                        Car.create({ variant: car.variant, model: modelInstance._id }, (carError, _carInstance) => {
                            if (carError) return handleError(carError);
                        });
                    });
                });
            });
        });
    });

}

function handleError(error) {
    console.err(error);
    return -1;
}
