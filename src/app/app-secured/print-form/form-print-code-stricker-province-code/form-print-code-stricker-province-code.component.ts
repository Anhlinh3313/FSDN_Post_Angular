import { Component, OnInit } from '@angular/core';
import { PrintFrormServiceInstance } from '../../../services/printTest.serviceInstace';
import { PrintHelper } from '../../../infrastructure/printHelper';
import { ShipmentService } from '../../../services';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'form-print-code-stricker-province-code',
  templateUrl: './form-print-code-stricker-province-code.component.html',
  styles: []
})
export class FormPrintCodeStrickerProvinceCodeComponent extends PrintHelper implements OnInit {

  constructor(
    protected printFrormServiceInstance: PrintFrormServiceInstance,
    protected shipmentService: ShipmentService,
    protected sanitizer:DomSanitizer
  ) {
    super(printFrormServiceInstance, shipmentService,sanitizer);
  }
  ngOnInit() {
    const typeBarcode = PrintHelper.barcodeDetailShipment;
    const formId = PrintHelper.printCodeStickerDetailShipment;
    this.onPrint(typeBarcode, formId);
  }

}
