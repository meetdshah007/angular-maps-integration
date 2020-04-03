import { Injectable } from '@angular/core';
import { transform } from 'ol/proj';
import { Style, Stroke } from 'ol/style';
import { Point, LineString } from 'ol/geom';
import * as ol from 'ol';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  urlNearest = '//router.project-osrm.org/nearest/v1/driving/';
  urlRoute = '//router.project-osrm.org/route/v1/driving/';

  route = new Style({
    stroke: new Stroke({
      width: 6, color: [40, 40, 40, 0.8]
    })
  });

  constructor() { }

  getNearest(coord) {
    const coord4326 = this.to4326(coord);
    return new Promise((resolve, reject) => {
      // make sure the coord is on street
      fetch(this.urlNearest + coord4326.join()).then((response) => {
        // Convert to JSON
        return response.json();
      }).then((json) => {
        if (json.code === 'Ok') {
          resolve(json.waypoints[0].location);
        } else {
          reject();
        }
      });
    });
  }

  fetchRoute(point1, point2) {
    return fetch(`${this.urlRoute}${point1};${point2}`).then(resp => resp.json());
  }

  createRoute(point1, point2, vectorSource, map) {
    const points = [point1, point2];
    const geometry = new LineString(points);
    const feature = new ol.Feature({
      name: 'Line',
      geometry
    });
    vectorSource.addFeature(feature);
  }

  to4326(coord) {
    return transform([
      parseFloat(coord[0]), parseFloat(coord[1])
    ], 'EPSG:3857', 'EPSG:4326');
  }
}
