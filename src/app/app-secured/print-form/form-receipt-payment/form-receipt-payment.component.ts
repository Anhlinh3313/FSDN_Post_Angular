import { Component, OnInit } from '@angular/core';
import { PrintFrormServiceInstance } from '../../../services/printTest.serviceInstace';
import { PrintHelper } from '../../../infrastructure/printHelper';
import { ListGoodsTypeHelper } from '../../../infrastructure/listGoodsType.helper';
import { ShipmentService, AuthService } from '../../../services';
import { environment } from "../../../../environments/environment";
import { DomSanitizer } from '@angular/platform-browser';
import { ConvertNumberToText } from '../../../infrastructure/convertNumberToText';

@Component({
  selector: 'form-receipt-payment',
  templateUrl: './form-receipt-payment.component.html',
  styles: []
})
export class FormReceiptPaymentComponent extends PrintHelper implements OnInit {
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

  ngOnInit() {
    this.userName = this.authService.getUserName();
    let formId = PrintHelper.printReceiptPayment;
    setTimeout(() => {
      this.onPrint(null, formId);
    }, 0);
  }
}

