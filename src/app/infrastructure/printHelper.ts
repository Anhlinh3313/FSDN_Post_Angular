import * as JsBarcode from "jsbarcode";

import { PrintFrormServiceInstance } from "../services/printTest.serviceInstace";
import { environment } from "../../environments/environment";
import { PrintTypeShipment } from "./enums/printTypeShipment.enum";
import { ShipmentService } from "../services";
import { DataPrint } from "../models";
import { DomSanitizer } from '@angular/platform-browser';
export class PrintHelper {
    static CompanyName = "DSC";
    static Hotline = "Hotline: 0943757484";
    static CenterHubAddress = "HCM";
    static Website = "www.dsc.vn";

    //
    static printCodeA4DetailShipment: string = "print-code-a4-detail-shipment";
    static printCodeStickerDetailShipment: string = "print-code-sticker-detail-shipment";
    static printCodeCreateShipment: string = "print-code-create-shipment";
    static printCreateMultiShipment: string = "print-create-multi-shipment";
    static printCreateMultiBox: string = "print-create-multi-box";
    static printMultiBill: string = "print-multi-bill";
    static printSignature: string = "print-signature";
    static printTruckSchedule: string = "print-truck-schedule";
    static printReceipts: string = "print-receipts";
    static printReceiptPayment: string = "print-receipt-payment";
    static printReceiveMoneyFromRider: string = "print-receive-money-from-rider";    
    static printreportdelivery: string = "print-report-delivery";


    //
    static barcodeListGoods: number = 1;
    static barcodeDetailShipment: number = 2;
    static barcodeCreateShipment: number = 3;
    static barcodeCreateMultiShipment: number = 4;
    static barcodeCreateMultiBox: number = 5;
    static barcodeMultiBill: number = 6;
    static barcodeOneData: number = 7;

    //
    frames: any;
    formId: string = "";
    selectData: any = [];
    item: any;
    formPrintA5: any = "";
    pageBreak: string = `<div class="pagebreak"></div>`;
    logo: string = environment.urlLogo;
    heightBarcode: number = environment.heightBarcode;
    heightQACode: number = environment.heightQRCode;

    constructor(
        protected printFrormServiceInstance: PrintFrormServiceInstance,
        protected shipmentService: ShipmentService,
        protected sanitizer: DomSanitizer
    ) { }

    static printBarcodeListGoods(shipments: any, height: number) {
        JsBarcode("#listGoods", shipments.listGoods, {
            format: "CODE128",
            height: height,
            width: 2,
            displayValue: false
        });

        if (shipments.isPrintBareCode) {
            shipments.forEach((item, index) => {
                JsBarcode(
                    "#" + shipments[index].fakeId,
                    shipments[index].shipmentNumber,
                    {
                        format: "CODE128",
                        height: 20,
                        width: 1,
                        displayValue: false,
                        marginTop: 2
                    }
                );
            });
        }
    }

    static printBarcodeOneData(data: any, height: number) {
        JsBarcode(
            "#" + data.fakeId,
            data.shipmentNumber,
            {
                format: "CODE128",
                height: height,
                width: 1,
                displayValue: false
            }
        );
    }

    static printBarcodeDetailShipment(shipments: any, height: number) {
        shipments.map((item, index) => {
            JsBarcode(
                "#" + shipments[index].fakeId,
                shipments[index].shipmentNumber,
                {
                    format: "CODE128",
                    height: height,
                    width: 1,
                    displayValue: false
                }
            );
        });
    }

    static printBarcodeDetailPackage(packages: any, height: number) {
        packages.map((item, index) => {
            JsBarcode(
                "#" + packages[index].fakeId,
                packages[index].packageCode,
                {
                    format: "CODE128",
                    height: height,
                    width: 1,
                    displayValue: false
                }
            );
        });
    }

    static printBarcodeCreateMultiShipment(shipments: any, height: number, heightQACode: number) {
        shipments.map((item, index) => {            
            JsBarcode(
                "#" + shipments[index].fakeId,
                shipments[index].shipmentNumber,
                {
                    format: "CODE128",
                    height: height,
                    width: 1,
                    displayValue: false
                }
            );
            //
            var patQR = document.getElementById(`QR${shipments[index].fakeId}`);
            if (patQR !== null) {
                var qrcode = new QRCode(patQR, {
                    width: heightQACode,
                    height: heightQACode
                });
                qrcode.makeCode(shipments[index].shipmentNumber);
            }
        });
    }

    static printBarcodeMultiBox(shipments: any, height: number) {
        shipments.map((item, index) => {
            JsBarcode(
                "#" + shipments[index].code,
                shipments[index].code,
                {
                    format: "CODE128",
                    height: height,
                    width: 1,
                    displayValue: false
                }
            );
        });
    }

    static printBarcodeMultiBill(shipments: any, height: number) {
        // console.log(shipments);
        shipments.map((item, index) => {
            JsBarcode(
                "#" + shipments[index].fakeId,
                shipments[index].shipmentNumber,
                {
                    format: "CODE128",
                    height: height,
                    width: 1,
                    displayValue: false,
                    marginTop: 25,
                }
            );
        });
    }

    async onPrint(typeBarcode: number, formId: string) {
        this.printFrormServiceInstance.getEventSubject.subscribe(async data => {
            // this.frames = await this.createFrame(formId);
            this.frames = this.createPopupWin();
            this.selectData = data;
            if (this.selectData) {
                setTimeout(() => {
                    if (typeBarcode === PrintHelper.barcodeListGoods) {
                        PrintHelper.printBarcodeListGoods(this.selectData, this.heightBarcode);
                        if (this.selectData.selectedPackage && this.selectData.selectedPackage.length) {
                            PrintHelper.printBarcodeDetailPackage(this.selectData.selectedPackage, this.heightBarcode);
                        }
                    }
                    else if (typeBarcode === PrintHelper.barcodeDetailShipment) {
                        PrintHelper.printBarcodeDetailShipment(this.selectData, this.heightBarcode);
                        if (this.selectData.selectedPackage && this.selectData.selectedPackage.length) {
                            PrintHelper.printBarcodeDetailPackage(this.selectData.selectedPackage, this.heightBarcode);
                        }
                    }
                    else if (typeBarcode === PrintHelper.barcodeCreateMultiShipment) {
                        if (this.selectData.CompanyName)
                            PrintHelper.printBarcodeCreateMultiShipment(this.selectData, this.heightBarcode, this.heightQACode);
                    }
                    else if (typeBarcode === PrintHelper.barcodeCreateMultiBox) {
                        PrintHelper.printBarcodeMultiBox(this.selectData, this.heightBarcode);
                    }
                    else if (typeBarcode === PrintHelper.barcodeMultiBill) {
                        PrintHelper.printBarcodeMultiBill(this.selectData, this.heightBarcode);
                    }
                    else if (typeBarcode === PrintHelper.barcodeOneData) {
                        PrintHelper.printBarcodeOneData(this.selectData, this.heightBarcode);
                    }
                }, 500);
                this.formId = formId;
                setTimeout(async () => {
                    this.print(this.formId);
                    //log print shipment type PrintDetail
                    let shipmentIds: number[] = this.selectData.map(x => x.id);
                    let typeRePrintId: number = 0;
                    if (formId === PrintHelper.printCodeA4DetailShipment) {
                        typeRePrintId = PrintTypeShipment.PrintCodeA4;
                    }
                    else if (formId === PrintHelper.printCodeStickerDetailShipment) {
                        //typeRePrintId = PrintTypeShipment.PrintSticker;
                    }
                    else if (formId === PrintHelper.printCreateMultiBox) {
                        typeRePrintId = PrintTypeShipment.PrintBox;
                        shipmentIds = Array.from(new Set(this.selectData.map(x => x.shipmentId) as number[]));
                    }
                    else if (formId === PrintHelper.printReceiveMoneyFromRider) {
                        shipmentIds = Array.from(new Set(this.selectData.map(x => x.shipmentId) as number[]));
                    }
                    else if (formId === PrintHelper.printreportdelivery) {
                        shipmentIds = Array.from(new Set(this.selectData.map(x => x.id) as number[]));
                    }
                    else if (formId === PrintHelper.printMultiBill) {
                        typeRePrintId = PrintTypeShipment.PrintPickup;
                    }
                    else if (formId === PrintHelper.printCodeCreateShipment) {
                        typeRePrintId = PrintTypeShipment.PrintShipmentNumber;
                    }
                    else {
                        if (!data.noPrintShipment) {
                            if (data.noPrintAdviceOfDelivery || formId === PrintHelper.printCreateMultiShipment) {
                                typeRePrintId = PrintTypeShipment.PrintDetail;
                            }
                            else {
                                typeRePrintId = PrintTypeShipment.PrintBillAndAdviceOfDelivery;
                            }
                        }
                        else {
                            if (!data.noPrintAdviceOfDelivery) {
                                typeRePrintId = PrintTypeShipment.PrintAdviceOfDelivery;
                            }
                        }
                    }
                    if (typeRePrintId) {
                        await this.shipmentService.printShipmentsAsync(shipmentIds, typeRePrintId);
                    }
                }, 500);
            }
        });
    }

    async  onPrintFormDynamic(typeBarcode: number, formId: string) {
        this.printFrormServiceInstance.getEventSubject.subscribe(async data => {
            this.formPrintA5 = '';
            this.frames = await this.createFrame(formId);
            // this.frames = this.createPopupWin();
            let dataPrint = data as DataPrint;
            this.selectData = dataPrint.dataPrints;
            this.selectData.map((f, index) => {
                this.item = f;
                let templateValue = dataPrint.formPrint.replace(/{{([^}}]+)?}}/g, ($1, $2) =>
                    $2.split('.').reduce((p, c) => p ? ((p[c] || p[c] == 0) ? p[c] : '') : '', this));
                templateValue = templateValue.replace("BBQRCODE", `<span id="QR${this.item.fakeId}"></span>`);
                this.formPrintA5 += templateValue.replace("BBBARCODE", `<img id="${this.item.fakeId}" />`);
                if (index < this.selectData.length - 1) this.formPrintA5 += this.pageBreak;
            })
            this.formPrintA5 = this.sanitizer.bypassSecurityTrustHtml(this.formPrintA5);
            if (this.selectData) {
                setTimeout(() => {
                    if (typeBarcode === PrintHelper.barcodeListGoods) {
                        PrintHelper.printBarcodeListGoods(this.selectData, this.heightBarcode);
                    } else if (typeBarcode === PrintHelper.barcodeDetailShipment) {
                        PrintHelper.printBarcodeDetailShipment(this.selectData, this.heightBarcode);
                    } else if (typeBarcode === PrintHelper.barcodeCreateMultiShipment) {
                        PrintHelper.printBarcodeCreateMultiShipment(this.selectData, this.heightBarcode, this.heightQACode);
                    } else if (typeBarcode === PrintHelper.barcodeCreateMultiBox) {
                        PrintHelper.printBarcodeMultiBox(this.selectData, this.heightBarcode);
                    } else if (typeBarcode === PrintHelper.barcodeMultiBill) {
                        PrintHelper.printBarcodeMultiBill(this.selectData, this.heightBarcode);
                    } else if (typeBarcode === PrintHelper.barcodeOneData) {
                        PrintHelper.printBarcodeOneData(this.selectData, this.heightBarcode);
                    }
                }, 100);
                this.formId = formId;
                setTimeout(async () => {
                    this.print(this.formId);
                    //log print shipment type PrintDetail
                    let shipmentIds: number[] = this.selectData.map(x => x.id);
                    let typeRePrintId: number = 0;
                    if (formId === PrintHelper.printCodeA4DetailShipment) {
                        typeRePrintId = PrintTypeShipment.PrintCodeA4;
                    } else if (formId === PrintHelper.printCodeStickerDetailShipment) {
                        typeRePrintId = PrintTypeShipment.PrintSticker;
                    } else if (formId === PrintHelper.printCreateMultiBox) {
                        typeRePrintId = PrintTypeShipment.PrintBox;
                        shipmentIds = Array.from(new Set(this.selectData.map(x => x.shipmentId) as number[]));
                    } else if (formId === PrintHelper.printMultiBill) {
                        typeRePrintId = PrintTypeShipment.PrintPickup;
                    } else if (formId === PrintHelper.printCodeCreateShipment) {
                        typeRePrintId = PrintTypeShipment.PrintShipmentNumber;
                    } else {
                        if (!data.noPrintShipment) {
                            if (data.noPrintAdviceOfDelivery || formId === PrintHelper.printCreateMultiShipment) {
                                typeRePrintId = PrintTypeShipment.PrintDetail;
                            } else {
                                typeRePrintId = PrintTypeShipment.PrintBillAndAdviceOfDelivery;
                            }
                        } else {
                            if (!data.noPrintAdviceOfDelivery) {
                                typeRePrintId = PrintTypeShipment.PrintAdviceOfDelivery;
                            }
                        }
                    }
                    if (typeRePrintId) {
                        await this.shipmentService.printShipmentsAsync(shipmentIds, typeRePrintId);
                    }
                }, 500);
            }
        });
    }

    createFrame(iframeName: string): Window {
        return window.frames[iframeName];
    }

    createPopupWin(): Window {
        return window.open(
            "",
            "_blank",
            "top=0,left=0,height=100%,width=auto,time=no"
        );
    }

    print(id: string) {
        let printContents;
        if (document.getElementById(id)) {
            printContents = document.getElementById(id).innerHTML;
        }
        this.frames.document.write("<head>");
        this.frames.document.write(`<link rel="stylesheet" href="/assets/css/layout.css" media="screen,print">
                                    <link rel="stylesheet" href="/assets/css/print.css" media="screen,print">`);
        this.frames.document.write("<style>@page { size: auto;  margin: 0mm; }</style>");
        this.frames.document.write("</head>");
        this.frames.document.write("<body onload='window.print()'");
        this.frames.document.write("<div class='reward-body'>" + printContents + "</div>");
        this.frames.document.write("</body>");
        this.frames.document.write(`<script type="text/javascript">
                                        (function () {

                                            // var beforePrint = function (e) {
                                            //     console.log(e);
                                            // };
                                    
                                            // var afterPrint = function (e) {
                                            //     console.log(e);
                                            // };
                                    
                                            // if (window.matchMedia) {
                                            //     var mediaQueryList = window.matchMedia('print');
                                    
                                            //     mediaQueryList.addListener(function (mql) {
                                            //         //alert($(mediaQueryList).html());
                                            //         if (mql.matches) {
                                            //             beforePrint();
                                            //         } else {
                                            //             afterPrint();
                                            //         }
                                            //     });
                                            // }
                                    
                                            // window.onbeforeprint = beforePrint;
                                            // window.onafterprint = afterPrint;
                                    
                                        }());
                                    </script>`);
        // console.log(this.frames);
        this.frames.document.close();
        this.frames.focus();
        setTimeout(() => {
            this.frames.close();
        }, 500);
    }

    ngOnDestroy() {
        this.printFrormServiceInstance.resetEventObserver();
    }
}