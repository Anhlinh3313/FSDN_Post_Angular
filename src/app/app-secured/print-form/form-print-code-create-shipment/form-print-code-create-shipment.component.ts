import { Component, OnInit } from '@angular/core';
import { PrintFrormServiceInstance } from '../../../services/printTest.serviceInstace';
import { PrintHelper } from '../../../infrastructure/printHelper';
import { ListGoodsTypeHelper } from '../../../infrastructure/listGoodsType.helper';
import { ShipmentService } from '../../../services';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'form-print-code-create-shipment',
    templateUrl: 'form-print-code-create-shipment.component.html'
})

export class FormPrintCodeCreateShipmentComponent extends PrintHelper implements OnInit {
    constructor(
        protected printFrormServiceInstance: PrintFrormServiceInstance,
        protected shipmentService: ShipmentService,
        protected sanitizer: DomSanitizer
    ) {
        super(printFrormServiceInstance, shipmentService, sanitizer);
    }
    ngOnInit() {
        const typeBarcode = PrintHelper.barcodeCreateMultiShipment;
        const formId = PrintHelper.printCodeCreateShipment;
        this.onPrint(typeBarcode, formId);
    }
}