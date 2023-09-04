
import { Service } from "../models";

export class ServiceDVGTHelper {
    public static COD: string = "COD";

    static mapServiceDVGT(allServiceDVGTs: Service[], strServiceDVGTS: string): string {
        const arrServiceDVGT: number[] = strServiceDVGTS.split(',').map(x => parseInt(x, 10));
        let result: string = "";
        let arr: string[] = [];
        allServiceDVGTs.forEach(e => {
            arrServiceDVGT.forEach(n => {
                if (e.id === n) {
                    arr.push(e.name);
                }
            });
        });
        result = arr.join(", ");
        return result;
    }

} 