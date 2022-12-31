import brands from '../../../brands.json' assert { type: "json" };;
import fs from "fs";
import { extractExtension } from './utils.mjs';

brandsImagesToFile();

async function brandsImagesToFile() {

  for (const brand of brands) {
    //Find extension of file
    const ext = extractExtension(brand.image);
    const fileType = brand.image.substring("data:".length,brand.image.indexOf("/"));
    //Forming regex to extract base64 data of file.
    const regex = new RegExp(`^data:${fileType}\/${ext};base64,`, 'gi');
    //Extract base64 data.
    const base64Data = brand.image.replace(regex, "");
    const fileName = `${brand.name}.${ext}`;
    const buffer = Buffer.from(base64Data, "base64");
    await fs.promises.writeFile(fileName, buffer, "base64");
  }
}

