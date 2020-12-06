import { updateBrands, updateModels, updateCars, selectBrands, selectModels, selectCars, Car } from '../common-data-processing/process-collections.js';
import connectToMongoDb from '../common-data-processing/mongodb.datasource.js';
import mongoose from 'mongoose';
import Axios from 'axios';
const db = connectToMongoDb(mongoose);
async function carVariantsReplaceRegex() {

    console.log('carVariantsReplaceRegex');
    let i = 0;

    try {
        const cars = await selectCars({selectedFavcarsUrl: /favcars\.com.*_l.jpg/i}, car => car);
        for (const car of cars) {
            const newUrl = `${car.selectedFavcarsUrl.substring(0, car.selectedFavcarsUrl.length-6)}.jpg`;
            try {
                //await Axios.get(newUrl);
                await updateCars({ _id: car._id }, doc => { doc.selectedFavcarsUrl = newUrl; return doc; });
            } catch (error) {
                console.log('Url not found', newUrl);
            }
            i++;
        }

    } catch (error) {
        console.log(error);
        process.exit(1);
    }

    console.log(i + ' documents updated')
    process.exit(0);

}

async function carVariantsDuplicates() {
    const cars = await selectCars({/*'model.brand.name': 'ABARTH'*/}, car => car);

    cars.sort(compareCars);

    let results = [];
    for (let i = 0; i < cars.length - 1; i++) {
        if (compareCars(cars[i + 1], cars[i]) === 0) {
            results.push(cars[i]);
            await Car.deleteOne({ _id: cars[i]._id });
            // console.log(`${cars[i].model.brand.name} ${cars[i].startYear} ${cars[i].variant} ${cars[i].options}`);
            // console.log(`${cars[i+1].model.brand.name} ${cars[i+1].startYear} ${cars[i+1].variant} ${cars[i+1].options}`);
        } else {
            // console.log('-------------------------------');
        }
    }
    console.log(results.length + ' duplicates');
    process.exit(0);
}

function compareCars(c1, c2) {
    const alphaOrElse = (element1, element2, field, orElse) => field(element1) > field(element2) ? 1 : field(element1) < field(element2) ? -1 : orElse(element1, element2);
    return alphaOrElse(c1, c2, el => el.model.brand.name,
        (d1, d2) => alphaOrElse(d1, d2, el => el.model.name,
            (e1, e2) => alphaOrElse(e1, e2, el => el.variant,
                (f1, f2) => (1 * f1.startYear) - (1 * f2.startYear))));
}

carVariantsReplaceRegex();

