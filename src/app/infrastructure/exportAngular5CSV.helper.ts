import * as moment from "moment";
import { isNumeric } from "rxjs/internal-compatibility";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { getDate } from "ngx-bootstrap/chronos/utils/date-getters";

function s2ab(s: string): ArrayBuffer {
    const buf: ArrayBuffer = new ArrayBuffer(s.length);
    const view: Uint8Array = new Uint8Array(buf);
    for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}

export class ExportAnglar5CSV {
    static issueHistory: string = "issue-history";

    static ExportData(datas: any[], columns: any[], isShowFooter: boolean, isLoadDataAll, component?: any,isTwoHeader?: boolean) {
        let exportData: any[] = [];
        if (!datas || !columns) return exportData;
        let title: any[] = [];
        if (component === this.issueHistory) {
            const headerName = 'Báo Cáo Chi Tiết Giao Hàng';
            columns.map(m => title[0] = headerName);
            exportData.push(title);
        }
        if(isTwoHeader== true)
        {
            let header2: any[] = [];
            columns.map(x => { header2.push(x.fieldHeader) });
            exportData.push(header2);
        }
        let header: any[] = [];
        columns.map(x => { header.push(x.header) });
        exportData.push(header);
        
        let footer: any[] = [];
        if (isShowFooter && isLoadDataAll) {
            columns.map(m => m.isSum ? footer.push(0) : footer.push(''));
        }
        if (component === this.issueHistory) {
            columns.map(m => footer.push(''));
        }
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
                if (isShowFooter && isLoadDataAll) {
                    if (element.isSum && element.field) {
                        footer[i] = footer[i] + x[element.field];
                    }
                }
            });
            exportData.push(row);
        });
        if (datas.length && isShowFooter) {
            if (isLoadDataAll) {
                exportData.push(footer);
            } else {
                let firstData = datas[0];
                let row: any[] = [];
                columns.forEach(element => {
                    if (!element.sumField) {
                        let b = "";
                        row.push(b);
                    } else {
                        let b = firstData[element.sumField];
                        if (!b && b != 0) b = "";
                        row.push(this.format(b, element.typeFormat, element.formatString));
                    }
                });
                exportData.push(row);
            }
        }
        if (component) {
            var dataFooter = [{ isHave: true }, { isHave: true }, { isHave: true }, { isHave: true }, { isHave: true }, { isHave: true }, { isHave: true }, { isHave: true }, { isHave: true }]

            let firstData = datas[0];
            dataFooter.forEach((f, indexRow) => {
                let row: any[] = [];
                let footerTitle: any[] = [];
                let totalCODSuccess = 0;
                let countSuccess = 0;
                let countFail = 0;
                let totalCODFail = 0;
                if (indexRow === 0) {
                } else {
                    if (indexRow === 1) {
                        datas.map(m => {
                            if (m.shipmentStatusId === 12) {
                                countSuccess++;
                                totalCODSuccess += m.cod;
                            }
                            
                        });
                        columns.forEach((element, indexColumn) => {

                            if (indexColumn === 3) {
                                footerTitle.push('Tổng đơn hàng giao thành công');
                            } else if (indexColumn === 4) {
                                footerTitle.push(countSuccess);
                            } else if (indexColumn === 8) {
                                footerTitle.push('Tổng tiền đã thu');
                            } else if (indexColumn === 9) {
                                footerTitle.push(totalCODSuccess);
                            } else {
                                footerTitle.push('');
                            }
                        });
                        row = footerTitle;
                    }
                    if (indexRow === 2) {
                        datas.map(m => {
                            if (m.shipmentStatusId == 13 || m.shipmentStatusId == 62) {
                                countFail++;
                                totalCODFail += m.cod;
                            }
                        });
                        columns.forEach((element, indexColumn) => {
                            if (indexColumn === 3) {
                                footerTitle.push('Tổng đơn hàng giao không thành công');
                            } else if (indexColumn === 4) {
                                footerTitle.push(countFail);
                            } else if (indexColumn === 8) {
                                footerTitle.push('Tổng tiền chưa thu');
                            } else if (indexColumn === 9) {
                                footerTitle.push(totalCODFail);
                            } else {
                                footerTitle.push('');
                            }
                        });
                        row = footerTitle;
                    }
                    if (indexRow === 3) {
                        columns.forEach((element, indexColumn) => {
                            if (indexColumn === 11) {
                                footerTitle.push('........... , ngày … tháng … năm ' + (new Date().getFullYear()));
                            } else {
                                footerTitle.push('');
                            }
                        });
                        row = footerTitle;
                    }
                    if (indexRow === 4) {
                        columns.forEach((element, indexColumn) => {
                            if (indexColumn === 3) {
                                footerTitle.push('NVGH xác nhận');
                            } else if (indexColumn === 8) {
                                footerTitle.push('Thủ Quỹ xác nhận');
                            } else if (indexColumn === 11) {
                                footerTitle.push('GS xác nhận');
                            } else {
                                footerTitle.push('');
                            }
                        });
                        row = footerTitle;
                    }
                    if (indexRow === 8) {
                        columns.forEach((element, indexColumn) => {
                            if (indexColumn === 3) {
                                footerTitle.push(datas['fullNames']);
                            } else {
                                footerTitle.push('');
                            }
                        });
                        row = footerTitle;
                    }

                }
                exportData.push(row);
            })
        }
        return exportData;
    }

    static format(value: any, typeFormat: string, formatString: string) {
        if (typeFormat) {
            if (typeFormat == 'date') {
                if (value == '') {
                    return '';
                }
                if (formatString) {
                    return moment(value).format(formatString);
                }
            } else if (typeFormat == 'number') {
                return value
            } else if (typeFormat == 'number0') {
                return value.toLocaleString('en-us', { minimumFractionDigits: 0 })
            } else if (typeFormat == 'number3') {
                return value.toLocaleString('en-us', { minimumFractionDigits: 3 })
            } else if (typeFormat == 'stringNumber') {
                if (!isNaN(value) && isNumeric(value)) {
                    if (value[0] == '0') return `${value}`
                    else return `${value}`;
                }
            }
        }
        return value;
    }

    static exportExcelBB(dataEX: any, fileName: string) {
        let wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'binary' };
        let ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(dataEX);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        const wbout: string = XLSX.write(wb, wopts);
        saveAs(new Blob([s2ab(wbout)]), fileName);
    }

    static exportExcelAndDownload(strData, fileName, strMimeType) {
        var D = document, A = arguments, a = D.createElement("a"),
            d = A[0], n = A[1], t = A[2] || fileName;
        var newdata = "data:" + strMimeType + ";base64," + escape(strData);//strData
        //build download link:
        a.href = newdata;
        if ('download' in a) {
            a.setAttribute("download", n);
            a.innerHTML = "downloading...";
            D.body.appendChild(a);
            setTimeout(function () {
                var e = D.createEvent("MouseEvents");
                e.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null
                );
                a.dispatchEvent(e);
                D.body.removeChild(a);
            }, 66);
            return true;
        };
    }
}