import { Component, OnInit } from '@angular/core';
import { PrintFrormServiceInstance } from '../../../services/printTest.serviceInstace';
import { PrintHelper } from '../../../infrastructure/printHelper';
import { PaymentTypeHelper } from '../../../infrastructure/paymentType.helper';
import { environment } from '../../../../environments/environment';
import { ShipmentService } from '../../../services';
import { StatusHelper } from '../../../infrastructure/statusHelper';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'form-create-shipment',
    templateUrl: 'form-create-shipment.component.html'
})

export class FormCreateShipmentComponent extends PrintHelper implements OnInit {
    paymentType: number = PaymentTypeHelper.NNTTN;
    unit = environment.unit;
    namePrint = environment.namePrint;
    isInTong = environment.isInTong;
    cancel = StatusHelper.cancel;
    constructor(
        protected printFrormServiceInstance: PrintFrormServiceInstance,
        protected shipmentService: ShipmentService, 
        protected sanitizer:DomSanitizer
    ) {
        super(printFrormServiceInstance, shipmentService, sanitizer);
    }
    ngOnInit() {
        const typeBarcode = PrintHelper.barcodeCreateMultiShipment;
        const formId = PrintHelper.printCreateMultiShipment;
        this.onPrintFormDynamic(typeBarcode, formId);
    }
}