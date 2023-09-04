import cars from '../../../cars.json' assert { type: "json" };
import { api, callApiPromises, promiseWithCatch } from './utils.mjs';

migrateCars();

async function migrateCars() {
  const modelsResponse = await promiseWithCatch(api.get('models', {
    params: { 'pagination[limit]': 100000, populate: '*' },
  }));
  const models = modelsResponse?.data?.data;
  const carsWithModelId = cars
    .map(car => {
      const model = models
        .find(model => model.attributes.name === car.model.name
          && model.attributes.brand.data.attributes.name === car.model.brand.name);
      return {
        ...car,
        model,
      };
    });
  const carsWithoutModel = carsWithModelId.filter(car => !car.model);
  if (carsWithoutModel.length > 0) {
    throw new Error(`No model for cars ${carsWithoutModel.map(m => m.name)}`);
  }

  const carsImagesResponses = await promiseWithCatch(api.get('upload/files'));
  const carsImageData = carsImagesResponses?.data;

  const carsDataPromises = [];
  let carsWithoutImages = 0;
  for (const car of carsWithModelId) {
    const imageFileName = `${car._id['$oid']}-resized.jpg`;
    const imageFileData = carsImageData.find(carImageData => carImageData.name === imageFileName);
    if (!imageFileData?.id) {
      console.log(`No image for car ${car._id['$oid']}`, car, imageFileData);
      if (carsWithoutImages > 20) {
        throw new Error('Too much cars without images, something is wrong');
      }
      carsWithoutImages++;
    }
    carsDataPromises.push(api.post('cars', {
      data: {
        variant: car.variant,
        weight: car.weight,
        officialWeight: car.officialWeight,
        power: car.power,
        options: car.options,
        startYear: car.startYear,
        endYear: car.endYear,
        imageFile: imageFileData?.id,
        imageUrl: imageFileData?.url,
        selectedFavcarsUrl: car.selectedFavcarsUrl,
        selectedFavcarsVariant: car.selectedFavcarsVariant,
        model: car.model?.id,
      }
    }));
  }
  return callApiPromises(carsDataPromises);
}



