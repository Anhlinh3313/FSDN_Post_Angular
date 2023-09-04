import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import * as moment from "moment";
export class ExportExcelHelper {
    static s2ab(s: string): ArrayBuffer {
        const buf: ArrayBuffer = new ArrayBuffer(s.length);
        const view: Uint8Array = new Uint8Array(buf);
        for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }

    static format(value: any, typeFormat: string, formatString: string) {
        if (typeFormat) {
            if (typeFormat === "date") {
                if (formatString) {
                    return moment(value).format(formatString);
                }
            }
        }
        return value;
    }

    static mapDataToExport(datas: any[], columns: any[]) {
        let exportData: any[] = [];
        if (!datas || !columns) return exportData;
        let header: any[] = [];
        columns.map(x => header.push(x.header));
        exportData.push(header);
        datas.map(x => {
            let row: any[] = [];
            let b: any;
            columns.forEach(element => {
                if (!element.field2) {
                    b = x[element.field];
                } else {
                    b = x[element.field2] ? (x[element.field] + " - " + x[element.field2]) : (x[element.field] + " -");
                }
                if (element.child) {
                    if (x[element.field]) {
                        if (element.childName) b = b[element.childName];
                        else b = b["name"];
                    }
                    if (!b && b != 0) b = "";
                    row.push(b);
                } else {
                    if (!b && b != 0) b = "";
                    row.push(this.format(b,element.typeFormat,element.formatString));
                }
            });
            exportData.push(row);
        });
        return exportData;
    }

    static exportXLSX(data: any, fileName: string) {
        if (fileName.indexOf(".xlsx") === -1) {
            fileName = fileName + ".xlsx";
        }
        const wopts: XLSX.WritingOptions = { bookType: "xlsx", type: "binary" };
        const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        const wbout: string = XLSX.write(wb, wopts);
        saveAs(new Blob([this.s2ab(wbout)]), fileName);
    }
    
    static ExportData(datas: any[], columns: any[]) {
        let exportData: any[] = [];
        if (!datas || !columns) return exportData;
        let header: any[] = [];
        columns.map(x => { header.push(x.header) });
        exportData.push(header);

        datas.map((x, countIndex) => {
            let row: any[] = [];
            columns.forEach((element, i) => {
                if (element.child) {
                    let b = x[element.field]
                    if (x[element.field]) {
                        if (element.childName) b = b[element.childName];
                        else b = b["name"];
                    }
                    if (!b && b != 0) b = "";
                    row.push(b);
                } else if (element.IsNO) {
                    row.push(countIndex + 1);
                } else if (element.isCompareTime) {
                    let value = '';
                    if (x[element.fieldStart] && x[element.fieldEnd]) {
                        const diffInMs = Date.parse(x[element.fieldEnd]) - Date.parse(x[element.fieldStart]);
                        if (diffInMs > 0) {
                            const diffInMinutes = diffInMs / 1000 / 60;
                            value = Math.round(diffInMinutes / 60) + ':' + Math.round(diffInMinutes % 60)
                        }
                    }
                    row.push(value);
                } else {
                    if (element.field) {
                        let b = x[element.field];
                        if (x[element.field1]) b = b + x[element.field1];
                        if (x[element.field2]) b = b + x[element.field2];
                        if (!b && b != 0) b = "";
                        row.push(this.format(b, element.typeFormat, element.formatString));
                    } else if (element.data) {
                        let b = element.data;
                        if (!b && b != 0) b = "";
                        row.push(this.format(b, element.typeFormat, element.formatString));
                    }
                }
            });
            exportData.push(row);
        });
        return exportData;
    }
}