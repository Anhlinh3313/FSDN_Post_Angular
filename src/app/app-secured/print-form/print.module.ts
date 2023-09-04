import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedSecuredModule } from '../shared/shared-secured.module';

import { PopoverModule } from 'ngx-bootstrap/popover';
import { DropdownModule } from 'primeng/primeng';
import { FormDetailDeliveryComponent } from './form-detail-delivery/form-detail-delivery.component';
import { FormDetailReturnComponent } from './form-detail-return/form-detail-return.component';
import { FormDetailTransferComponent } from './form-detail-transfer/form-detail-transfer.component';
import { FormReceiptTransferComponent } from './form-receipt-transfer/form-receipt-transfer.component';
import { PrintFrormServiceInstance } from '../../services/printTest.serviceInstace';
import { FormPrintCodeCreateShipmentComponent } from './form-print-code-create-shipment/form-print-code-create-shipment.component';
import { FormCreateShipmentComponent } from './form-create-shipment/form-create-shipment.component';
import { FormPrintCodeStickerDetailShipmentComponent } from './form-print-code-sticker-detail-shipment/form-print-code-sticker-detail-shipment.component';
import { FormPrintCodeA4DetailShipmentComponent } from './form-print-code-a4-detail-shipment/form-print-code-a4-detail-shipment.component';
import { FormPrintCreateMultiBoxComponent } from './form-print-create-multi-box/form-print-create-multi-box.component';
import { FormPrintBillComponent } from './form-print-bill/form-print-bill.component';
import { DateFormatPipe } from '../../pipes/dateFormat.pipe';
import { DateFormatNoTimePipe } from '../../pipes/dateFormatNoTime.pipes';
import { FormCustomerPaymentTotalPriceComponent } from './form-customer-payment-total-price/form-customer-payment-total-price.component';
import { FormSignatureComponent } from './form-signature/form-signature.component';
import { FormPrintCodeStrickerProvinceCodeComponent } from './form-print-code-stricker-province-code/form-print-code-stricker-province-code.component';
import { FormPrintTruckScheduleComponent } from './form-print-truck-schedule/form-print-truck-schedule.component';
import { FormReceiptsComponent } from './form-receipts/form-receipts.component';
import { FormReceiptPaymentComponent } from './form-receipt-payment/form-receipt-payment.component';
import { TimeFormatNoDatePipes } from '../../pipes/timeFormatNoDate.pipes';
import { FormReceiveMoneyFromRiderComponent } from './form-receive-money-from-rider/form-receive-money-from-rider.component';
import { FormReportDeliveryComponent } from './form-report-delivery/form-report-delivery.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SharedSecuredModule,
    PopoverModule.forRoot(),
    DropdownModule,
  ],
  declarations: [
    FormCreateShipmentComponent,
    FormDetailDeliveryComponent,
    FormDetailReturnComponent,
    FormDetailTransferComponent,
    FormReceiptTransferComponent,
    FormPrintCodeA4DetailShipmentComponent,
    FormPrintCodeStickerDetailShipmentComponent,
    FormPrintCodeCreateShipmentComponent,
    FormPrintCreateMultiBoxComponent,
    FormPrintBillComponent,
    DateFormatPipe,
    DateFormatNoTimePipe,
    TimeFormatNoDatePipes,
    FormCustomerPaymentTotalPriceComponent,
    FormSignatureComponent,
    FormPrintCodeStrickerProvinceCodeComponent,
    FormPrintTruckScheduleComponent,
    FormReceiptsComponent,
    FormReceiptPaymentComponent,
    FormReceiveMoneyFromRiderComponent,
    FormReportDeliveryComponent,
  ],
  exports:  [
    FormCreateShipmentComponent,
    FormDetailDeliveryComponent,
    FormDetailReturnComponent,
    FormDetailTransferComponent,
    FormReceiptTransferComponent,
    FormPrintCodeA4DetailShipmentComponent,
    FormPrintCodeStickerDetailShipmentComponent,
    FormPrintCodeCreateShipmentComponent,
    FormPrintCreateMultiBoxComponent,
    FormPrintBillComponent,
    DateFormatPipe,
    DateFormatNoTimePipe,
    TimeFormatNoDatePipes,
    FormCustomerPaymentTotalPriceComponent,
    FormSignatureComponent,
    FormPrintCodeStrickerProvinceCodeComponent,
    FormPrintTruckScheduleComponent,
    FormReceiptsComponent,
    FormReceiptPaymentComponent,
    FormReceiveMoneyFromRiderComponent,
    FormReportDeliveryComponent,
  ],
  providers: [
    PrintFrormServiceInstance
  ],
})

export class PrintModule { }
