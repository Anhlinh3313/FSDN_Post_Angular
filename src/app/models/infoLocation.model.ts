import { Hub } from "./hub.model";

export class InfoLocation {
    provinceName: string;
    provinceId: number;
    districtName: string;
    districtId: number;
    wardName: string;
    wardId: number;
    hubId: number;
    hub: Hub;
    //
    address: string;
    lat: any;
    lng: any;
    key: any;
}