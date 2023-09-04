import { Component, OnInit } from '@angular/core';
import { PrintFrormServiceInstance } from '../../../services/printTest.serviceInstace';
import { PrintHelper } from '../../../infrastructure/printHelper';
import { ShipmentService, AuthService } from '../../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { ConvertNumberToText } from '../../../infrastructure/convertNumberToText';

@Component({
  selector: 'form-receipts',
  templateUrl: './form-receipts.component.html',
  styles: []
})
export class FormReceiptsComponent extends PrintHelper implements OnInit {
  unit: string;
  companyName: string;
  constructor(
    protected printFrormServiceInstance: PrintFrormServiceInstance,
    protected shipmentService: ShipmentService,
    protected sanitizer: DomSanitizer,
    private authService: AuthService
  ) {
    super(printFrormServiceInstance, shipmentService, sanitizer);
  }

  convertNumberToText: ConvertNumberToText = new ConvertNumberToText();
  userName: string;
  currentFullName: string;

  ngOnInit() {
    this.userName = this.authService.getUserName();
    this.currentFullName = this.authService.getFullName();
    let formId = PrintHelper.printReceipts;
    setTimeout(() => {
      this.onPrint(null, formId);
    }, 0);
  }
}
