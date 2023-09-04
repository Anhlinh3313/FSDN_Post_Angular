import { Component, OnInit } from '@angular/core';
import { PrintFrormServiceInstance } from '../../../services/printTest.serviceInstace';
import { PrintHelper } from '../../../infrastructure/printHelper';
import { ListGoodsTypeHelper } from '../../../infrastructure/listGoodsType.helper';
import { ShipmentService } from '../../../services';
import { environment } from "../../../../environments/environment";
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'form-detail-transfer',
    templateUrl: 'form-detail-transfer.component.html'
})

export class FormDetailTransferComponent extends PrintHelper implements OnInit {
    unit: string;
    pack: string;;
    companyName: string;
    constructor(
        protected printFrormServiceInstance: PrintFrormServiceInstance,
        protected shipmentService: ShipmentService,
        protected sanitizer: DomSanitizer
    ) {
        super(printFrormServiceInstance, shipmentService, sanitizer);
    }
    ngOnInit() {
        this.companyName = environment.namePrint;
        this.unit = environment.unit;
        this.pack = environment.pack;
        const typeBarcode = PrintHelper.barcodeListGoods;
        let formId = ListGoodsTypeHelper.printDetailTranfer;
        setTimeout(() => {
            this.onPrint(typeBarcode, formId);
        }, 0);
    }
}