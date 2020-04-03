import { Component, OnInit } from '@angular/core';

import { Map, Icon, Marker, TileLayer, LatLng } from 'leaflet';
import * as L from 'leaflet';
import '../../assets/MovingMarker.js';
import 'leaflet-routing-machine';
import { LeafletService } from './leaflet.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-leaflet',
  templateUrl: './leaflet.component.html',
  styleUrls: ['./leaflet.component.css']
})
export class LeafletComponent implements OnInit {
  map: Map;
  tileLayer = 'http://13.233.167.243:8080/styles/osm-bright/{z}/{x}/{y}.png';
  routingServer = 'http://[2405:201:809:dee8:587:9cf3:dc44:f5b5]:5000/route/v1';
  // tileLayer = 'http://[2405:201:809:dee8:587:9cf3:dc44:f5b5]:9966/'
  lat = 72.5755;
  lng = 23.028;
  points = [];

  icon = new Icon({
    iconUrl: '/assets/pin.png',
    iconRetinaUrl: '/assets/pin.png',
    iconSize: [40, 40],
    iconAnchor: [22, 40],
    popupAnchor: [-3, -76],
    // shadowUrl: '/assets/pin.png',
    // shadowRetinaUrl: '/assets/pin.png',
    // shadowSize: [68, 95],
    // shadowAnchor: [22, 94]
  });

  source: string;
  destination: string;
  loading: boolean = false;

  constructor(
    private service: LeafletService
  ) { }

  ngOnInit() {
    this.map = new Map('map3', {
      // center: [this.lng, this.lat],
      center: [23.035334, 72.586664],
      zoom: 16
    });

    const layer = new TileLayer(this.tileLayer).addTo(this.map);
    this.drawCustomMap();
    this.service.easyRoute()
      .pipe(take(1))
      .subscribe((resp: any) => {
        if (resp.routes && resp.routes.length) {
          this.points = resp.routes[0].coordinates;
          // Draw Lines on the MAP.
          this.easyDirections();

          // Start the movement of the POINTs.
          this.startRide(this.points);
        }
      });
  }

  drawCustomMap() {
    this.source = new LatLng(23.030763, 72.582898);
    this.destination = new LatLng(23.035334, 72.586664);
    this.points.push(this.source, this.destination);
    this.setMarker(this.source);
    this.setMarker(this.destination);
  }

  setMarker(latLng) {
    new Marker(latLng, {
      icon: this.icon
    }).addTo(this.map);
  }

  directionLayer;
  routePoints;
  drawDirectionsOnMap() {
    if (this.directionLayer) {
      this.startRide(this.routePoints);
    }
    this.directionLayer = new L.Routing.control({
      waypoints: [
        ...this.points
      ]
    }).addTo(this.map);
    this.directionLayer.on('routesfound', (evt) => {
      console.log('evt', JSON.stringify(evt));
      if (evt.routes && evt.routes.length) {
        setTimeout(() => {
          this.startRide(evt.routes[0].coordinates);
        }, 400);
      }
    });
  }

  rideMarker;
  startRide(points) {
    this.routePoints = points;
    this.rideMarker = L.Marker.movingMarker(points, 4000, {
      autostart: true,
      icon: this.icon
    }).addTo(this.map);
  }

  easyDirections() {
    this.directionLayer = new L.Polyline(this.points, {
      color: 'green',
      opacity: 1,
      weight: 1,
      clickable: false
    }).addTo(this.map);
  }

}

/**
 * Shift how much money collect.
 * Shift denomination and money collection report.
 *
 *
 */
