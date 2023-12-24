import models from '../../../models.json' assert { type: "json" };;
import { api, callApiPromises, promiseWithCatch } from './utils.mjs';

migrateModels();

async function migrateModels() {
  const brandsResponse = await promiseWithCatch(api.get('api/brands', {
    params: { 'pagination[limit]': 100000 },
  }));
  console.log("number of models", models.length);
  const brands = brandsResponse?.data?.data;
  const modelsWithBrandId = models
    .map(model => {
      const brand = brands.find(brand => {
        return brand.attributes.name === model.brand.name;
      });
      return { ...model, brand };
    });
  const modelsWithoutBrand = modelsWithBrandId.filter(model => !model.brand);
  if (modelsWithoutBrand.length > 0) {
    throw new Error(`No brand for models ${modelsWithoutBrand.map(m => m.name)}`);
  }
  const modelsDataPromises = modelsWithBrandId.map(model => {
    return api.post('api/models', {
      data: {
        name: model.name,
        brand: model.brand?.id,
      }
    });
  });
  return callApiPromises(modelsDataPromises);
}



