import fs from 'fs';
import { selectBrands, selectModels, selectCars, Car } from './process-collections.js';
import connectToMongoDb from './mongodb.datasource.js';
import mongoose from 'mongoose';
import dataToImport from './import-data.json'; 
const db = connectToMongoDb(mongoose);
async function exportCollections() {

    console.log('exportCollections');
    let i = 0;

    try {

        const brands = await selectBrands({}, car => car);
        const models = await selectModels({}, car => car);
        const cars = await selectCars({}, car => car);

        fs.writeFileSync('brands.json', JSON.stringify(brands));
        fs.writeFileSync('models.json', JSON.stringify(models));
        fs.writeFileSync('cars.json', JSON.stringify(cars));
        
    } catch (error) {
        console.log(error);
        process.exit(1);
    }

    console.log('Collections exported')
    process.exit(0);

}

async function importCollection() {

    console.log('importCollection');
    let created = 0;
    let updated = 0;
    try {

        for (const data of dataToImport) {
            const existing = await selectCars({
                "model.brand.name": data.model.brand.name,
                "model.name": data.model.name,
                "variant": data.variant,
                "startYear": data.startYear
            }, car => car);
            const car = existing.length > 0 ? existing[0] : new Car();
            car.model = data.model;
            car.variant = data.variant;
            car.power = data.power;
            car.officialWeight = data.officialWeight;
            car.weight = data.weight;
            car.options = data.options;
            car.startYear = data.startYear;
            car.endYear = data.endYear;
            car.selectedFavcarsUrl = data.selectedFavcarsUrl;
            car.selectedFavcarsVariant = data.selectedFavcarsVariant;
            await car.save();
            if (existing.length > 0) {
                updated++;
            } else {
                created++;
            }
        }
        
    } catch (error) {
        console.log(error);
        process.exit(1);
    }

    console.log(created + ' created, ' + updated + ' updated')
    process.exit(0);

}

exportCollections();

