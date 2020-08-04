import { updateBrands, updateModels, updateCars, selectBrands, selectModels, selectCars, Car } from './process-collections.js';
import connectToMongoDb from '../common-data-processing/mongodb.datasource.js';
import mongoose from 'mongoose';
const db = connectToMongoDb(mongoose);
async function carsWithoutModel() {

    console.log('carsWithoutModel');
    let i = 0;

    try {
        console.log('------------------')
        const transformModel = model => `${model.brand.name}#${model.name}`;
        const models = await selectModels({}, model => model);
        const modelNames = models.map(model => transformModel(model));
        const cars = await selectCars({}, car => car);
        for (const car of cars) {
            const modelName = transformModel(car.model);
            if (modelNames.findIndex(m => m === modelName) < 0) {
                console.log('model not found', `${modelName}#${car.variant}`);
            }
        }
        console.log('------------------')

    } catch (error) {
        console.error(error);
    }

    process.exit(0);
}

async function modelsWithoutCars() {

    console.log('modelsWithoutCars');
    let i = 0;

    try {
        console.log('------------------')
        const transformModel = model => `${model.brand.name}#${model.name}`;
        const models = await selectModels({}, model => model);
        const cars = await selectCars({}, car => car);
        const carModelNames = cars.map(car => transformModel(car.model));
        for (const model of models) {
            const modelName = transformModel(model);
            if (carModelNames.findIndex(m => m === modelName) < 0) {
                console.log('car not found for model', modelName);
            }
        }
        console.log('------------------')

    } catch (error) {
        console.error(error);
    }

    process.exit(0);
}


modelsWithoutCars();
