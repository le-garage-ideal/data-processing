import Axios from 'axios';
import fs from 'fs';
import path from 'path';
import { STRAPI_URL, STRAPI_TOKEN } from '../passwords.js';

export async function promiseWithCatch(promise) {
  return promise
    .catch((err) => {
      if (err.isAxiosError) {
        if (err?.response) {
          console.error(err?.response?.data?.error?.message ?? err.message);
        } else {
          if (err.errors) {
            err.errors?.forEach(e => console.error(e.message));
          } else {
            console.error(err.message);
          }
        }
      } else {
        console.error(`Error`, err.toString());
      }
    });
}

export async function callApiPromises(promises) {
  // Chuncks of 100 promises
  for (let i = 0; i < promises.length; i += 5) {
    const promisesChunk = promises.slice(i, 5 + 1);
    await promiseWithCatch(Promise.all(promisesChunk));
    console.log(`Chunk ${i} done`);
  }
}

export const api = Axios.create({
  baseURL: STRAPI_URL,
  headers: {'Authorization': `Bearer ${STRAPI_TOKEN}`},
  proxy: false,
});

export function extractExtension(base64) {
  return base64.substring(base64.indexOf("/") + 1, base64.indexOf(";base64"));
}

export async function downloadImage(imgDir, carId, url, axiosInstance) {
  const imgPath = path.resolve(imgDir, `${carId}.jpg`);
  const writer = fs.createWriteStream(imgPath);

  const response = await promiseWithCatch(axiosInstance.get(url, { responseType: 'stream' }));
  if (!response) {
    throw new Error('See previous API error');
  }
  return new Promise((resolve, reject) => {
    response.data.pipe(writer);
    writer.on('finish', resolve)
    writer.on('error', reject)
  });
}
