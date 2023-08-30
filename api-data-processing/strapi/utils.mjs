import Axios from 'axios';
import { STRAPI_TOKEN } from '../passwords.js';

export async function promiseWithCatch(promise) {
  return promise
    .catch((err) => {
      if (err.isAxiosError) {
        console.error(err?.response?.data?.error?.message ?? err.message);
      } else {
        console.error(`Error`, err.toString());
      }
    });
}

export async function callApiPromises(promises) {
  return promiseWithCatch(Promise.all(promises));
}

export const api = Axios.create({
  baseURL: 'http://127.0.0.1:1337/api',
  headers: {'Authorization': `Bearer ${STRAPI_TOKEN}`},
  proxy: false,
});

export function extractExtension(base64) {
  return base64.substring(base64.indexOf("/") + 1, base64.indexOf(";base64"));
}
