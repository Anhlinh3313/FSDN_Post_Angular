import { ResponseModel } from "..";
import { SumOfRequestShipment } from "./sumOfRequestShipment.interface";

export interface ResponseOfRequestShipment extends ResponseModel {
    sumOfRequestShipment: SumOfRequestShipment;
}
