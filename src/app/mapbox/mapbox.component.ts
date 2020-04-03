import { Component, OnInit } from '@angular/core';

import * as mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import { interval } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-mapbox',
  templateUrl: './mapbox.component.html',
  styleUrls: ['./mapbox.component.css']
})
export class MapboxComponent implements OnInit {
  map: mapboxgl.Map;
  mapServerLink = 'http://13.234.231.119:8080/styles/osm-bright/style.json';
  lat = 72.5755;
  lng = 23.028;
  points = [];
  route = [];
  lastDistance;
  truckMarker;
  markers = [];

  constructor() { }

  ngOnInit() {
    this.map = new mapboxgl.Map({
      container: 'map2',
      style: this.mapServerLink,
      center: [this.lat, this.lng],
      zoom: 12
      // hash: true
    });
    this.map.addControl(new mapboxgl.NavigationControl());
    this.map.on('click', (evt) => {
      if (this.points.length === 2) { return; }
      console.log('evt.lngLat', evt.lngLat);
      this.points.push(JSON.parse(JSON.stringify([evt.lngLat.lng, evt.lngLat.lat])));
      let marker = new mapboxgl.Marker(this.getIcon('source'))
      if (this.points.length === 2) {
        marker = new mapboxgl.Marker();
      }
      marker.setLngLat(evt.lngLat).addTo(this.map);
      this.markers.push(marker);
      if (this.points.length > 1) {
        this.drawLine();
      }
    });
  }

  drawLine() {
    const startPoint = this.points[this.points.length - 2];
    const endPoint = this.points[this.points.length - 1];
    const route = this.getRoute(startPoint, endPoint);

    const lineDistance = turf.lineDistance(route, { units: 'kilometers' });
    this.lastDistance = lineDistance;
    const steps = 500;
    const arc = [];
    // Draw an arc between the `origin` & `destination` of the two points
    for (let i = 0; i < lineDistance; i += lineDistance / steps) {
      const segment = turf.along(route, i, { units: 'kilometers' });
      arc.push(segment.geometry.coordinates);
    }

    // Update the route with calculated arc coordinates
    route.geometry.coordinates = arc;
    console.log('route.geometry.coordinates', route.geometry.coordinates);

    this.map.addSource('route', {
      'type': 'geojson',
      'data': route
    });

    this.map.addLayer({
      'id': 'route',
      'type': 'line',
      'source': 'route',
      'layout': {
        'line-join': 'round',
        'line-cap': 'round'
      },
      'paint': {
        'line-color': '#888',
        'line-width': 8
      }
    });
    this.route = arc;
    this.truckMarker = new mapboxgl.Marker(this.getIcon('userlocation')).setLngLat(arc[0]).addTo(this.map);
    this.startMovement(arc);
  }
  startMovement(geoJson) {
    let counter = 1;
    this.moveMarker(geoJson[counter]);
    interval(30)
      .pipe(
        take(geoJson.length - 2)
      ).subscribe((resp) => {
        counter++;
        this.moveMarker(geoJson[counter]);
      });
  }

  moveMarker(lngLat) {
    this.truckMarker.setLngLat(lngLat);
  }

  getRoute(origin, destination): any {
    return {
      'type': 'Feature',
      'properties': {},
      'geometry': {
        'type': 'LineString',
        'coordinates': [origin, destination]
      }
    };
  }

  setStartingPoint(origin): any {
    return {
      'type': 'FeatureCollection',
      'features': [
        {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'Point',
            'coordinates': origin
          }
        }
      ]
    };
  }

  getIcon(type: string): HTMLElement {
    const el = document.createElement('div');
    let backgroundImage = 'url(/assets/pin.png)';
    switch (type) {
      case 'source':
        el.style.top = '-13px';
        backgroundImage = 'url(/assets/pin.png)';
        break;
      case 'destination':
        backgroundImage = 'url(/assets/destination.png)';
        break;
      case 'userlocation':
        el.style.top = '-15px';
        backgroundImage = 'url(/assets/truck.svg)';
        break;
    }
    el.className = 'marker';
    el.style.backgroundImage = backgroundImage;
    el.style.backgroundRepeat = 'no-repeat';
    el.style.width = '60px';
    el.style.height = '60px';
    return el;
  }

  restart() {
    if (this.truckMarker) {
      this.moveMarker(this.route[0]);
      this.startMovement(this.route);
    }
  }

  clear() {
    this.map.getLayer('route') && this.map.removeLayer('route');
    this.map.getSource('route') && this.map.removeSource('route');
    this.points = [];
    this.route = [];
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
    this.truckMarker && this.truckMarker.remove();
  }
}
