import Axios from 'axios';
import { STRAPI_TOKEN } from '../passwords.js';

export async function callApiPromises(promises) {
  return Promise.all(promises)
    .catch((err) => {
      if (err.isAxiosError) {
        console.error(err?.response?.data?.error?.message);
      } else {
        console.error(`Error`, err.toString());
      }
    });
}

export const api = Axios.create({
  baseURL: 'http://localhost:1337/api/',
  headers: {'Authorization': `Bearer ${STRAPI_TOKEN}`}
});

export function extractExtension(base64) {
  return base64.substring(base64.indexOf("/") + 1, base64.indexOf(";base64"));
}
