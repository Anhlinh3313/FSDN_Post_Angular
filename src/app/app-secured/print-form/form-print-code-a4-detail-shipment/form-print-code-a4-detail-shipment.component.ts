import { Component, OnInit } from '@angular/core';
import { PrintFrormServiceInstance } from '../../../services/printTest.serviceInstace';
import { PrintHelper } from '../../../infrastructure/printHelper';
import { ShipmentService } from '../../../services';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'form-print-code-a4-detail-shipment',
    templateUrl: 'form-print-code-a4-detail-shipment.component.html'
})

export class FormPrintCodeA4DetailShipmentComponent extends PrintHelper implements OnInit {
    constructor(
        protected printFrormServiceInstance: PrintFrormServiceInstance,
        protected shipmentService: ShipmentService,
        protected sanitizer:DomSanitizer
      ) {
        super(printFrormServiceInstance, shipmentService,sanitizer);
      }
    ngOnInit() { 
        const typeBarcode = PrintHelper.barcodeDetailShipment;
        const formId = PrintHelper.printCodeA4DetailShipment;
        this.onPrint(typeBarcode, formId);
    }
}