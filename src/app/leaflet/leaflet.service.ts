import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LeafletService {

  baseUrl = 'https://api.openrouteservice.org/geocode/';

  constructor(
    private http: HttpClient
  ) { }

  search(query: string) {
    const params = new HttpParams()
      .set('api_key', environment.geoCoderKey)
      .set('address', query)
      .set('region', 'Ahmedabad')
      .set('country', 'India');
    return this.http.get(`${this.baseUrl}search/structured`, {
      params
    });
  }

  freeSearch(query: string) {
    const params = new HttpParams()
      .set('q', query)
      .set('limit', '5')
      .set('format', 'json')
      .set('addressdetails', '1');
    return this.http.get(`//nominatim.openstreetmap.org/search`, {
      params
    });
  }

  enhancedSearch(query: string) {
    return this.http.get(`http://dev.virtualearth.net/REST/v1/Locations/${query}`);
  }

  easyRoute() {
    return this.http.get('/assets/route1.json');
  }
}
