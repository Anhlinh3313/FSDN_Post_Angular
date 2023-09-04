import { Component, OnInit } from '@angular/core';
import { PrintHelper } from '../../../infrastructure/printHelper';
import { PrintFrormServiceInstance } from '../../../services/printTest.serviceInstace';
import { ListGoodsTypeHelper } from '../../../infrastructure/listGoodsType.helper';
import { ShipmentService } from '../../../services';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'form-customer-payment-total-price',
  templateUrl: 'form-customer-payment-total-price.component.html',
  styles: []
})
export class FormCustomerPaymentTotalPriceComponent extends PrintHelper implements OnInit {  
  constructor(
    protected printFrormServiceInstance: PrintFrormServiceInstance,
    protected shipmentService: ShipmentService,
    protected sanitizer:DomSanitizer
) {
    super(printFrormServiceInstance, shipmentService, sanitizer);
}

  ngOnInit() {
    const typeBarcode = 0;
    const formId = ListGoodsTypeHelper.printCustomerPaymentTotalPrice;
    this.onPrint(typeBarcode, formId);
  }
}
