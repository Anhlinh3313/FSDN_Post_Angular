import { GeneralModel } from "./general.model";
export class Size extends GeneralModel{
    id: number;
    code: string;
    name: string;
    width: number;
    height: number;
    length: number;
    isPackage: boolean;
    isBox : boolean;
    isEnabled: boolean = true;
}