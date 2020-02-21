import Fuse from 'fuse.js';
import fs from 'fs';
import sharp from 'sharp';
import Axios from 'axios';
import mongoose from 'mongoose';

import connectToMongoDb from '../common-data-processing/mongodb.datasource.js';
import { updateBrands } from './process-collections.js';
import logos from './brands-logos.json';

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
        const fuse = new Fuse(logos, { keys: [ 'name' ], threshold: 0.1, sort: true});
    
        await updateBrands({ image: null }, async brand => {  
            const match = fuse.search(brand.name);
            if (match && match.length > 0) {
                brand.image = await resizeToBase64('../../brand-logos/images/' + match[0].fileName);
            }
            i++;
        }, true);

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

