
import mongoose from 'mongoose';
import connectToMongoDb from '../common-data-processing/mongodb.datasource.js';
import defineMongoDbSchema from '../common-data-processing/mongodb.schema.js';
export async function initMongoDb(brands) {

    const db = connectToMongoDb(mongoose);

    const {Car, Model, Brand} = defineMongoDbSchema(mongoose);

    try {
        await Model.remove({});
        await Brand.remove({});
        await Car.remove({});

        await createWithAggregation(brands);
    } catch (error) {
        handleError(error);
    }

}

async function createWithAggregation(brands) {
    let i = 0;
    brands.forEach(brand => {
        const brandDocument = { name: brand.name };
        Brand.create(brandDocument, (brandError, brandInstance) => {
            if (brandError) return handleError(brandError);
            // brand now exists, so lets create a models
            brand.models.forEach(model => {
                const modelDocument = { name: model.name, brand: brandDocument };
                Model.create(modelDocument, (modelError, modelInstance) => {
                    if (modelError) return handleError(modelError);
                    model.cars.forEach(car => {
                        const carDocument = {
                            ...car,
                            model: modelDocument,
                        };
                        if (i < 4) {
                            console.log(carDocument);
                        }
                        Car.create(carDocument);
                        i++;
                    });
                });
            });
        });
    });
}

function createWithRelations() {
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
    console.log(error);
    process.exit(1);
}
