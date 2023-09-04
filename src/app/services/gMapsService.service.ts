/// <reference types="@types/googlemaps" />
import { Injectable, NgZone } from '@angular/core';
import { GoogleMapsAPIWrapper } from '@agm/core';
import { MapsAPILoader } from '@agm/core';
// import { } from "googlemaps";
import { GMapHelper } from "../infrastructure/gmap.helper";
import { GMap } from "../models/gMap.model";

@Injectable()
export class GMapsService extends GoogleMapsAPIWrapper {
    constructor(private __loader: MapsAPILoader, private __zone: NgZone,
        private mapsAPILoader: MapsAPILoader, ) {
        super(__loader, __zone);
    }

    getLatLan(address: string): GMap {
        let gmap: GMap = new GMap();
        this.mapsAPILoader.load().then(() => {
            let geocoder = new google.maps.Geocoder();
            geocoder.geocode({ 'address': address }, function (results, status) {
                gmap.status = status.toString();
                if (status == google.maps.GeocoderStatus.OK) {
                    results[0].address_components.forEach(element => {
                        if (
                            element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_1) !== -1
                        ) {
                            gmap.province = element.long_name;
                        } else if (
                            element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_2) !== -1
                        ) {
                            gmap.district = element.long_name;
                        } else if (element.types.indexOf(GMapHelper.SUBLOCALITY_LEVEL_1) !== -1) {
                            gmap.ward = element.long_name;
                        }
                    });
                    gmap.lat = results[0].geometry.location.lat();
                    gmap.lng = results[0].geometry.location.lng();
                    gmap.formatted_address =  results[0].formatted_address;
                } else {
                    gmap.result = results;
                }
            });
        });
        return gmap;
    }
}