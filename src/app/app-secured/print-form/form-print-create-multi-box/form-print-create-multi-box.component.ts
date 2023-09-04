import { Component, OnInit } from '@angular/core';
import { PrintHelper } from '../../../infrastructure/printHelper';
import { PrintFrormServiceInstance } from '../../../services/printTest.serviceInstace';
import { ShipmentService } from '../../../services';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'form-print-create-multi-box',
  templateUrl: './form-print-create-multi-box.component.html',
  styles: []
})
export class FormPrintCreateMultiBoxComponent extends PrintHelper implements OnInit {

  constructor(
    protected printFrormServiceInstance: PrintFrormServiceInstance,
    protected shipmentService: ShipmentService,
    protected sanitizer:DomSanitizer
  ) {
    super(printFrormServiceInstance, shipmentService,sanitizer);
  }

  ngOnInit() {
    const typeBarcode = PrintHelper.barcodeCreateMultiBox;
    const formId = PrintHelper.printCreateMultiBox;
    this.onPrint(typeBarcode, formId);
  }

}
