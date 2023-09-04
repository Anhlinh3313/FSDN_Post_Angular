import { Component, OnInit } from '@angular/core';
import { PrintFrormServiceInstance } from '../../../services/printTest.serviceInstace';
import { PrintHelper } from '../../../infrastructure/printHelper';
import { ListGoodsTypeHelper } from '../../../infrastructure/listGoodsType.helper';
import { ShipmentService } from '../../../services';
import { environment } from "../../../../environments/environment";
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: "form-detail-delivery",
  templateUrl: "form-detail-delivery.component.html"
})
export class FormDetailDeliveryComponent extends PrintHelper implements OnInit {
    companyName: string;
    constructor(
        protected printFrormServiceInstance: PrintFrormServiceInstance,
        protected shipmentService: ShipmentService,
        protected sanitizer:DomSanitizer
      ) {
        super(printFrormServiceInstance, shipmentService,sanitizer);
      }
    ngOnInit() {
        this.companyName = environment.namePrint;
        const typeBarcode = PrintHelper.barcodeListGoods;
        let formId = ListGoodsTypeHelper.printDetailDelivery;
        setTimeout(() => {
          this.onPrint(typeBarcode, formId);
        }, 0);
    }
}
