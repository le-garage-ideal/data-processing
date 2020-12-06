import { updateBrands, updateModels, updateCars, selectBrands, selectModels, selectCars } from '../common-data-processing/process-collections.js';
import connectToMongoDb from '../common-data-processing/mongodb.datasource.js';
import mongoose from 'mongoose';
const db = connectToMongoDb(mongoose);
async function brandsNamesTrim() {

    console.log('brandsNamesTrim');
    let i = 0;

    try {
        
        await updateBrands({ name: /\s+$/ }, brand => {  
            brand.name = brand.name.trim();
            i++;
        });

        await updateModels({ 'brand.name': /\s+$/ }, model => {
            model.brand.name = model.brand.name.trim();
            i++;
        });

        await updateCars({ 'model.brand.name': /\s+$/ }, car => {
            car.model.brand.name = car.model.brand.name.trim();
            i++;
        });
    
    } catch (error) {
        console.log(error);
        process.exit(1);
    }

    console.log(i + ' brands updated')
    process.exit(0);

}

async function brandsDisplay() {
    console.log("brandsDisplay");
    try {
        await selectModels({ 'brand.name': /\s+$/ }, document => {  
            console.log(document.brand.name);
        });

        process.exit(0);
    
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

brandsNamesTrim();

