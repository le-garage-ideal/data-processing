import { Brand, Model, updateBrands, selectBrands } from '../process-collections.js';
import connectToMongoDb from '../../common-data-processing/mongodb.datasource.js';
import mongoose from 'mongoose';
import Axios from 'axios';
import cheerio from 'cheerio';
import Fuse from 'fuse.js';
const db = connectToMongoDb(mongoose);
async function refreshBrandsFavcars() {

// const notFounds = ['ARTEGA', 'ARIEL', 'HOMMELL', 'KTM', 'WESTFIELD', 'ZENOS', 'GUMPERT', 'ZENVO', 'ASCARI', 'FALCON', 'ARRINERA', 'RIMAC'];
// for (let notFound of notFounds) {
//     await updateBrands({name: notFound}, e => e.favcarsName = null);
// } 
    console.log('refreshBrandsFavcars');
    let newBrandsCount = 0;
    let matchingBrandsCount = 0;

    try {

        const brands = await selectBrands({}, doc => doc);

        // Mettre à jour les brands avec favcarsName
        for (let brand of brands) {
            if (!brand.favcarsName) {
                console.log('Refreshing '+brand.name)
                if (await searchIfPageExist(brand.name, 'https://www.favcars.com/')) {
                    await updateBrands({ _id: brand._id }, b => { b.favcarsName = brand.name; });
                    matchingBrandsCount++;
                }
                newBrandsCount++;
            }
        }


    } catch (error) {
        console.log(error);
        process.exit(1);
    }

    console.log(matchingBrandsCount + ' on ' + newBrandsCount + ' brands refreshed')

    process.exit(0);

}

async function searchIfPageExist(element, baseUrl) {
    const exist = false;

    const url = `${baseUrl}${element.toLowerCase()}`;
    try {
        const res = await Axios.get(url)
        exist = true;
    } catch (_error) {
    }
    return exist;

}

refreshBrandsFavcars();
