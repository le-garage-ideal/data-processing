
import { groupBy, detectModels } from '../common-data-processing/model-detection.js';

export async function truncateWorkTables(client) {
    await client.query('delete from car');
    await client.query('delete from model');
    await client.query('delete from manufacturer');
}


export async function exportObjectsFromBusinessTables(client) {

    let brandQuery = {
        text: `
        select car.id as id, car.variant as variant, car.power as power, car.real_weight as real_weight, car.official_weight as official_weight, "options", start_year, end_year, model.name as model_name, model_id, brand.name as brand_name, brand_id
        from car
        inner join model on model.id = car.model_id
        inner join brand on brand.id = model.brand_id
        left outer join weightcars_import w on w.variant = car.variant and w.brand = brand.name;
        `
    };

    let resultSet = await client.query(brandQuery);

    const groupByBrand = resultSet.rows.reduce((cumul, row) => groupBy(cumul, row, r => `m-${r.brand_id}`), {});
    const brands = [];

    const mapCar = row => ({
        variant: row.variant,
        power: row.power,
        officialWeight: row.official_weight,
        weight: row.real_weight,
        options: row.options,
        startYear: row.start_year,
        endYear: row.end_year,
    });

    for (let brand_id in groupByBrand) {
        
        const brandRows = groupByBrand[brand_id];
        const brand = { name: brandRows[0].brand_name, models: [], cars: [] };
        brands.push(brand);

        const modelRows = brandRows.reduce((cumul, row) => groupBy(cumul, row, r => `m-${r.model_id}`), {});

        brand.cars = brandRows.map(mapCar);
        for (let model_id in modelRows) {
            const carRows = modelRows[model_id];
            try {
                const model = { name: carRows[0].model_name, cars: carRows.map(mapCar)};
                brand.models.push(model);
            } catch (error) {
                console.log(carRows);
            }
        }
    }
    return brands;
}

export async function automaticModelDetection(client) {

    let weightcarsImportQuery = {
        text: `
        SELECT brand, leboncoin_brand, variant, real_weight, given_weight, power, gearbox, start_year, end_year, misc
        FROM weightcars_import
        `
    };

    let resultSet = await client.query(weightcarsImportQuery);

    // group by brand
    const weightcarsImportData = resultSet.rows.reduce((cumul, row) => groupBy(cumul, row, r => r.brand), {});

    // detect models of 1 ... n words
    for (let brand in weightcarsImportData) {
        const nWordsModel = detectModels(weightcarsImportData[brand]);
        await updateModels(client, brand, nWordsModel, 1);
        await updateModels(client, brand, nWordsModel, 2);
    }

    return weightcarsImportData;
}

export async function updateModels(client, brand, nWordsModel, number) {
    const queries = Object.entries(nWordsModel[number-1])
        .flatMap(([modelName, variants]) => 
            variants
                .map(variant => ({ 
                    text: `update weightcars_import set model${number}=$2 where brand=$1 and variant=$3`,
                    values: [variant]
                }))
                .map(query => ({...query, values: [modelName, ...query.values]}))
        );
    for (let query of queries) {
        query.values = [brand, ...query.values];
        const result = await client.query(query);
        if (result.rowCount < 1) {
            console.log('erreur requete : updated lines should be >=1 instead of ' + result.rowCount, query);
        }
    }
}

export async function fromImportToBusinessTable() {
    const reqBrand = `insert into brand (brand_name) 
                        select distinct brand from weightcars_import`;
    const reqModel = `insert into model (name, brand_id)
                        select distinct w.model1, b.id from weightcars_import w inner join brand b on b.name = w.brand`;
    const reqCar   = `insert into car (variant, power, real_weight, official_weight, "options", start_date, model_id)
                        select w.variant, w.power, w.real_weight, w.given_weight, w.misc, to_date(concat(w.start_year, '0101'),'YYYYMMDD'), m.id from weightcars_import w inner join brand b on b.name = w.brand inner join model m on m.name = w.model1 and m.brand_id = b.id`;
}

