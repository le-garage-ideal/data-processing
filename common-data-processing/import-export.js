import fs from 'fs';
import { selectBrands, selectModels, selectCars, Car } from './process-collections.js';
import connectToMongoDb from './mongodb.datasource.js';
import mongoose from 'mongoose';
import dataToImport from './import-data.json'; 
import cars from './export/cars.json';
const db = connectToMongoDb(mongoose);
async function exportCollections() {

    console.log('exportCollections');
    let i = 0;

    try {

        const brands = await selectBrands({}, car => car);
        const models = await selectModels({}, car => car);
        const cars = await selectCars({}, car => car);

        fs.writeFileSync('export/brands.json', JSON.stringify(brands));
        fs.writeFileSync('export/models.json', JSON.stringify(models));
        fs.writeFileSync('export/cars.json', JSON.stringify(cars));
        
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

function exportSqlFromCollections() {
    const brands = [...new Set(cars.map(car => car.model.brand.name))].map((brand, idx) => ({ name: brand, id: idx + 1 }));
    const brandsInserts = brands.map(brand => `insert into brand values (${brand.id}, '${brand.name}');`);
    fs.writeFileSync('export/brands.sql', brandsInserts.join('\n'));

    const models = [...new Set(cars.map(car => `${car.model.brand.name}#${car.model.name}`))].map((model, idx) => ({ brandName: model.split('#')[0], name: model.split('#')[1], id: idx + 1 }));
    const modelsInserts = models.map(model => `insert into model values (${model.id}, '${model.name}', ${brands.find(brand => brand.name === model.brandName).id});`);
    fs.writeFileSync('export/models.sql', modelsInserts.join('\n'));

    const carsInserts = cars
        .filter(car => !!car.power && !!car.selectedFavcarsUrl)
        .map((car, idx) => {
            const model = models.find(model => model.name === car.model.name && model.brandName === car.model.brand.name);
            return `insert into car values (${idx}, '${car.variant}', ${car.power}, ${car.weight ? car.weight : car.officialWeight}, '${car.startYear}', '${car.selectedFavcarsUrl}', ${model.id});`;
        });
    fs.writeFileSync('export/cars.sql', carsInserts.join('\n'));


    console.log('SQL exported')
    process.exit(0);
}


exportSqlFromCollections();

