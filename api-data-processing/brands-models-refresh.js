import { Brand, Model, Car, updateBrands, updateModels, updateCars, selectBrands, selectModels, selectCars } from './process-collections.js';
import connectToMongoDb from '../common-data-processing/mongodb.datasource.js';
import mongoose from 'mongoose';
const db = connectToMongoDb(mongoose);
async function brandsModelsRefresh() {

    console.log('brandsModelsRefresh');
    let i = 0;

    try {
        const existingModelNames = [];
        await selectModels({}, model => {
            const brandModel = `${car.model.brand.name}#${car.model.name}`;
            existingModelNames.push(brandModel);
        });

        const existingBrandNames = [];
        await selectBrands({}, brand => {
            existingBrandNames.push(brand.name);
        });

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
        }

        for (let brandModel of newModelNames) {
            const [brandName, modelName] = brandModel.split('#');
            const newModel = { name: modelName, brand: {name: brandName }};
            console.log('New model', newModel);
            await Model.create(newModel);
        }

    } catch (error) {
        console.log(error);
        process.exit(1);
    }

    console.log(i + ' brands updated')
    process.exit(0);

}

brandsModelsRefresh();

