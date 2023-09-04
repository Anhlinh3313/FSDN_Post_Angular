import { Component, OnInit, TemplateRef } from '@angular/core';
import { Constant } from '../../../infrastructure/constant';
import { MessageService } from 'primeng/components/common/messageservice';
import { ShipmentService, UploadService } from '../../../services';
import { Shipment } from '../../../models';
import { StatusHelper } from '../../../infrastructure/statusHelper';
import { IdModel } from '../../../view-model/id.model';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-delete-delivery-complete',
  templateUrl: './delete-delivery-complete.component.html',
  styles: []
})
export class DeleteDeliveryCompleteComponent implements OnInit {
  hub = environment;

  updateImagePath: any;
  modalTitle: string;
  shipmentNumber: number;
  deliveryCompleteStatus: number;
  returnCompleteStatus: number;
  shipmentData: Shipment;
  parentPage: string = Constant.pages.deliveryManagement.name;
  currentPage: string = Constant.pages.deliveryManagement.children.deleteDeliveryComplate.name;  

  constructor(
    private messageService: MessageService,
    private shipmentService: ShipmentService,
    private uploadService: UploadService,
    private modalService: BsModalService,
    protected bsModalRef: BsModalRef,
  ) { }

  ngOnInit() {
    this.deliveryCompleteStatus = StatusHelper.deliveryComplete;
    this.returnCompleteStatus = StatusHelper.returnComplete;
  }

  async scanShipmentNumber(txtShipmentNumber: any) {
    const shipmentNumber = txtShipmentNumber.value.trim();
    if (!shipmentNumber || shipmentNumber == "") {
      this.messageService.add({
        severity: Constant.messageStatus.warn, detail: 'Vui lòng nhập mã vận đơn!',
      });
      txtShipmentNumber.value = null;
      return;
    }   

    let includes = [];
    includes.push(Constant.classes.includes.shipment.sender);
    includes.push(Constant.classes.includes.shipment.service);
    includes.push(Constant.classes.includes.shipment.fromHub);
    includes.push(Constant.classes.includes.shipment.fromProvince);
    includes.push(Constant.classes.includes.shipment.fromDistrict);
    includes.push(Constant.classes.includes.shipment.fromWard);
    includes.push(Constant.classes.includes.shipment.paymentType);
    includes.push(Constant.classes.includes.shipment.structure);
    includes.push(Constant.classes.includes.shipment.toHub);    
    includes.push(Constant.classes.includes.shipment.toWard);
    includes.push(Constant.classes.includes.shipment.toProvince);
    includes.push(Constant.classes.includes.shipment.toDistrict);
    includes.push(Constant.classes.includes.shipment.pickUser);
    includes.push(Constant.classes.includes.shipment.deliverUser);
    includes.push(Constant.classes.includes.shipment.shipmentStatus);
    
    const shipment = await this.shipmentService.trackingShortAsync(shipmentNumber, includes);
    if (shipment) {
      this.shipmentData = shipment;
    } else {
      this.refresh();
    }
  }

  async openModel(template: TemplateRef<any>) {
    this.modalTitle = "Hình ảnh";
    const res = await this.uploadService.getImageByPathAsync(this.shipmentData.deliveryImagePath);
    if (res) {
      if (res.data["fileBase64String"]) {
        this.updateImagePath = res;
        this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
      }      
    }
  }

  async clickSaveChange() {
    let obj = new IdModel();
    obj.id = this.shipmentData.id;
    const data = await this.shipmentService.cancelDeliveryCompleteAsync(obj);
    if (data) {
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Đã hủy vđ giao thành công"
      });
      this.refresh();
    }
  }

  refresh() {
    this.shipmentData = null;
    this.shipmentNumber = null;
  }
}
