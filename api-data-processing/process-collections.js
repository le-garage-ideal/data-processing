import mongoose from 'mongoose';

import defineMongoDbSchema from '../common-data-processing/mongodb.schema.js';

export const {Car, Model, Brand} = defineMongoDbSchema(mongoose);

export async function updateBrands(filter, transform, async = false) {

    const brands = await Brand.find(filter).exec();
    await update(brands, transform, async);

}

export async function updateModels(filter, transform, async = false) {

    const models = await Model.find(filter).exec();
    await update(models, transform, async);

}

export async function updateCars(filter, transform, async = false) {

    const cars = await Car.find(filter).exec();
    await update(cars, transform, async);

}

async function update(collection, transform, async) {
    for (let document of collection) {
        if (async) {
            await transform(document);
        } else {
            transform(document);
        }
        await document.save();
    }
}


export async function selectBrands(filter, transform) {

    const brands = await Brand.find(filter).exec();
    return select(brands, transform);

}

export async function selectModels(filter, transform) {

    const models = await Model.find(filter).exec();
    return select(models, transform);

}

export async function selectCars(filter, transform) {

    const cars = await Car.find(filter).exec();
    return select(cars, transform);

}

async function select(collection, transform) {
    for (let document of collection) {
        transform(document);
    }
    return collection;
}

