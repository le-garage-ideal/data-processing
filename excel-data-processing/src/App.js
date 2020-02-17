import React, { Component } from 'react';
import './App.css';
import XLSX from 'xlsx';
import { Car } from './Car';
import { Manufacturer } from './Manufacturer';
import { Model } from './Model';
import { detectModel } from '../../weight-cars-data-processing/model-detection';
import { csvEscape } from '../../weight-cars-data-processing/csv';

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      files: [
        'Abarth 31082018.xls',
        'AC.xls',
        'ALFA ROMEO 31082017.xls',
        'Alpina 31082017.xls',
        'ARIEL 11032016.xls',
        'Artega.xls',
        'Aston Martin 31082017.xls',
        'AUDI 31082017.xls',
        'BENTLEY 31082017.xls',
        'BMW 31082017.xls',
        'BUGATTI 11032016.xls',
        'CADILLAC 12012017.xls',
        'CATERHAM 01092016.xls',
        'CHEVROLET 31082017.xls',
        'CHRYSLER 01042016.xls',
        'CITROEN 01092016.xls',
        'DODGE 01062016.xls',
        'Donkervoort 13122015.xls',
        'DS 02072016.xls',
        'FERRARI 31082017.xls',
        'FIAT 01092016.xls',
        'FORD 31082017.xls',
        'GUMPERT.xls',
        'HOMMELL.xls',
        'HONDA 31082017.xls',
        'HUMMER 11032016.xls',
        'HYUNDAI 11032016.xls',
        'INFINITI 01062016.xls',
        'JAGUAR 31082017.xls',
        'JEEP 01042016.xls',
        'KIA.xls',
        'KOENIGSEGG 11032016.xls',
        'KTM 01042016.xls',
        'LAMBORGHINI 01062016.xls',
        'LANCIA.xls',
        'LAND ROVER 31082017.xls',
        'LEXUS 24032017.xls',
        'LOTUS 31082017.xls',
        'MASERATI 31082017.xls',
        'MAZDA 0106016.xls',
        'MC LAREN 31082017.xls',
        'MERCEDES 31082017.xls',
        'MG.xls',
        'MINI 24032017.xls',
        'MITSUBISHI 01062016.xls',
        'MORGAN 01042016.xls',
        'NISSAN 31082017.xls',
        'OPEL 31082017.xls',
        'PAGANI.xls',
        'PEUGEOT 01042016.xls',
        'PORSCHE 31082017.xls',
        'RADICAL 31082017.xls',
        'RENAULT 18052017.xls',
        'ROLLS ROYCE 31082017.xls',
        'ROVER.xls',
        'SAAB.xls',
        'SEAT 31082017.xls',
        'SKODA 16072016.xls',
        'SMART 18122016.xls',
        'SUBARU 01062014.xls',
        'SUZUKI 01042016.xls',
        'TALBOT.xls',
        'TESLA 31082017.xls',
        'TOYOTA 18122016.xls',
        'TVR.xls',
        'VENTURI.xls',
        'VOLVO 31082017.xls',
        'VW 31082017.xls',
        'WESTFIELD.xls',
        'WIESMANN 11032016.xls',
        'ZENOS 27072015.xls',
      ],
      content: []
    };

    this.readFiles();
  }

  readFiles() {
    let promises = this.state.files.map(filename => {
      const manufacturer = new Manufacturer(filename);
      return this.readFile(filename, manufacturer).then(models => {
        manufacturer.models = models;
        return manufacturer;
      });
    });
    Promise.all(promises).then(content => {
      this.setState({content});
    });
  }

  readFile(filename, manufacturer) {

    /* set up async GET request */
    return fetch(`/xls/${filename}`).then(response => response.arrayBuffer())
    .then(response => {
      const data = new Uint8Array(response);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const content = [];
      let cars = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < 5) {
          // Series (audi A, audi S, audi Q ...)
        } else {
          cars.push(new Car(row));
        }
      }
      cars.sort((a, b) => a.variant > b.variant);
      const model = detectModel(cars);
      content.push(model);
      content.sort((m1, m2) => m1.name < m2.name);
      return content;
    });

  }


  render() {
    let manufacturers = ['id;name']
      .concat(this.state.content.map(manufacturer => `${manufacturer.id};${manufacturer.name}`));

    let models = ['id; name;manufacturer_id']
      .concat(this.state.content.flatMap(manufacturer =>
        manufacturer.models.map(model => `${model.id};${model.name};${model.manufacturer.id}`)
      ));

    let cars = ['id; variant; power; real_weight; official_weight; options; start_date; model_id']
      .concat(this.state.content.flatMap(manufacturer =>
        manufacturer.models.flatMap(model =>
          model.cars.map(car =>
            `${car.id};${csvEscape(car.variant)};${car.power};${car.realWeight};${car.officialWeight};${csvEscape(car.options)};${car.startDate};${car.model.id}`
          )
        )
      ));

    return (
      <div className="App">
        <header className="App-header">
          Weight Cars
        </header>
        <h3>Manufacturers</h3>        
        <textarea value={manufacturers.join('\n')} readOnly rows="5" cols="120"></textarea>
        <h3>Models</h3>
        <textarea value={models.join('\n')} readOnly rows="5" cols="120"></textarea>
        <h3>Cars</h3>
        <textarea value={cars.join('\n')} readOnly rows="5" cols="120"></textarea>
      </div>
    );
  }
}

export default App;
