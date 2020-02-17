let carId = 1;

export class Car {
  constructor(row) {
    this.id = carId++;
    const powerSearch = /(\d+)\s*c[hv]{1}/i.exec(row[1]);
    this.power = powerSearch ? powerSearch[1] : 0;
    const startDateSearch = /[\s(]{1}(20\d\d|19\d\d)/i.exec(row[1]);
    this.startDate = startDateSearch ? `${startDateSearch[1]}-01-01` : '0001-01-01';
    let variantIndex;
    if (powerSearch && startDateSearch) {
      variantIndex = powerSearch['index'] < startDateSearch['index'] ? powerSearch['index'] : startDateSearch['index'];
    }
    else {
      variantIndex = powerSearch ? powerSearch['index'] : startDateSearch ? startDateSearch['index'] : row[1].length;
    }
    this.variant = row[1].substring(0, variantIndex - 1).trim();
    this.realWeight = row[2] && !isNaN(row[2]) ? row[2] : 0;
    this.officialWeight = row[3] && !isNaN(row[3]) ? row[3] : 0;
    this.options = row[5];

    this.model = null; // defined later
  }
}
