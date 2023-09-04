import { Component, OnInit, TemplateRef } from '@angular/core';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
//
import { Constant } from '../../../infrastructure/constant';
import { ShipmentService, UploadService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { Router } from '@angular/router';
import { PermissionService } from '../../../services/permission.service';
import { ShipmentTracking } from '../../../models/abstract/shipmentTracking.interface';

@Component({
  selector: 'app-report-delivery-image',
  templateUrl: './report-delivery-image.component.html',
  styles: []
})
export class ReportDeliveryImageComponent extends BaseComponent implements OnInit {
  typeDelivery: string;
  isSuccessDelivery: boolean;
  constructor(private modalService: BsModalService, protected messageService: MessageService,
    private shipmentService: ShipmentService,
    public permissionService: PermissionService,
    public router: Router,
    private uploadService: UploadService
  ) {
    super(messageService, permissionService, router);
  }

  parentPage: string = Constant.pages.report.name;
  currentPage: string = Constant.pages.report.children.reportDeliveryImage.name;

  // Modal
  bsModalRef: BsModalRef;

  configImageViewer = {
    wheelZoom: true
  }
  //

  // Data
  shipmentNumbers: string = "";
  lstData: ShipmentTracking[] = [];
  lstImages: any[] = [];
  //

  ngOnInit() {
  }

  //#region Search
  async search() {
    if (this.shipmentNumbers.trim()) {
      let shipmentNumbers = this.shipmentNumbers.split(" ");
      // Lấy shipment
      let promises = [];
      for (let i = 0; i < shipmentNumbers.length; i++) {
        const shipNumber = shipmentNumbers[i];
        if (shipNumber)
          promises.push(await this.shipmentService.getByShipmentNumberAsync(shipNumber));
      }
      this.lstData = await Promise.all(promises);
      this.lstData = this.lstData.filter(x => x ? true : false);
      //

      // Lấy image shipment
      let imagePromises = [];
      for (let i = 0; i < this.lstData.length; i++) {
        const ship = this.lstData[i];
        this.lstData[i].deliveryImages = await this.uploadService.getImageByShipmentId(ship.id, 2);
      }
      //
      this.shipmentNumbers = "";
    }
    else {
      this.messageService.add({
        severity: "warn",
        detail: "Vui lòng nhập ít nhất 1 mã vận đơn"
      });
    }
  }
  //#endregion

  //#region Modal Image
  async openModalImage(template: TemplateRef<any>, dataImage) {
    setTimeout(() => {
      this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-1000' });
    }, 0);
    dataImage.map(x => {
      this.lstImages.push('data:image/png;base64,' + x.fileBase64String);
    })

  }
  //#endregion
}

