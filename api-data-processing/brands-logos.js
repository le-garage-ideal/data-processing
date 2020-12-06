import Fuse from 'fuse.js';
import fs from 'fs';
import sharp from 'sharp';
import Axios from 'axios';
import mongoose from 'mongoose';

import connectToMongoDb from '../common-data-processing/mongodb.datasource.js';
import { updateBrands, selectBrands } from '../common-data-processing/process-collections.js';

const db = connectToMongoDb(mongoose);

async function fetchBrandLogosFromAPI() {

    try {

        const rawResponse = await Axios.get('https://private-anon-03404bbd44-carsapi1.apiary-mock.com/manufacturers');
        const response = rawResponse.data;
    
        await updateBrands({ imageUrl: null }, brand => {  
            const match = fuse.search(brand.name);
            if (match && match.length > 0) {
                brand.imageUrl = match[0].imageUrl;
            }
        });

        process.exit(0);
    
    } catch (error) {
        console.log(error);
        process.exit(1);
    }

}


async function fetchBrandLogosFromFilesystem() {
    
    console.log('fetchBrandLogosFromFilesystem');
    let i = 0;

    try {
        const files = fs.readdirSync('../../brand-logos/images');

        const fuse = new Fuse(files, { threshold: 0.1, sort: true});
    
        const brands = await selectBrands({ image: null }, brand => brand);
        for (let brand of brands) {  
            const match = fuse.search(brand.name);
            if (match && match.length > 0) {
                brand.image = await resizeToBase64('../../brand-logos/images/' + match[0].item);
                await brand.save();
                i++;
            } else {
                console.log('No file for brand ' + brand.name);
            }
        }

    } catch (error) {
        console.log(error);
        process.exit(1);
    }

    console.log(i + ' brands updated')
    process.exit(0);
}

async function resizeToBase64(filename) {
    const binaryData = await fs.promises.readFile(filename);
    const resized = await sharp(binaryData)
        .resize({ width: 100, option: {fit: 'inside'} })
        .toBuffer();
    let extension = filename.substring(filename.lastIndexOf('.') + 1);
    if (extension === 'jpg') {
        extension = 'jpeg';
    }

    return `data:image/${extension};base64,${new Buffer(resized).toString('base64')}`;
}

fetchBrandLogosFromFilesystem();

