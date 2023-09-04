import { Component, OnInit } from '@angular/core';
import { PrintHelper } from '../../../infrastructure/printHelper';
import { PrintFrormServiceInstance } from '../../../services/printTest.serviceInstace';
import { ShipmentService } from '../../../services';
import { environment } from '../../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'form-print-truck-schedule',
  templateUrl: './form-print-truck-schedule.component.html',
})
export class FormPrintTruckScheduleComponent extends PrintHelper implements OnInit {

  constructor(
    protected printFrormServiceInstance: PrintFrormServiceInstance,
    protected shipmentService: ShipmentService,
    protected sanitizer:DomSanitizer
  ) {
    super(printFrormServiceInstance, shipmentService,sanitizer);
  }

  envir = environment;

  ngOnInit() {
    const formId = PrintHelper.printTruckSchedule;
    const typeBarcode = PrintHelper.barcodeOneData;
    this.onPrint(typeBarcode, formId);

    // this.printFrormServiceInstance.getEventSubject.subscribe(data => {
    //   this.frames = this.createFrame(formId);
    //   this.selectData = data;
    //   console.log(this.selectData);
    //   this.formId = formId;
    //   setTimeout(() => {
    //     this.print(formId);
    //   }, 0);
    // })
  }

}
