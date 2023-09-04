import { Component, OnInit } from '@angular/core';
import { PrintHelper } from '../../../infrastructure/printHelper';
import { PrintFrormServiceInstance } from '../../../services/printTest.serviceInstace';
import { environment } from '../../../../environments/environment';
import { GeneralInfoService } from '../../../services/generalInfo.service';
import { ShipmentService } from '../../../services';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'form-print-bill',
  templateUrl: './form-print-bill.component.html',
  styles: []
})
export class FormPrintBillComponent extends PrintHelper implements OnInit {

  constructor(
    protected printFrormServiceInstance: PrintFrormServiceInstance,
    protected shipmentService: ShipmentService,
    protected sanitizer:DomSanitizer
  ) {
    super(printFrormServiceInstance, shipmentService,sanitizer);
  }

  name = environment.namePrint;

  ngOnInit() {
    const typeBarcode = PrintHelper.barcodeMultiBill;
    const formId = PrintHelper.printMultiBill;
    this.onPrint(typeBarcode, formId);
  }

}
