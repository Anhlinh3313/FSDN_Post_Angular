import { SearchDate } from "./searchDate.helper";
import { elementAt } from "rxjs/operator/elementAt";
import { SelectItem } from "primeng/primeng";
import * as moment from "moment";
import { environment } from "../../environments/environment";

export class FilterUtil {
    static Column = {
        shipment: {
            shipmentStatus: "shipmentStatus",
            fromHubRouting: "fromHubRouting",
            fromHub: "fromHub",
            toHubRouting: "toHubRouting",
            sender: "sender",
            currentEmp: "currentEmp",
            pickUser: "pickUser",
            deliveryAppointmentTime: "deliveryAppointmentTime",
            fromWard: "fromWard",
            toWard: "toWard",
            service: "service",
            paymentType: "paymentType",
            package: "package",
            toHub: "toHub",
            listGoods: "listGoods",
            currentHub: "currentHub",
            receiveHub: "receiveHub",
        },
        listGood: {
            listGoodsStatus: "listGoodsStatus",
            toHub: "toHub",
            transportType: "transportType",
            tpl: "tpl",
            emp: "emp"
        }
    }

    static gbFilterFiled(row, gbFilter, columns) {
        let isInFilter = false;
        let noFilter = true;

        if (gbFilter) {
            gbFilter = gbFilter.toString().toLowerCase();
            gbFilter =  SearchDate.searchFullDate(gbFilter) ?  SearchDate.searchFullDate(gbFilter) : (
                SearchDate.searchDayMonth(gbFilter) ? SearchDate.searchDayMonth(gbFilter) : gbFilter
            );
            for (var index = 0; index < columns.length; index++) {
                let columnName = columns[index];
                let rowValue: String;
                let arr = columnName.split(".");

                if (arr.length == 1) {
                    if (!row[columnName]) {
                        continue;
                    }

                    noFilter = false;
                    rowValue = row[columnName].toString().toLowerCase();
                } else if (arr.length > 1) {
                   try {
                    let element = row[arr[0]][arr[1]];
                    if (!element) {
                        continue;
                    }

                    noFilter = false;
                    rowValue = element.toString().toLowerCase();
                   } catch (error) {
                    continue;
                   }
                }

                if (rowValue.includes(gbFilter)) {
                    isInFilter = true;
                }
            }
        }

        if (noFilter) { isInFilter = true; }

        return isInFilter;
    }

    static filterField(row, filter) {
        let isInFilter = false;
        let noFilter = true;

        for (var columnName in filter) {
            if (row[columnName] == null) {
                return;
            }
            noFilter = false;
            let rowValue: String = row[columnName].toString().toLowerCase();
            let filterMatchMode: String = filter[columnName].matchMode;
            if (filterMatchMode.includes("contains") && rowValue.includes(filter[columnName].value.toLowerCase())) {
                isInFilter = true;
            } else if (filterMatchMode.includes("startsWith") && rowValue.startsWith(filter[columnName].value.toLowerCase())) {
                isInFilter = true;
            } else if (filterMatchMode.includes("in") && filter[columnName].value.includes(rowValue)) {
                isInFilter = true;
            }
        }

        if (noFilter) { isInFilter = true; }

        return isInFilter;
    }

    static compareField(rowA, rowB, field: string): number {
        if (!field) {
            return 1;
        }
        const arrField = field.split(".");
        const collator = new Intl.Collator("en", {numeric: true, sensitivity: "base"});
        if (arrField.length === 1) {
            if (rowA[field] == null) return 1; // on considère les éléments null les plus petits
            if (typeof rowA[field] === "string") {
                return collator.compare(rowA[field], rowB[field]);
            }
            if (typeof rowA[field] === "number") {
                if (rowA[field] > rowB[field]) return 1;
                else return -1;
            }
        }
        if (arrField.length === 2) {
            if (!rowA[arrField[0]] || !rowB[arrField[0]]) return 1; // on considère les éléments null les plus petits
            if (rowA[arrField[0]][arrField[1]] != null) {
                if (typeof rowA[arrField[0]][arrField[1]] === "string") {
                    return collator.compare(rowA[arrField[0]][arrField[1]], rowB[arrField[0]][arrField[1]]);
                }
                if (typeof rowA[arrField[0]][arrField[1]] === "number") {
                    if (rowA[arrField[0]][arrField[1]] > rowB[arrField[0]][arrField[1]]) return 1;
                    else return -1;
                }
            }
        }
    }

    static  removeDuplicates(originalArray, prop) {
        var newArray = [];
        var lookupObject = {};
    
        for (var i in originalArray) {
          lookupObject[originalArray[i][prop]] = originalArray[i];
        }
    
        for (i in lookupObject) {
          newArray.push(lookupObject[i]);
        }
        return newArray;
    }

    static loadArrayFilter(datasource, arrCols: string[]) {
        let item: SelectItem[] = [];
        let outArray = [];
        let data = [];
        let result = [];
        arrCols.forEach(i => {
            datasource.forEach(element => {
                if(element[i]) {
                    if (i === this.Column.shipment.deliveryAppointmentTime) {
                        if (element.deliveryAppointmentTime) {
                            item.push({
                                label:  moment(element.deliveryAppointmentTime).format(environment.formatDateTime),
                                title: i,
                                value: element[i]
                            });
                        } 
                    } else if (i === this.Column.listGood.transportType) {
                        const j  = this.Column.listGood.tpl;
                        if (element[i].isRequiredTPL) {
                            if (element[j]) {
                                item.push({
                                    label: `${element[j].code} - ${element[i].name}`,
                                    title: i,
                                    value: element[i].id + element[j].id
                                });
                            }
                        } else {
                            if (element[j]) {
                                item.push({
                                    label: `${element[j].code} - ${element[i].name}`,
                                    title: i,
                                    value: element[i].id + element[j].id
                                });
                            } else {
                                item.push({
                                    label: `${element[i].name} (NB)`,
                                    title: i,
                                    value: element[i].id
                                });                                
                            }
                        }
                    } else if (i === this.Column.shipment.fromWard) {
                        item.push({
                            label: element[i].district.province.name,
                            title: i,
                            value: element[i].district.province.id
                        });
                    } else if (i === this.Column.shipment.toWard) {
                        item.push({
                            label: element[i].district.province.name,
                            title: i,
                            value: element[i].district.province.id
                        });
                    } 
                    else if (i === this.Column.shipment.sender) {
                        item.push({
                            label: element[i].code + " - " +element[i].name,
                            title: i,
                            value: element[i].id
                        });
                    }
                    else if (i === this.Column.listGood.emp) {
                        item.push({
                            label: element[i].code + " - " +element[i].fullName,
                            title: i,
                            value: element[i].id
                        });
                    }
                     else {
                        if ( (element[i].name ||  element[i].fullName) &&  element[i].id) {
                            item.push({
                                label: (element[i].name) ? element[i].name : element[i].fullName,
                                title: i,
                                value: element[i].id
                            });
                            
                        }
                    }
                }
            });
        });
        outArray = arrCols.map(x => item.filter(e => e.title === x));
        result = outArray.map(x => this.removeDuplicates(x, "value"));
        if (result) {
            result.forEach(x => {
                if (x.length > 0) {
                    x.unshift({
                        label: "Chọn tất cả",
                        title: x[0].title,
                        value: null
                    });
                }
            });
        }
        return result;
    }
}