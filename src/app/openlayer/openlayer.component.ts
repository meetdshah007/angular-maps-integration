import { Component, OnInit } from '@angular/core';
import { UtilService } from './util.service';

import * as ol from 'ol';
import { Icon, Style, Stroke, Circle, Fill } from 'ol/style';
import { Point } from 'ol/geom';
import { fromLonLat } from 'ol/proj';
import * as layer from 'ol/layer';
import * as source from 'ol/source';

@Component({
  selector: 'app-openlayer',
  templateUrl: './openlayer.component.html',
  styleUrls: ['./openlayer.component.css']
})
export class OpenlayerComponent implements OnInit {
  points: any[] = [];

  map;
  view;
  layer;
  source;

  vectorLayer;
  vectorSource;

  style = 'http://13.233.172.247:8080/styles/osm-bright.json';
  lat = 72.5755;
  lng = 23.028;

  constructor(
    private util: UtilService
  ) { }

  ngOnInit() {
    this.buildMap();
  }

  buildMap() {
    this.source = new source.TileJSON({
      url: this.style
    });

    this.layer = new layer.Tile({
      source: this.source
    });

    this.view = new ol.View({
      center: fromLonLat([this.lat, this.lng]),
      zoom: 12
    });

    this.prepareVectorLayer();

    this.map = new ol.Map({
      target: 'map',
      layers: [this.layer, this.vectorLayer],
      view: this.view
    });

    this.map.on('singleclick', (evt) => {
      this.createMarker(evt.coordinate);
    });
  }

  prepareVectorLayer() {
    this.vectorSource = this.feature;
    this.vectorLayer = new layer.Vector({
      source: this.vectorSource
    });
  }

  createMarker(cords) {
    this.points.push(JSON.parse(JSON.stringify(cords)));
    const iconGeometry = new Point(cords);
    const iconFeature = new ol.Feature({
      type: 'place',
      geometry: iconGeometry
    });
    const iconStyle = new Style({
      image: new Icon(({
        anchor: [0.5, 46],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        size: [48, 48],
        opacity: 1,
        src: '/assets/pin.png'
      }))
    });
    iconFeature.setStyle(iconStyle);
    this.vectorSource.addFeature(iconFeature);
    if (this.points.length > 1) {
      const lastPoint = this.points[this.points.length - 2];
      // get the route
      this.util.createRoute(lastPoint, cords, this.vectorSource, this.map);
    }
  }

  moveObjects() {
    const geoMarker = new Point(this.points[0]);
    const startMarker = new ol.Feature({
      type: 'icon',
      geometry: new Point(this.points[0])
    });
    const endMarker = new ol.Feature({
      type: 'icon',
      geometry: new Point(this.points[this.points.length - 1])
    });

    const styles = {
      'route': new Style({
        stroke: new Stroke({
          width: 6, color: [237, 212, 0, 0.8]
        })
      }),
      'icon': new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: 'data/icon.png'
        })
      }),
      'geoMarker': new Style({
        image: new Circle({
          radius: 7,
          fill: new Fill({ color: 'black' }),
          stroke: new Stroke({
            color: 'white', width: 2
          })
        })
      })
    };
  }

  clearPins() {
    this.vectorSource.clear();
    this.points = [];
  }

  get feature() {
    return new source.Vector({
      features: this.points
    });
  }
}
