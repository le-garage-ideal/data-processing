import { Brand, Model, Car, updateBrands, updateModels, updateCars, selectBrands, selectModels, selectCars } from '../process-collections.js';
import connectToMongoDb from '../../common-data-processing/mongodb.datasource.js';
import mongoose from 'mongoose';
import Axios from 'axios';
import cheerio from 'cheerio';
import Fuse from 'fuse.js';
const db = connectToMongoDb(mongoose);
async function refreshVariantsFavcars() {

    console.log('refreshVariantsFavcars');
    let i = 0;

    try {

        const brands = await selectBrands({}, doc => doc);

        const models = await selectModels({}, doc => doc);

        const cars = await selectCars({}, doc => doc);

        let count = 0;
        let matchCount = 0;
        for (let car of cars) {
            count++;
            const search = car.variant.replace(/\s/g, '|');
            console.log(`-----------------------\nSearch ${search} (${Math.round(count*100/cars.length)}%)`);
            const brand = brands.find(b => b.name === car.model.brand.name);
            const favcarsBrandName = brand.favcarsName;
            const model = models.find(m => m.name === car.model.name);
            const favcarsModelName = model.favcarsName;
            if (favcarsBrandName && favcarsModelName) {
                const url = `https://www.favcars.com/${favcarsBrandName}/${favcarsModelName}/${car.startYear}year/#p`;
                console.log(`Page ${url}`);
                try {
                    const res = await Axios.get(url);
                    const $ = cheerio.load(res.data);
                    const pageUrls = [];
                    $('.pagination-centered a').each((_idx, element) => {
                        if (element.attribs.href) {
                            pageUrls.push(element.attribs.href);
                        }
                    });
                    pageUrls.splice(5);
                    let namesAndImages = [];
                    const pattern =  '.cat_img h2 a';
                    const extraction = element => element.children.filter(e => e.type === 'text')[0].data.trim();
                    if (pageUrls.length === 0) {
                        namesAndImages = searchDataFromHtml(res.data, pattern, extraction);
                    } else {
                        for (let pageUrl of pageUrls) {
                            const newNamesAndImages = await searchDataFromPage(pageUrl, pattern, extraction);
                            namesAndImages = [...namesAndImages, ...newNamesAndImages];
                        }
                    }
                    const fuse = new Fuse(namesAndImages, {
                        shouldSort: true,
                        includeScore: true,
                        useExtendedSearch: true, 
                        minMatchCharLength: 2,
                        keys: ['name'],
                    });
                    let matches = fuse.search(search);
                    if (matches && matches.length > 0) {
                        //console.log('best match : ', matches)
                        matchCount++;
                        if (matches.length > 3) {
                            matches = matches.slice(matches.length - 3);
                        }
                        const favcarsVariants = matches.map(match => {
                            const urls = [];
                            namesAndImages[match.refIndex].selector('a.thumbnailb').each((_idx, element) => urls.push(element.attribs.rel));
                            return { name: match.item.name, urls };
                        });
                        //console.log(favcarsVariants);
                        await updateCars({ _id: car._id }, m => { m.favcarsVariants = favcarsVariants; });
                    } else {
                        console.log('no match');
                    }
                } catch (error) {
                    console.log(error);
                }
            } else {
                console.log('no brand / model');
            }
        }
        console.log(`Updating models favcarsName: ${Math.round(matchCount*100/models.length)}% match`);


    } catch (error) {
        console.log(error);
        process.exit(1);
    }

    process.exit(0);

}

async function searchDataFromPage(url, pattern, extraction) {
    const res = await Axios.get(url);
    return searchDataFromHtml(res.data, pattern, extraction);
}
function searchDataFromHtml(data, pattern, extraction) {
    const result = [];
    const $ = cheerio.load(data);
    $(pattern).each((_idx, element) => result.push({ name: extraction(element), selector: $ }));
    return result;
}



refreshVariantsFavcars();

