import {Component, OnInit} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs';

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
          car.speed = Number(thisCar.SpeedMPH);

          delete newCars[car.id];
        }
      });

    Object
      .keys(newCars)
      .forEach(key => {
        this.cars.push({
          id: key,
          accuracy: newCars[key].Accuracy,
          carNumber: newCars[key].CarNumber,
          createdAt: newCars[key].CreatedAtLocal,
          lat: Number(newCars[key].Lat),
          lon: Number(newCars[key].Lon),
          speed: newCars[key].SpeedMPH
        });
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
}
