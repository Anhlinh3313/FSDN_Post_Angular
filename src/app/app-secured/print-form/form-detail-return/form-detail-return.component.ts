import { Component, OnInit } from '@angular/core';
import { PrintFrormServiceInstance } from '../../../services/printTest.serviceInstace';
import { PrintHelper } from '../../../infrastructure/printHelper';
import { ListGoodsTypeHelper } from '../../../infrastructure/listGoodsType.helper';
import { ShipmentService } from '../../../services';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'form-detail-return',
    templateUrl: 'form-detail-return.component.html'
})

export class FormDetailReturnComponent extends PrintHelper implements OnInit {
    constructor(
        protected printFrormServiceInstance: PrintFrormServiceInstance,
        protected shipmentService: ShipmentService,
        protected sanitizer:DomSanitizer
      ) {
        super(printFrormServiceInstance, shipmentService,sanitizer);
      }
    ngOnInit() { 
        const typeBarcode = PrintHelper.barcodeListGoods;
        const formId = ListGoodsTypeHelper.printDetailReturn;
        this.onPrint(typeBarcode, formId);
    }
}