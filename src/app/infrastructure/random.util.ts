import { TypeCodeHelper } from "./typeCodeHelper";

export class RandomUtil {
    static getChildShipmentNumber(requestShipmentNumber: string, idMaxOfArr: number, typeRequestCode?: number): string {
        const childShipmentId = idMaxOfArr + 1;
        const childShipmentIdZero = childShipmentId.toString().padStart(4, "0");
        const shipmentNumber = `${requestShipmentNumber}.${childShipmentIdZero}`;
        return shipmentNumber;
    }
}