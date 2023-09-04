import {
  Component, 
  OnInit, 
}from "@angular/core"; 
import {MessageService }from "primeng/components/common/messageservice"; 
import {BaseComponent }from "../../../shared/components/baseComponent"; 
import {PermissionService }from "../../../services/permission.service"; 
import {Router }from "@angular/router"; 
import {Constant }from "../../../infrastructure/constant"; 
import {ShipmentService }from "../../../services"; 
import {Shipment }from "../../../models"; 
import { SearchDate } from "../../../infrastructure/searchDate.helper";

@Component( {
  selector:"app-shipment-prioritize", 
  templateUrl:"shipment-prioritize.component.html", 
  styles:[]
})
export class ShipmentPrioritizeComponent extends BaseComponent implements OnInit {
  parentPage:string = Constant.pages.shipment.name; 
  currentPage:string = Constant.pages.shipment.children.shipmentPrioritize.name; 
  //
  isActiveTabOne:boolean = true; 
  isActiveTabTwo:boolean = false; 
  //
  titleTabOne:string; 
  titleTabTwo:string; 
  //
  inputShipmentNumber:string; 
  inputNote:string; 
  xShipment:Shipment = new Shipment();
  //
  deliveryDate: Date;
  //
  constructor(
    protected shipmentService:ShipmentService, 
    protected messageService:MessageService, 
    public permissionService:PermissionService, public router:Router) {
      super(messageService, permissionService, router); 
    // dateRangePicker
  }
  ngOnInit() {
    this.initData(); 
  }
  initData() {
    this.titleTabOne = "Báo vận đơn ưu tiên"; 
    this.titleTabTwo = "Danh sách vận đơn ưu tiên"; 
  }
  onSelectTabOne() {
    this.isActiveTabOne = true; 
    this.isActiveTabTwo = false; 
  }
  onSelectTabTwo() {
    this.isActiveTabOne = false; 
    this.isActiveTabTwo = true; 
  }
  eventEnterShipmentNumber() {
    this.onDetailShipment(); 
  }
  async onDetailShipment() {
    this.messageService.clear(); 
    if (this.inputShipmentNumber) {
      let includes = [];
      this.xShipment = await this.shipmentService.trackingShortAsync(this.inputShipmentNumber, includes)
      if (this.xShipment) {
        this.inputNote = this.xShipment.note; 
        this.messageService.add({ severity: Constant.messageStatus.success, detail: `Quét mã vận đơn thành công. Vui lòng nhập ghi chú vận đơn ưu tiên!` });
        return false;
      } else {
        this.inputShipmentNumber = null;
        this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Không tìm thấy mã vận đơn!` });
        return false;
      }
    }else{
      this.inputShipmentNumber = null;
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Vui lòng nhập mã vận đơn!` });
      return false;
    }
  }
  async clickSave(){
    this.messageService.clear(); 
    if (!this.inputShipmentNumber) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Vui lòng nhập mã vận đơn!` });
      return false;
    }
    if (!this.inputNote) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Vui lòng nhập ghi chú vận đơn ưu tiên!` });
      return false;
    }
    if (!this.xShipment) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Vui lòng nhập đúng mã vận đơn!` });
      return false;
    }
    if (!this.xShipment.isPrioritize) {
      this.xShipment.note = this.inputNote;
      this.xShipment.isPrioritize = true;
      this.xShipment.deliveryDate = this.deliveryDate ? SearchDate.formatToISODate(this.deliveryDate) : null;
      const uShipment = await this.shipmentService.updateAsync(this.xShipment)
      if (uShipment) {
        this.inputNote = null;
        this.inputShipmentNumber = null;
        this.deliveryDate = null;
        this.xShipment = null;
        this.messageService.add({ severity: Constant.messageStatus.success, detail: `Cập nhật vận đơn ưu tiên thành công!` });
        return false;
      } else {
        this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Cập nhật vận đơn ưu tiên không thành công, Vui lòng kiểm tra lại!` });
        return false;
      }
    } else{
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Vận đơn đã cập nhật vận đơn ưu tiên trước đó!` });
      return false;
    }
  }
}
