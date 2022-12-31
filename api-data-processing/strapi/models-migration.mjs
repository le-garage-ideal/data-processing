import models from '../../../models.json' assert { type: "json" };;
import { api, callApiPromises } from './utils.mjs';

migrateModels();

async function migrateModels() {
  const brandsResponse = await api.get('brands', {
    params: { 'pagination[limit]': 100000 },
  });
  const brands = brandsResponse?.data?.data;
  const modelsWithBrandId = models
    .map(model => {
      const brand = brands.find(brand => brand.attributes.name === model.brand.name);
      return {
        ...model,
        brand,
      };
    });
  const modelsWithoutBrand = modelsWithBrandId.filter(model => !model.brand);
  if (modelsWithoutBrand.length > 0) {
    throw new Error(`No brand for models ${modelsWithoutBrand.map(m => m.name)}`);
  }
  const modelsDataPromises = modelsWithBrandId.map(model => {
    return api.post('models', {
      data: {
        name: model.name,
        brand: model.brand?.id,
      }
    });
  });
  return callApiPromises(modelsDataPromises);
}



