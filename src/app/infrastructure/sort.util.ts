export class SortUtil {
    static sortAlphanumerical(datasource: any, type: number, propParent: string, propChild?: string): any {
        const collator = new Intl.Collator("en", {numeric: true, sensitivity: "base"});
        if (type === 1) {
            if (propChild) {
                datasource = datasource.sort((a,b) => collator.compare(a[propParent][propChild], b[propParent][propChild]));
            } else {
                datasource = datasource.sort((a,b) => collator.compare(a[propParent], b[propParent]));
            }
        }
        if (type === -1) {
            if (propChild) {
                datasource = datasource.sort((a,b) => collator.compare(b[propParent][propChild], a[propParent][propChild]));
            } else {
                datasource = datasource.sort((a,b) => collator.compare(b[propParent], a[propParent]));
            }
        }
        return datasource;
    }

    static getIdMaxOfShipmentNumbers(arr: any[]): number {
        const arrWithDot = arr.filter(x => x.shipmentNumber.lastIndexOf(".") !== -1);
        let shipmentNumberMax: string;
        if (arrWithDot.length === 0 ) {
            shipmentNumberMax = SortUtil.sortAlphanumerical(arr, -1, "shipmentNumber")[0].shipmentNumber;
        } else {
            shipmentNumberMax = SortUtil.sortAlphanumerical(arrWithDot, -1, "shipmentNumber")[0].shipmentNumber;
        }
        // const shipmentNumberMax = SortUtil.sortAlphanumerical(arr, -1, "shipmentNumber")[0].shipmentNumber;
        const indexDot = shipmentNumberMax.lastIndexOf(".");
        const idMax = parseInt(shipmentNumberMax.substring(indexDot + 1), 10);
        if (isNaN(idMax)) {
            // cannot parseInt id max of array shipmentNumbers
            console.log("cannot get idMax");
            return null;
        }
        return idMax;
    }
}