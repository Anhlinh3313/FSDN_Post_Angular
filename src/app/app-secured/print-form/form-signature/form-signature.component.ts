import { Component, OnInit } from '@angular/core';
import { PrintHelper } from '../../../infrastructure/printHelper';
import { PrintFrormServiceInstance } from '../../../services/printTest.serviceInstace';
import { environment } from '../../../../environments/environment';
import { ShipmentService } from '../../../services';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'form-signature',
  templateUrl: './form-signature.component.html',
  styles: []
})
export class FormSignatureComponent extends PrintHelper implements OnInit {
  constructor(
    protected printFrormServiceInstance: PrintFrormServiceInstance,
    protected shipmentService: ShipmentService,
    protected sanitizer: DomSanitizer
  ) {
    super(printFrormServiceInstance, shipmentService, sanitizer);
  }


  envir = environment;

  ngOnInit() {
    const typeBarcode = PrintHelper.barcodeListGoods;
    let formId = PrintHelper.printSignature;
    setTimeout(() => {
      this.onPrint(typeBarcode, formId);
    }, 0);
  }

}
