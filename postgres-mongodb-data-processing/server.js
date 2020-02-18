import pg from 'pg';
import { initMongoDb } from './mongodb.js';
import { exportObjectsFromBusinessTables } from './postgres.js';


async function main() {
    const theClient = new pg.Client({
        user: 'weightcars',
        password: 'weightcars',
        host: 'localhost',
        port: 5432,
        database: 'weightcars',
    });

    await theClient.connect();

    await theClient.query(`SET search_path TO 'weightcars'`);


    // const modelResult = await automaticModelDetection(theClient);

    // await addModelDetectionToCloud(db, modelResult);
    const brands = await exportObjectsFromBusinessTables(theClient);

    await initMongoDb(brands);

    console.log('done');

}


main();


