import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import { AddressModel } from '../../models/address.model';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

const API_COUNTRIES_TOKEN = `${environment.CountriesUniversalAPIToken}/getaccesstoken`;
const API_COUNTRIES_INFO = `${environment.CountriesUniversalAPIToken}/states/Ecuador`;
const API_CITY_INFO = `${environment.CountriesUniversalAPIToken}/cities/`;

@Injectable({
  providedIn: 'root',
})
export class AddressHTTPService {
  isLoading$: Observable<boolean>;
  isLoadingSubject: BehaviorSubject<boolean>;
  constructor(private http: HttpClient) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.isLoading$ = this.isLoadingSubject.asObservable();
  }

  // public methods
  getAddressToken(): Observable<any> {
    this.isLoadingSubject.next(true);
    return this.http
      .get<any>(`${API_COUNTRIES_TOKEN}`, {
        headers: {
          Accept: 'application/json',
          'api-token':
            't6AGwRs9Cr9ysWmJR8bZFO0RCPBketUjtzbWiUgcIY9HZoMzuR9JYR0YfHSE_E3MX4o',
          'user-email': 'christlopbsc12@gmail.com',
        },
      })
      .pipe(
        map((result) => {
          return result;
        }),
        catchError((err) => {
          console.log('err', err);
          throw err;
        }),
        finalize(() => this.isLoadingSubject.next(false))
      );
  }

  getAddressCountriesInfo(token: string): Observable<AddressModel[]> {
    this.isLoadingSubject.next(true);
    return this.http
      .get<AddressModel[]>(`${API_COUNTRIES_INFO}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })
      .pipe(
        map((result: AddressModel[]) => {
          return result;
        }),
        catchError((err) => {
          console.log('err', err);
          throw err;
        }),
        finalize(() => this.isLoadingSubject.next(false))
      );
  }

  getAddressCitiesInfo(
    token: string,
    state: string
  ): Observable<AddressModel[]> {
    this.isLoadingSubject.next(true);
    return this.http
      .get<AddressModel[]>(`${API_CITY_INFO}${state}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })
      .pipe(
        map((result: AddressModel[]) => {
          return result;
        }),
        catchError((err) => {
          console.log('err', err);
          throw err;
        }),
        finalize(() => this.isLoadingSubject.next(false))
      );
  }
}
