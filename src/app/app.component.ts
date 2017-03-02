import {Component, OnInit} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs';
import * as moment from 'moment';

const zeroCars = /#0[0-9]{0,3}|#00[0-9]{0,3}|#000[0-9]{0,3}|#combo[0-9]{0,3}/i;
const sweepCars = /#sweep[0-9]{0,3}/i;
const stewardCars = /#steward.*/i;
const radioCars = /#radio.*/i;
const compCars = /#[0-9]{1,4}/i;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  cars: Array<any> = [];
  updateTime: number = 5000;
  carFilterString: string = '';
  getCarInterval: any;
  isPolling: boolean = false;
  mapLat: number = 34.6017938;
  mapLon: number = -80.0297092;

  constructor(private http: Http) {
  }

  ngOnInit() {
    this.doFilter();
    this.startPolling();
  }

  startPolling() {
    this.isPolling = true;
    this.getCarInterval = this.initializePolling()
      .subscribe((response: any) => {
        let cars = JSON.parse(response._body);
        this.processCars(cars);
      });
  }

  stopPolling() {
    this.isPolling = false;
    if (this.getCarInterval !== null && !this.getCarInterval.isUnsubscribed) {
      this.getCarInterval.unsubscribe();
    }
  }

  initializePolling() {
    return Observable
      .interval(this.updateTime)
      .flatMap(() => this.getCars());
  }

  doFilter() {
    this.getCars()
      .subscribe((response: any) => {
        let cars = JSON.parse(response._body);
        this.processCars(cars);
      });
  }

  getCars() {
    return this.http
      .get('https://odometer-6db4f.firebaseio.com/LivePositions.json');
  }

  processCars(newCars) {
    this.cars
      .forEach((car, index: number) => {
        let thisCar = newCars[car.id];
        if (thisCar) {
          car.accuracy = thisCar.Accuracy;
          car.carNumber = thisCar.CarNumber;
          car.createdAt = thisCar.CreatedAtLocal;
          car.lat = Number(thisCar.Lat);
          car.lon = Number(thisCar.Lon);
          car.speed = Number(thisCar.SpeedMPH).toFixed(1);
          [car.iconUrl, car.opacity] = this.calculateIconUrl(car);

          delete newCars[car.id];
        }
      });

    Object
      .keys(newCars)
      .forEach(key => {
        let car: any = {
          id: key,
          accuracy: newCars[key].Accuracy,
          carNumber: newCars[key].CarNumber,
          createdAt: newCars[key].CreatedAtLocal,
          lat: Number(newCars[key].Lat),
          lon: Number(newCars[key].Lon),
          speed: Number(newCars[key].SpeedMPH).toFixed(1)
        };

        [car.iconUrl, car.opacity] = this.calculateIconUrl(car);
        this.cars.push(car);
      });

    this.cars
      .sort((a, b) => {
        if (a.carNumber > b.carNumber) return 1;
        if (a.carNumber < b.carNumber) return -1;
        return 0
      });

    this.centerOnCar();
  }

  clickFilter(car) {
    this.carFilterString = car.carNumber;

    if (car.lat && car.lon) {
      this.mapLat = car.lat;
      this.mapLon = car.lon;
    }
  }

  isActive(carNumber) {
    if ((!carNumber) || (!this.carFilterString)) return false;
    return carNumber.toLowerCase() === this.carFilterString.toLowerCase();
  }

  clearFilter() {
    this.carFilterString = '';
  }

  onlyCourseCars() {
    this.carFilterString = 'coursecars';
  }

  centerOnCar() {
    if (!this.carFilterString) return false;

    this.cars
      .forEach((car) => {
        if (car.carNumber.toLowerCase() === this.carFilterString.toLowerCase()) {
          if (car.lat && car.lon) {
            this.mapLat = car.lat;
            this.mapLon = car.lon;
          }
        }
      });
  }

  calculateIconUrl(car) {
    let iconUrl: string;
    let opacity: number;

    let zero: string = 'http://maps.google.com/mapfiles/marker.png';
    let sweep: string = 'http://maps.google.com/mapfiles/marker_orange.png';
    let comp: string = 'http://maps.google.com/mapfiles/marker_purple.png';
    let stewards: string = 'http://maps.google.com/mapfiles/marker_white.png';
    let radios: string = 'http://maps.google.com/mapfiles/marker_black.png';
    let def: string = 'http://maps.google.com/mapfiles/marker_green.png';
    let cowboy: string = 'http://tracking.nasarallysport.com/assets/cb-white.png';

    if (!car.carNumber) {
      iconUrl = def;
    } else if (car.carNumber.match(zeroCars)) {
      iconUrl = zero;
    } else if (car.carNumber.match(sweepCars)) {
      iconUrl = sweep;
    } else if (car.carNumber.match(stewardCars)) {
      iconUrl = stewards;
    } else if (car.carNumber.match(radioCars)) {
      iconUrl = radios;
    } else if (car.carNumber.match(compCars)) {
      iconUrl = comp;
    } else if (car.carNumber.match(/#.*cowboy.*/i)) {
      iconUrl = cowboy;
    } else {
      iconUrl = def;
    }

    let luMoment = moment(car.createdAt);
    let nowMoment = moment(new Date());
    let minutesDiff = nowMoment.diff(luMoment, 'minutes');

    if (minutesDiff < 5) {
      opacity = 1;
    } else if (minutesDiff >= 5 && minutesDiff < 10) {
      opacity = 0.90;
    } else if (minutesDiff >= 10 && minutesDiff < 30) {
      opacity = 0.75;
    } else {
      opacity = 0.5;
    }

    return [iconUrl, opacity];
  }
}
