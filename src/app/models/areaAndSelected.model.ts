import { Area } from ".";
import { SelectItem } from "primeng/primeng";
import { SelectModel } from "./select.model";

export class AreaAndSelect extends Area {
    multiSelectProvinces?: any[] = [];

    districts?: SelectModel[];
    multiSelectDistrict?: any[] = [];

    fromProvinces?: SelectModel[];
    multiSelectFromProvince?: any[] = [];

    showInfo: boolean;
}