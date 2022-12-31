import brands from '../../../brands.json' assert { type: "json" };;
import { api, callApiPromises, extractExtension } from './utils.mjs';


migrateBrands();

async function migrateBrands() {
  const brandsImagesResponses = await api.get('upload/files');
  const brandsImageData = brandsImagesResponses?.data;

  const brandsDataPromises = brands
    .map(brand => ({
      ...brand,
      image: brandsImageData.find(brandImageData => brandImageData.name === `${brand.name}.${extractExtension(brand.image)}`)
    }))
    .map(brand => api.post('brands', {
      data: {
        name: brand.name,
        image: brand.image.id,
      }
    }));
  return callApiPromises(brandsDataPromises);
}

