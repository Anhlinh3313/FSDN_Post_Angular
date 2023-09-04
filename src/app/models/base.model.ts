import { IBaseModel } from "./abstract/ibaseModel.interface";

export class BaseModel implements IBaseModel {
    id: number;

     constructor(id: number) {
        this.id = id;
     }
}