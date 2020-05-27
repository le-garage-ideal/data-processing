import { updateBrands, updateModels, updateCars, selectBrands, selectModels, selectCars } from './process-collections.js';
import connectToMongoDb from '../common-data-processing/mongodb.datasource.js';
import mongoose from 'mongoose';
const db = connectToMongoDb(mongoose);
async function carVariantsFrench() {

    console.log('carVariantsFrench');
    let i = 0;

    try {

        const regex = /\d\.\dL/gi;
        const cars = await selectCars({ 'variant': regex}, car => car);
        const promises = [];
        for (const car of cars) {
            let matches;

            while ((matches = regex.exec(car.variant)) !== null) {
                console.log(car.variant);
                const newVariant = `${car.variant.substring(0, matches.index + 3)}${car.variant.substring(matches.index + 4)}`;
                //console.log(newVariant);
                await updateCars({_id: car._id}, doc => doc.variant = newVariant);
                i++;
                break;
            }
        }
    } catch (error) {
        console.log(error);
        process.exit(1);
    }

    console.log(i + ' brands updated')
    process.exit(0);

}

carVariantsFrench();

