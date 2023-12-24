import brands from '../../../brands.json' assert { type: "json" };;
import { api, promiseWithCatch, callApiPromises, extractExtension } from './utils.mjs';


migrateBrands().then(() => console.log('END'));

async function deleteBrands() {
  await promiseWithCatch
}

async function migrateBrands() {
  const brandsImagesResponses = await promiseWithCatch(api.get('upload/files'));
  const brandsImageData = brandsImagesResponses?.data;

  const brandsDataPromises = brands
    .map(brand => {
      const image = brandsImageData.find(brandImageData => {
        return brandImageData.name.substring(0, 24) === brand._id.toString();
      });
      if (!image) {
        throw new Error(`No image for brand ${brand.name}`);
      }
      return { ...brand, image };
    })
    .map(brand => api.post('brands', {
      data: {
        name: brand.name,
        image: brand.image?.id,
      }
    }));
  return callApiPromises(brandsDataPromises);
}

