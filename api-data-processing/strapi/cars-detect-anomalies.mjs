import { api, callApiPromises, promiseWithCatch } from './utils.mjs';

detectCarAnomalies();

async function detectCarAnomalies() {
  const carsResponse = await promiseWithCatch(api.get('api/cars', {
    params: { 'pagination[limit]': 100000, populate: 'deep' },
  }));
  const cars = carsResponse?.data?.data;

  const carsWithoutImage = cars.filter(car => !car.attributes.imageFile?.data?.id).map(label);
  console.log('🚀 ~ detectCarAnomalies ~ carsWithoutImage:');
  carsWithoutImage.forEach((car) => console.log(car));

  const longCarVariants = cars.filter(car => car.attributes.variant.length > 30).map(label);
  console.log('🚀 ~ detectCarAnomalies ~ carsWithoutImage:');
  longCarVariants.forEach((car) => console.log(car));
}

const label = car => `${car.attributes.model.data.attributes.brand.data.attributes.name} ${car.attributes.variant} ${car.attributes.startYear}`;

