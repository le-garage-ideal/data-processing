import fs from 'fs';
import { api, downloadImage, promiseWithCatch } from './utils.mjs';

backupStrapi();

async function backupStrapi() {
  const carsResponse = await promiseWithCatch(api.get('api/cars', {
    params: { 'pagination[limit]': 100000, populate: 'deep' },
  }));
  const cars = carsResponse?.data?.data.map((carData) => {
    const brand = {
      ...carData.attributes.model.data.attributes.brand.data.attributes,
      id: carData.attributes.model.data.attributes.brand.data.id,
    };
    const model = {
      ...carData.attributes.model.data.attributes,
      id: carData.attributes.model.data.id,
      brand
    };
    return {
      ...carData.attributes,
      id: carData.id,
      model 
    };
  });

  for (const car of cars) {
    if (car.imageFile?.data?.attributes?.url) {
      await downloadImage('../backup/', car.id, car.imageFile.data.attributes.url, api);
    }
  }

  fs.writeFileSync('../backup/cars.json', JSON.stringify(cars));

  console.log(`Backup ${cars.length} cars`);
}



