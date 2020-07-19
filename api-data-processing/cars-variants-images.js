import { updateBrands, updateModels, updateCars, selectBrands, selectModels, selectCars, Car } from './process-collections.js';
import connectToMongoDb from '../common-data-processing/mongodb.datasource.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import sharp from 'sharp';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { exit } from 'process';


const __dirname = dirname(fileURLToPath(import.meta.url));
const imgDir = '/Users/benth/Documents/dev/perso/le-garage-ideal/le-garage-ideal-website/gatsby-site/static/images';
const indexPath = path.resolve(imgDir, `index.txt`);
const getImgPath = id => path.resolve(imgDir, `${id}.jpg`);
const db = connectToMongoDb(mongoose);

async function carVariantsExtractImages() {

    console.log('carVariantsExtractImages');
    let i = 0;
    let errorNb = 0;

    fs.writeFileSync(indexPath, '');
    // await updateCars({}, c => c.imageFile = null);

    const cars = await selectCars({}, car => car);
    for (const car of cars) {
        
        if (!car.imageFile) {
            try {
                await downloadImage(car, car.selectedFavcarsUrl);
                await updateCars({_id: car._id}, c => c.imageFile = `${car._id}.jpg`);
                fs.appendFileSync(indexPath, `${car.model.brand.name}\t${car.model.name}\t${car.variant}\t${car.startYear}\t${car._id}.jpg\n`);
                i++;
                const progress = Math.round(i*100/cars.length);
                process.stdout.clearLine();
                process.stdout.cursorTo(0);
                process.stdout.write(progress + '%');
            } catch (error) {
                console.log(error);
                errorNb++;
            }
        }
    }

    console.log(i + ' images extracted with ' + errorNb + ' error(s)')
    process.exit(0);

}

async function downloadImage(car, url) {  
    const imgPath = getImgPath(car._id);
    const writer = fs.createWriteStream(imgPath);
  
    return new Promise((resolve, reject) => {
        axios({
            url,
            method: 'GET',
            responseType: 'stream'
        }).then(response => {
            response.data.pipe(writer);
            writer.on('finish', resolve)
            writer.on('error', reject)
        });
    });
}

async function resizeImages() {
    const files = fs.readdirSync(imgDir);
    for (const file of files) {
        if (file.endsWith('.jpg')) {
            const image = sharp(`${imgDir}/${file}`);
            const metadata = await image.metadata();
            const ratio = metadata.width / metadata.height;
            if (ratio < 1.2 || ratio > 2 || metadata.width < 500 || metadata.height < 300) {
                console.log(ratio);
                console.log(`http://localhost:8000/garage?car1=${file.substring(0,file.length-4)}`);
            }
        }
    }
    process.exit(0);
}

resizeImages();
