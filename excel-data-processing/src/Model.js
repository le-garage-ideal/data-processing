let modelId = 1;

export class Model {
  constructor(name, manufacturer) {
    this.id = modelId++;
    this.name = name;
    this.cars = [];
    this.manufacturer = manufacturer;
  }
}
