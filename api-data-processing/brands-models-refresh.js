import { Brand, Model, Car, updateBrands, updateModels, updateCars, selectBrands, selectModels, selectCars } from './process-collections.js';
import connectToMongoDb from '../common-data-processing/mongodb.datasource.js';
import mongoose from 'mongoose';
const db = connectToMongoDb(mongoose);
async function brandsModelsRefresh() {

    console.log('brandsModelsRefresh');
    let i = 0;
    let j = 0;

    try {
        const existingModelNames = await selectModels({}, model => `${model.brand.name}#${model.name}`);

        const existingBrandNames = selectBrands({}, brand => brand.name);

        const newModelNames = [];
        const newBrandNames = [];
        await selectCars({}, car => {
            const brandModel = `${car.model.brand.name}#${car.model.name}`;
            if (!existingModelNames.includes(brandModel) && !newModelNames.includes(brandModel)) {
                newModelNames.push(brandModel);
            }
            if (!existingBrandNames.includes(car.model.brand.name) && !newBrandNames.includes(car.model.brand.name)) {
                newBrandNames.push(car.model.brand.name);
            }
        });


        for (let brandName of newBrandNames) {
            const newBrand = { name: brandName };
            console.log('New brand', newBrand);
            await Brand.create(newBrand);
            i++;
        }

        for (let brandModel of newModelNames) {
            const [brandName, modelName] = brandModel.split('#');
            const newModel = { name: modelName, brand: {name: brandName }};
            console.log('New model', newModel);
            await Model.create(newModel);
            j++;
        }

    } catch (error) {
        console.log(error);
        process.exit(1);
    }

    console.log(i + ' brands created, ' + j + ' models created')
    process.exit(0);

}

brandsModelsRefresh();

