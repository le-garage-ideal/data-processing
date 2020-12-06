import { Brand, Model, Car, updateBrands, updateModels, updateCars, selectBrands, selectModels, selectCars } from '../../common-data-processing/process-collections.js';
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

        const cars = await selectCars({'model.name': 'ka'}, doc => doc);

        let count = 0;
        let matchCount = 0;
        let found = true;
        for (let car of cars) {
            if (!found || car.selectedFavcarsUrl /*|| (!!car.favcarsVariants && car.favcarsVariants.length === 0)*/) {
                if (car.variant === 'Huayra Roadster') {
                    found = true
                } else {
                    console.log(`Ignoring because !found: ${!found}, car.selectedFavcarsUrl ${!!car.selectedFavcarsUrl}, car.favcarsVariants && car.favcarsVariants.length ${!!car.favcarsVariants} ${car.favcarsVariants.length === 0})` )
                    continue;
                }
            }
            count++;

            const search = `${car.model.brand.name} ${car.variant}`;
            console.log(`-----------------------\nSearch ${search} (${Math.round(count*100/cars.length)}%)`);
            const brand = brands.find(b => b.name === car.model.brand.name);
            const favcarsBrandName = brand.favcarsName;
            const model = models.find(m => m.name === car.model.name);
            const favcarsModelName = model.favcarsName;

            if (favcarsBrandName && favcarsModelName) {
                const yearBefore = 1 * car.startYear - 1;
                const yearAfter  = 1 * car.startYear + 1;
                let namesAndImagesYearBefore = await scrapPage(`https://www.favcars.com/${favcarsBrandName}/${favcarsModelName}/${yearBefore}year/#p`);
                let namesAndImages = await scrapPage(`https://www.favcars.com/${favcarsBrandName}/${favcarsModelName}/${car.startYear}year/#p`);
                let namesAndImagesYearAfter = await scrapPage(`https://www.favcars.com/${favcarsBrandName}/${favcarsModelName}/${yearAfter}year/#p`);
                namesAndImages = [...namesAndImages, ...namesAndImagesYearAfter, ...namesAndImagesYearBefore];
                if (namesAndImages.length === 0) {
                    // Search without year
                    namesAndImages = await scrapPage(`https://www.favcars.com/${favcarsBrandName}/${favcarsModelName}`);
                }
                const fuse = new Fuse(namesAndImages, {
                    shouldSort: true,
                    includeScore: true,
                    useExtendedSearch: false, 
                    minMatchCharLength: 2,
                    //threshold: 1,
                    keys: ['name'],
                });
                let matches = fuse.search(search);
                if (matches && matches.length > 0) {
                    matchCount++;
                    if (matches.length > 5) {
                        matches.splice(4);
                    }
                    // console.log('best matches : ', matches)
                    const favcarsVariants = [];
                    for (let match of matches) {
                        const urls = await searchDataFromPage(namesAndImages[match.refIndex].pageWithImages, 
                            'a.thumbnailb.screenshot,.thumbnailimages>img', 
                            el => el.attribs.rel ? el.attribs.rel : el.attribs.src);
                        favcarsVariants.push({ name: match.item.name, urls });
                    }
                    // console.log(favcarsVariants);
                    await updateCars({ _id: car._id }, m => { m.favcarsVariants = favcarsVariants; });
                } else {
                    console.log('no match');
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

async function scrapPage(url) {
    const res = await Axios.get(url);
    const $ = cheerio.load(res.data);
    const pageUrls = [];
    $('.pagination-centered a').each((_idx, element) => {
        if (element.attribs.href) {
            pageUrls.push(element.attribs.href);
        }
    });
    let namesAndImages = [];
    const pattern =  '.cat_img h2 a';
    const extraction = element => ({ 
        name: element.children.filter(e => e.type === 'text')[0].data.trim(),
        pageWithImages: element.attribs.href
    });
    if (pageUrls.length === 0) {
        namesAndImages = searchDataFromHtml(res.data, pattern, extraction);
    } else {
        pageUrls.splice(5);
        for (let pageUrl of pageUrls) {
            const newNamesAndImages = await searchDataFromPage(pageUrl, pattern, extraction);
            namesAndImages = [...namesAndImages, ...newNamesAndImages];
        }
    }
    return namesAndImages;
}

async function searchDataFromPage(url, pattern, extraction) {
    const res = await Axios.get(url);
    return searchDataFromHtml(res.data, pattern, extraction);
}
function searchDataFromHtml(data, pattern, extraction) {
    const result = [];
    const $ = cheerio.load(data);
    $(pattern).each((_idx, element) => result.push(extraction(element)));
    return result;
}



refreshVariantsFavcars();

