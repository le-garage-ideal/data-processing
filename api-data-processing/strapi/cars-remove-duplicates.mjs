import { api, callApiPromises, promiseWithCatch } from './utils.mjs';

deleteCarsDuplicates();

async function deleteCarsDuplicates() {
  const carsResponse = await promiseWithCatch(api.get('cars', {
    params: { 'pagination[limit]': 100000, populate: 'deep' },
  }));
  const cars = carsResponse?.data?.data;
  const carsMap = cars
    .reduce((map, car) => {
      const model = car.attributes.model.data.attributes;
      const brand = model.brand.data.attributes;
      const key = `${brand.name}§${model.name}§${car.attributes.variant}§${car.attributes.startYear}`;
      const existingEntry = map.get(key);
      if (existingEntry) {
        const updatedEntry = [...existingEntry, car];
        map.set(key, updatedEntry);
      } else {
        map.set(key, [car]);
      }
      return map;
    }, new Map());
  const carsDuplicates = [];
  for (const entry of carsMap) {
    const cars = entry[1];
    if (cars.length > 1) {
      const carToKeep = cars.findIndex(car => car.attributes.imageFile?.data?.id) ?? 0;
      if (carToKeep > 0) {
        carsDuplicates.push(...cars.slice(0, carToKeep));
      }
      if (carToKeep < cars.length - 1) {
        carsDuplicates.push(...cars.slice(carToKeep + 1));
      }
    }
  }

  const carsDataPromises = carsDuplicates.map((car) => api.delete(`cars/${car.id}`));

  for (const carsDataPromise of carsDataPromises) {
    await carsDataPromise;
  }
  console.log(`Deleted ${carsDuplicates.length} cars`);
}



