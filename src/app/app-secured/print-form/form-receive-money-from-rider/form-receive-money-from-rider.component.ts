import { Component, OnInit } from '@angular/core';
import { PrintFrormServiceInstance } from '../../../services/printTest.serviceInstace';
import { PrintHelper } from '../../../infrastructure/printHelper';
import { PaymentTypeHelper } from '../../../infrastructure/paymentType.helper';
import { environment } from '../../../../environments/environment';
import { ShipmentService } from '../../../services';
import { StatusHelper } from '../../../infrastructure/statusHelper';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'form-receive-money-from-rider',
    templateUrl: 'form-receive-money-from-rider.component.html'
})

export class FormReceiveMoneyFromRiderComponent extends PrintHelper implements OnInit {
    envir = environment;
    constructor(
        protected printFrormServiceInstance: PrintFrormServiceInstance,
        protected shipmentService: ShipmentService,
        protected sanitizer:DomSanitizer
      ) {
        super(printFrormServiceInstance, shipmentService,sanitizer);
      }

    ngOnInit() {
        const formId = PrintHelper.printReceiveMoneyFromRider;
        const typeBarcode = PrintHelper.barcodeOneData;
        this.onPrint(typeBarcode, formId);
    }
}