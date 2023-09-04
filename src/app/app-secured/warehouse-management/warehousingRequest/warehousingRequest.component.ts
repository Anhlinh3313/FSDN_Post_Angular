import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
//
import { Constant } from "../../../infrastructure/constant";
import {
  RequestShipmentService,
  UserService,
  ShipmentStatusService,
  ReasonService
} from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { BaseComponent } from "../../../shared/components/baseComponent";
import { StatusHelper } from "../../../infrastructure/statusHelper";
import {
  KeyValuesViewModel,
  ListUpdateStatusViewModel,
  LadingScheduleHistoryViewModel,
  DateRangeFromTo
} from "../../../view-model/index";
import { RequestShipment } from "../../../models/RequestShipment.model";
import { environment } from "../../../../environments/environment";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
//////////////
declare var jQuery: any;

@Component({
  selector: "app-warehousingRequest",
  templateUrl: "warehousingRequest.component.html",
  styles: [
    `    
     
  `
  ]
})
export class WarehousingRequestComponent extends BaseComponent implements OnInit {
  txtFilterGb: any;
  constructor(
    private modalService: BsModalService,
    protected messageService: MessageService,
    private requestShipmentService: RequestShipmentService,
    private reasonService: ReasonService,
    private shipmentStatusService: ShipmentStatusService,
    private userService: UserService, public permissionService: PermissionService, public router: Router) {
      super(messageService, permissionService, router);
  }

  @ViewChild("txtAssignRequest")
  txtAssignRequestRef: ElementRef;

  unit = environment.unit;
  
  parentPage: string = Constant.pages.warehouse.name;
  currentPage: string = Constant.pages.warehouse.children.warehousingRequest.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  //
  data: RequestShipment;

  ngOnInit() {
    this.initData();
  }

  initData() {
  }

  scaneShipmentNumber(txtAssignRequest) {
    if (!txtAssignRequest.value) {
      this.messageService.add({
        severity: Constant.messageStatus.warn, detail: 'Vui lòng nhập mã bill tổng!',
      })
      return;
    }
    //
    let includes = [];
    includes.push(Constant.classes.includes.shipment.fromHub);
    includes.push(Constant.classes.includes.shipment.fromHubRouting);
    includes.push(Constant.classes.includes.shipment.toHub);
    includes.push(Constant.classes.includes.shipment.toHubRouting);
    includes.push(Constant.classes.includes.shipment.currentEmp);
    includes.push(Constant.classes.includes.shipment.shipmentStatus);
    includes.push(Constant.classes.includes.shipment.pickUser);
    includes.push(Constant.classes.includes.shipment.fromProvince);
    includes.push(Constant.classes.includes.shipment.toProvince);
    includes.push(Constant.classes.includes.shipment.fromDistrict);
    includes.push(Constant.classes.includes.shipment.toDistrict);
    includes.push(Constant.classes.includes.shipment.sender);
    includes.push(Constant.classes.includes.shipment.paymentType);
    includes.push(Constant.classes.includes.listGoods.createdByHub);
    this.requestShipmentService.trackingShort(txtAssignRequest.value, includes).subscribe(
      x => {
        if (!super.isValidResponse(x)) {
          txtAssignRequest.value = null;
          return;
        }
        this.data = x.data as RequestShipment;
        // console.log(this.data);
        if(this.data.shipmentStatusId == StatusHelper.pickupComplete){
          if(this.data.calWeightAccept==0) this.data.calWeightAccept = this.data.calWeight;
          if(this.data.countShipmentAccept==0) this.data.countShipmentAccept = this.data.countShipment;
          if(this.data.weightAccept==0) this.data.weightAccept = this.data.weight;
          if(this.data.totalBoxAccept==0) this.data.totalBoxAccept = this.data.totalBox;
        }
      }
    )
  }
  clickSaveChange(){
    if (!this.data) {
      this.messageService.add({
        severity: Constant.messageStatus.warn, detail: 'Vui lòng nhập mã bill tổng!',
      })
      return;
    }
    if(this.data.shipmentStatusId!=StatusHelper.pickupComplete){
      this.messageService.add({
        severity: Constant.messageStatus.warn, detail: 'Trạng thái bill tổng không được phép nhập kho!',
      })
      return;
    }
    if(this.data.countShipmentAccept<=0){
      this.messageService.add({
        severity: Constant.messageStatus.warn, detail: 'Số vận đơn xác nhận không hợp lệ!',
      })
      return;
    }
   if(this.data.weightAccept<=0){
    this.messageService.add({
      severity: Constant.messageStatus.warn, detail: 'Trọng lượng xác nhận không hợp lệ!',
    })
    return;
   }
   if(this.data.totalBoxAccept<=0){
    this.messageService.add({
      severity: Constant.messageStatus.warn, detail: 'Số kiện xác nhận không hợp lệ!',
    })
    return;
   }
   if(this.data.totalBoxAccept<this.data.countShipmentAccept){
    this.messageService.add({
      severity: Constant.messageStatus.warn, detail: 'Số kiện xác nhận phải lớn hơn hoặc bằng số vận đơn!',
    })
    return;
   }
   if(!this.data.calWeightAccept){
    this.data.calWeightAccept = 0;
   }
   this.requestShipmentService.acceptCompleteByWarehousing(this.data).subscribe(
     x=>{
      if (!super.isValidResponse(x)) {
        return;
      }
      this.messageService.add({
        severity: Constant.messageStatus.success, detail: 'Xác nhận nhập kho bill tổng thành công!',
      })
      this.data = null;
      this.txtAssignRequestRef.nativeElement.value = "";
      this.txtAssignRequestRef.nativeElement.focus();
     }
   )
  }
  refresh(){
    this.data = null;
    this.txtAssignRequestRef.nativeElement.value = "";
    this.txtAssignRequestRef.nativeElement.focus();
  }

  public eventLog = "";

}
