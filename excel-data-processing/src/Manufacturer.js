let manufacturerId = 1;

export class Manufacturer {
  constructor(filename, models) {
    this.id = manufacturerId++;
    this.name = this.extractBrandFrom(filename);
    this.models = models;
  }
  extractBrandFrom(filename) {
    const regex = /^([a-zA-Z\s_]+)\d*\.xls/gm;
    let m = regex.exec(filename);
    if (m !== null) {
      // The result can be accessed through the `m`-variable.
      return m[1].trim();
    }
    throw Error(`Regex does not match filename ${filename}`);
  }
}
