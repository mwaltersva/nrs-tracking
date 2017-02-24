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
      .forEach(car => {
        let thisCar = newCars[car.id];
        if (thisCar) {
          car.accuracy = thisCar.Accuracy;
          car.carNumber = thisCar.CarNumber;
          car.createdAt = thisCar.CreatedAtZulu;
          car.createdAtTimeZone = thisCar.CreatedAtTimeZone;
          car.lat = Number(thisCar.Lat);
          car.lon = Number(thisCar.Lon);
          car.speed = Number(thisCar.Speed);

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
          createdAtTimeZone: newCars[key].CreatedAtTimeZone,
          createdAt: newCars[key].CreatedAtZulu,
          lat: Number(newCars[key].Lat),
          lon: Number(newCars[key].Lon),
          speed: newCars[key].Speed
        });
      });
  }
}
