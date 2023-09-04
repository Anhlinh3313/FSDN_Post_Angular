import { Component, OnInit, TemplateRef, ViewChildren } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
//
import { Constant } from '../../../infrastructure/constant';
import { LazyLoadEvent, SelectItem } from 'primeng/primeng';
import { ShipmentService, TPLService, PriceService, ServiceDVGTService, BoxService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { Shipment } from '../../../models/shipment.model';
import { TPL, AssignShipmentToTPL } from '../../../models/index';
import { ShipmentTypeHelper } from '../../../infrastructure/shipmentType.helper';
import { ShipmentFilterViewModel } from '../../../models/shipmentFilterViewModel';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { StringHelper } from '../../../infrastructure/string.helper';
import { ShipmentTracking } from '../../../models/abstract/shipmentTracking.interface';
import { SoundHelper } from '../../../infrastructure/sound.helper';

declare var jQuery: any;
// declare var $: any;

@Component({
  selector: "app-shipment-assign-to-tpl",
  templateUrl: "shipment-assign-to-tpl.component.html",
  styles: []
})
export class ShipmentAssignToTPL extends BaseComponent implements OnInit {
  shipmentNumberTPL: string;
  shipmentNumber: string;
  tpls: SelectItem[];
  selectedTPL: number;
  txtFilterGbLeft: any;
  generatorBarcode: string;
  itemShipment: ShipmentTracking = new ShipmentTracking();
  stt: number;

  listGoods: any;
  dateCreate: Date;

  shipmentFilterViewModel: ShipmentFilterViewModel = new ShipmentFilterViewModel();

  constructor(
    private boxService: BoxService,
    private serviceDVGTService: ServiceDVGTService,
    private priceService: PriceService,
    private modalService: BsModalService,
    protected messageService: MessageService,
    private shipmentService: ShipmentService,
    private tplService: TPLService,
    public permissionService: PermissionService,
    public router: Router
  ) {
    super(messageService, permissionService, router);

    let includes =
      Constant.classes.includes.shipment.fromHubRouting +
      "," +
      Constant.classes.includes.shipment.currentEmp +
      "," +
      Constant.classes.includes.shipment.shipmentStatus +
      "," +
      Constant.classes.includes.shipment.pickUser +
      "," +
      Constant.classes.includes.shipment.fromProvince +
      "," +
      Constant.classes.includes.shipment.toProvince +
      "," +
      Constant.classes.includes.shipment.sender +
      "," +
      Constant.classes.includes.listGoods.createdByHub;

    this.shipmentFilterViewModel.Cols = includes;
    this.shipmentFilterViewModel.Type = ShipmentTypeHelper.transfertpl;
    this.shipmentFilterViewModel.ShipmentNumberListSelect = [""];
  }

  parentPage: string = Constant.pages.tpl.name;
  currentPage: string = Constant.pages.tpl.children.shipmentAssignToTPL.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  selectedData: Shipment[];
  listData: Shipment[];
  isFast: boolean = true;
  //
  localStorageRightData = "localStorageRightData";
  columns: string[] = [
    "shipmentNumber",
    "numPick",
    "pickupAppointmentTime",
    "orderDate",
    "fromHubRouting.name",
    "cusNote",
    "senderName",
    "senderPhone",
    "pickingAddress",
    "pickupNote",
    "shipmentStatus.name",
    "currentEmp.fullName"
  ];

  columnsFilter = [
    { field: "shipmentNumber", header: "Mã" },
    { field: "TPLNumber", header: "Mã đối tác" },
    { field: "tplPrice", header: "Tổng cước" },
    { field: "fromHubRouting.name", header: "Tuyến" },
    { field: "toProvince.name", header: "Tỉnh giao" },
    { field: "cusNote", header: "Ghi chú khách hàng" },
    { field: "receiverName", header: "Người gửi" },
    { field: "receiverPhone", header: "Số đt người gửi" },
    { field: "shippingAddress", header: "Địa chỉ giao hàng" },
    { field: "deliveryNote", header: "Ghi chú giao hàng" },
    { field: "shipmentStatus.name", header: "Tình trạng" }
  ];

  datasource: Shipment[];
  totalRecords: number;
  rowPerPage: number = 20;
  event: LazyLoadEvent;
  //
  tplRight: SelectItem[];
  selectedTPLRight: TPL;
  //
  @ViewChildren("txtAssignShipment")
  vcAssignShipment;
  @ViewChildren("txtAssignShipmentTPL")
  vcAssignShipmentTPL;

  ngOnInit() {
    this.initData();
  }

  initData() {
    this.loadTPL();
    this.selectedData = null;
    this.datasource = [];
  }

  loadTPL() {
    this.tplService.getAll().subscribe(x => {
      if (!super.isValidResponse(x)) return;
      this.tpls = [];
      let users = x.data as TPL[];

      users.forEach(element => {
        this.tpls.push({ label: element.name, value: element.id });
      });

      this.selectedTPL = null;
    });
  }

  ngAfterViewInit() {
    jQuery(document).ready(function () {
      jQuery(".i-checks").iCheck({
        checkboxClass: "icheckbox_square-green",
        radioClass: "iradio_square-green"
      });
      jQuery(".footable").footable();
    });
  }

  loadLazy(event: LazyLoadEvent) {
    this.event = event;

    setTimeout(() => {
      if (this.datasource) {
        var filterRows;

        //filter
        if (event.filters.length > 0)
          filterRows = this.datasource.filter(x => FilterUtil.filterField(x, event.filters));
        else
          filterRows = this.datasource.filter(x => FilterUtil.gbFilterFiled(x, event.globalFilter, this.columns));

        // sort data
        filterRows.sort(
          (a, b) =>
            FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        );
        this.listData = filterRows.slice(event.first, (event.first + event.rows));
        this.totalRecords = filterRows.length;

      }
    }, 250);
  }

  async scanShipmentNumber(
    txtShipmentNumber?: any,
    txtShipmentNumberTPL?: any
  ) {
    this.messageService.clear();
    if (!this.selectedTPL) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn đối tác"
      });
      txtShipmentNumber.value = null;
      txtShipmentNumberTPL.value = null;
      return;
    }

    // kiểm tra nhập khoảng trắng
    if (StringHelper.isNullOrEmpty(txtShipmentNumber.value)) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng nhập mã vận đơn"
      });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }
    // kiểm tra mã vận đơn quét vào có trong hệ thống hay ko
    const shipmentNumber: string = txtShipmentNumber.value.trim();
    //var listShipment = shipmentNumber.replace(/\\\t/g, '_');
    var listShipments = shipmentNumber.split(' ');
    if (listShipments.length <= 1) {
      const shipmentTracking: ShipmentTracking = await this.shipmentService.getByShipmentNumberAsync(
        shipmentNumber
      );
      if (!shipmentTracking) {
        txtShipmentNumber.value = null;
        SoundHelper.getSoundMessage(Constant.messageStatus.warn);
        return;
      }
      // kiểm tra mã vận đơn quét vào đã được quét trước đó hay chưa
      const duplicateSN = this.datasource.find(
        x =>
          x.shipmentNumber.toLocaleLowerCase() ===
          shipmentNumber.toLocaleLowerCase()
      );
      if (duplicateSN) {
        this.messageService.add({
          severity: Constant.messageStatus.warn,
          detail: "Đã quét mã vận đơn " + shipmentNumber + " trước đó!"
        });
        txtShipmentNumber.value = null;
        SoundHelper.getSoundMessage(Constant.messageStatus.warn);
        return;
      }

      // show dữ liệu của vận đơn
      this.itemShipment = shipmentTracking;
      // tính lại giá theo tpl
    } else if (listShipments.length <= 20) {
      var _this = this;
      var countSuccess = 0;
      var listError: any = [];
      await Promise.all(listShipments.map(async function (rowNumber) {
        let rowListNumber = rowNumber.split('\t');
        if (rowListNumber.length >= 2) {
          let fNumber = rowListNumber[0];
          let fTPLNumber = rowListNumber[1];
          let shipmentTracking: ShipmentTracking = await _this.shipmentService.getByShipmentNumberAsync(fNumber);
          let shipmentTrackingTPL: ShipmentTracking = await _this.shipmentService.checkExistTPLNumberAsync(fTPLNumber);
          // kiểm tra mã vận đơn đối tác quét vào đã được quét trước đó hay chưa          
          const duplicateSN = _this.datasource.find(
            x =>
              x.shipmentNumber.toLocaleLowerCase() === fNumber.toLocaleLowerCase()
          );
          const duplicateSNTPL = _this.datasource.find(
            x =>
              x.tplNumber.toLocaleLowerCase() === fTPLNumber.toLocaleLowerCase()
          );
          if (!duplicateSN && !duplicateSNTPL && shipmentTracking && shipmentTrackingTPL) {
            if (shipmentTracking) {
              _this.itemShipment = _this.cloneShipment(shipmentTracking);
              console.log(fTPLNumber, _this.itemShipment, shipmentTracking);
              // tính lại giá theo tpl
              _this.itemShipment.tplNumber = fTPLNumber;
              // đưa vào danh sách các vận đơn muốn lưu
              _this.datasource.unshift(_this.itemShipment);
              _this.totalRecords = _this.datasource.length;
              _this.listData = _this.datasource.slice(0, _this.rowPerPage);
              _this.itemShipment = new ShipmentTracking();
              _this.shipmentNumber = null;
              _this.shipmentNumberTPL = null;
              countSuccess++;
            }
          } else {
            let dataError: any = [];
            dataError.push(duplicateSN);
            dataError.push(duplicateSNTPL);
            dataError.push(shipmentTracking);
            dataError.push(shipmentTrackingTPL);
            listError.push(dataError);
          }
        }
      }));
      console.log(listError);
      txtShipmentNumber.value = null;
      _this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: `Thành công (${countSuccess})/(${listShipments.length}) vận đơn`
      });
    } else {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: `Quá giới hạn 200 vận đơn.`
      });
    }
  }

  cloneShipment(model: ShipmentTracking): ShipmentTracking {
    let data = new ShipmentTracking();
    for (let prop in model) {
      data[prop] = model[prop];
    }
    return data;
  }

  async scanShipmentNumberTPL(
    txtShipmentNumber?: any,
    txtShipmentNumberTPL?: any
  ) {
    this.messageService.clear();
    if (!this.selectedTPL) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn đối tác"
      });
      txtShipmentNumberTPL.value = null;
      return;
    }

    if (StringHelper.isNullOrEmpty(txtShipmentNumber.value)) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng nhập mã vận đơn"
      });
      return;
    }
    // kiểm tra nhập khoảng trắng
    if (StringHelper.isNullOrEmpty(txtShipmentNumberTPL.value)) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng nhập mã vận đơn đối tác"
      });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }

    // kiểm tra mã vận đơn đối tác quét vào có trong hệ thống hay ko
    const tplNumber: string = txtShipmentNumberTPL.value.trim();
    const shipmentTracking: ShipmentTracking = await this.shipmentService.checkExistTPLNumberAsync(
      tplNumber
    );
    if (!shipmentTracking) {
      txtShipmentNumberTPL.value = null;
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }

    // kiểm tra mã vận đơn đối tác quét vào đã được quét trước đó hay chưa
    const duplicateSN = this.datasource.find(
      x =>
        x.tplNumber.toLocaleLowerCase() ===
        tplNumber.toLocaleLowerCase()
    );
    if (duplicateSN) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Đã quét mã vận đơn trước đó " + tplNumber + " trước đó!"
      });
      txtShipmentNumberTPL.value = null;
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }
    if (this.isFast) {
      this.confirmTPL(txtShipmentNumberTPL);
    }
  }

  confirmTPL(txtShipmentNumberTPL: any) {
    if (StringHelper.isNullOrEmpty(txtShipmentNumberTPL.value)) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng nhập mã vận đơn đối tác"
      });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }
    // check điều kiện lưu mã vận đơn đối tác nếu có
    this.itemShipment.tplNumber = this.shipmentNumberTPL;

    // đưa vào danh sách các vận đơn muốn lưu
    this.datasource.unshift(this.cloneShipment(this.itemShipment));
    this.totalRecords = this.datasource.length;
    this.listData = this.datasource.slice(0, this.rowPerPage);

    this.itemShipment = new ShipmentTracking();
    this.shipmentNumber = null;
    this.shipmentNumberTPL = null;
  }

  refresh() {
    if (this.bsModalRef) this.bsModalRef.hide();
    this.selectedData = null;
    this.datasource = [];
    this.listData = [];
    this.itemShipment = new ShipmentTracking();
    this.shipmentNumber = null;
    this.shipmentNumberTPL = null;
  }

  save() {
    if (this.selectedData == null || (this.selectedData && this.selectedData.length === 0)) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng chọn vận đơn!"
      });
      return;
    }

    let listShipmentAssign: AssignShipmentToTPL[] = [];
    // let currentDate: any = new Date();
    // currentDate = SearchDate.formatToISODate(currentDate);
    this.selectedData.forEach(x => {
      let model = new AssignShipmentToTPL();
      model.ShipmentId = x.id;
      model.ShipmentNumber = x.shipmentNumber;
      model.TPLId = this.selectedTPL;
      model.TPLNumber = x.tplNumber;
      model.TPLPrice = 0;
      model.IsTPLTransit = false;
      // model.TPLCreatedWhen = currentDate;
      listShipmentAssign.push(model);
    });
    this.shipmentService
      .assignShipmentToTPL(listShipmentAssign)
      .subscribe(x => {
        // this.listGoods = x.data as ListGoods;
        if (!super.isValidResponse(x)) return;

        this.messageService.add({
          severity: Constant.messageStatus.success,
          detail: "Cập nhật thành công"
        });
        this.datasource = this.datasource.filter(x => !this.selectedData.includes(x));
        this.listData = this.datasource.slice(0, this.rowPerPage);
        this.totalRecords = this.datasource.length;
        this.selectedData = [];
        this.itemShipment = new ShipmentTracking();
      });
  }

  clickRefresh(template: TemplateRef<any>) {
    if (this.listData.length > 0) {
      this.bsModalRef = this.modalService.show(template, {
        class: "inmodal animated bounceInRight modal-s"
      });
      return;
    }
    this.refresh();
  }

  changeTPL() {
    if (this.itemShipment.id) {
    }
  }

}
