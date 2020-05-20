import { Brand, Model, updateModels, selectBrands, selectModels } from '../process-collections.js';
import connectToMongoDb from '../../common-data-processing/mongodb.datasource.js';
import mongoose from 'mongoose';
import Axios from 'axios';
import cheerio from 'cheerio';
import Fuse from 'fuse.js';
const db = connectToMongoDb(mongoose);
async function refreshModelsFavcars() {

    const brands = await selectBrands({}, doc => doc);

    const models = await selectModels({}, doc => doc);

    // Récupérer les favcarsName de model
    let count = 0;
    for (let model of models) {
        const brand = brands.find(b => b.name === model.brand.name);
        const favcarsBrandName = brand.favcarsName;
        if (favcarsBrandName && !model.favcarsName) {
            console.log('-----------------------\nSearch ' + model.name);
            try {
                const res = await Axios.get(`https://www.favcars.com/${favcarsBrandName}`);
                const $ = cheerio.load(res.data);
                const names = [];
                $('.rollm a').each((_idx, element) => names.push(regexFavcars(favcarsBrandName, element.attribs.href)));
                const fuse = new Fuse(names, { threshold: 0.6, shouldSort: true, includeScore: true, useExtendedSearch: true, minMatchCharLength: 1 });
                const match = fuse.search(model.name);
                //console.log(names);
                if (match && match.length > 0) {
                    //console.log(match.map(m => `${m.item}: ${m.score}`));
                    console.log('Match: ' + match[0].item);
                    await updateModels({ _id: model._id }, m => { m.favcarsName = match[0].item; });
                    count++;
                } else {
                    await updateModels({ _id: model._id }, m => { m.favcarsName = null; })
                }
            } catch (error) {
                console.log(error);
            }
        }
    }
    console.log(`Refreshing models favcarsName: ${count} models refreshed`);

    process.exit(0);

}

function regexFavcars(favcarsBrandName, str) {
    const regexString = `https://www\.favcars\.com/${favcarsBrandName}/${favcarsBrandName}-([\\w\-]+)/#cars`;
    const regex = new RegExp(regexString, 'gm');
    let m;
    if ((m = regex.exec(str)) !== null) {
        return m[1];
    }
}

refreshModelsFavcars();

