import { Component, OnInit } from "@angular/core";
import { Constant } from "../../../infrastructure/constant";
import { MessageService } from "primeng/components/common/messageservice";
import { SoundHelper } from "../../../infrastructure/sound.helper";
import { InputValue } from "../../../infrastructure/inputValue.helper";
import { ShipmentService } from "../../../services";
import { Shipment } from "../../../models";
import { StatusHelper } from "../../../infrastructure/statusHelper";
import * as moment from "moment";
import { SearchDate } from "../../../infrastructure/searchDate.helper";
import { ArrayHelper } from "../../../infrastructure/array.helper";
import { UpdateShipmentDeliveryComplete } from "../../../models/abstract/updateShipmentDeliveryComplete.interface";
import { StringHelper } from "../../../infrastructure/string.helper";
import { LazyLoadEvent } from "primeng/primeng";
import { FilterUtil } from "../../../infrastructure/filter.util";
import { BaseComponent } from "../../../shared/components/baseComponent";
import { Router } from "@angular/router";
import { PermissionService } from "../../../services/permission.service";

@Component({
  selector: "app-edit-delivery-complete",
  templateUrl: "./edit-delivery-complete.component.html",
  styles: []
})
export class EditDeliveryCompleteComponent extends BaseComponent implements OnInit {
  checkSubmit: boolean;
  totalRecords: number;
  rowPerPage: number = 2;
  datasource: UpdateShipmentDeliveryComplete[];
  listData: UpdateShipmentDeliveryComplete[];
  arrSelectedShipmentNumber: string[];
  shipmentNumber: string;
  parentPage: string = Constant.pages.deliveryManagement.name;
  currentPage: string =
    Constant.pages.deliveryManagement.children.editDeliveryComplate.name;
  event: LazyLoadEvent;
  columns: string[] = [
    "shipmentNumber",
    "orderDate",
    "realRecipientName",
    "endDeliveryTime",
  ];

  constructor(
    private shipmentService: ShipmentService,
    public messageService: MessageService,
    public permissionService: PermissionService,
    public router: Router,
  ) {
    super(messageService,permissionService,router);
  }

  ngOnInit() {
    this.arrSelectedShipmentNumber = [];
  }

  async scanShipmentNumber(txtShipmentNumber?: any) {
    this.messageService.clear();
    let messageWarn: string = "";
    let messageByNotScanDeliveryComplete: string = "";
    let messageErr: string = "";
    let messageSuccess: string = "";
    let finalTypeMessage: string = "";
    const input = InputValue.trimInput(txtShipmentNumber);
    if (input == "") {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng nhập mã vận đơn"
      });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      txtShipmentNumber = null;
      this.shipmentNumber = null;
      return;
    }

    // begin scan shipment
    let arraySN = input.split(" ");

    const duplicateSN = this.arrSelectedShipmentNumber.filter(x =>
      arraySN.includes(x)
    );
    if (duplicateSN) {
      if (duplicateSN.length > 0) {
        const duplicateSNString = duplicateSN.join(", ");
        messageWarn =
          "Đã quét mã vận đơn " + duplicateSNString + " trước đó!" + `<br>`;
      }
    }
    arraySN = arraySN.filter(x => !duplicateSN.includes(x));

    let noExistSN: string[] = [];
    let notDeliveryComplete: string[] = [];
    let shipments: UpdateShipmentDeliveryComplete[] = [];
    if (arraySN.length > 0) {
      // scan shipmentNumbers
      await Promise.all(
        arraySN.map(async shipmentNumber => {
          const itemShipment = await this.shipmentService.getByShipmentNumberNoMessageAsync(
            shipmentNumber
          );
          if (itemShipment) {
            if (
              itemShipment.shipmentStatusId === StatusHelper.deliveryComplete
            ) {
              shipments.unshift(itemShipment);
              this.arrSelectedShipmentNumber.push(itemShipment.shipmentNumber);
            } else {
              notDeliveryComplete.push(shipmentNumber);
            }
          } else {
            noExistSN.push(shipmentNumber);
          }
        })
      );
      if (notDeliveryComplete.length > 0) {
        const notDeliveryCompleteSNString = notDeliveryComplete.join(", ");
        messageByNotScanDeliveryComplete =
          "Vận đơn không thuộc trạng thái giao hàng thành công " +
          notDeliveryCompleteSNString +
          `<br>`;
      }
      if (noExistSN.length > 0) {
        const noExistSNString = noExistSN.join(", ");
        messageErr = "Không tìm thấy vận đơn " + noExistSNString + `<br>`;
      }
      const scanSuccesSN =
        arraySN.length - noExistSN.length - notDeliveryComplete.length;
      if (scanSuccesSN > 0) {
        messageSuccess =
          "Quét thành công " + scanSuccesSN + " vận đơn" + `<br>`;
      }
      if (
        noExistSN.length === 0 &&
        duplicateSN.length === 0 &&
        notDeliveryComplete.length === 0
      ) {
        finalTypeMessage = Constant.messageStatus.success;
        SoundHelper.getSoundMessage(Constant.messageStatus.success);
      }
      if (noExistSN.length > 0) {
        finalTypeMessage = Constant.messageStatus.error;
        SoundHelper.getSoundMessage(Constant.messageStatus.error);
      } else {
        if (duplicateSN.length > 0 || notDeliveryComplete.length > 0) {
          finalTypeMessage = Constant.messageStatus.warn;
          SoundHelper.getSoundMessage(Constant.messageStatus.warn);
        }
      }
    } else {
      if (duplicateSN.length > 0 || notDeliveryComplete.length > 0) {
        finalTypeMessage = Constant.messageStatus.warn;
        SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      }
    }
    this.messageService.add({
      severity: finalTypeMessage,
      detail:
        messageErr +
        messageWarn +
        messageByNotScanDeliveryComplete +
        messageSuccess
    });
    this.shipmentNumber = null;
    // end scan shipment
    if (shipments.length > 0) {
      if (this.datasource) {
        this.datasource = shipments.concat(this.datasource);
      } else {
        this.datasource = shipments;
      }
      this.listData = this.datasource.slice(0, this.rowPerPage);
      this.totalRecords = this.datasource.length;
      this.datasource.forEach(element => {
        element.endDeliveryTime = SearchDate.formatToISODate(
          element.endDeliveryTime
        );
        element.singlePickerEndDeliveryTime = {
          singleDatePicker: true,
          timePicker: true,
          showDropdowns: true,
          opens: "left",
          startDate: new Date(element.endDeliveryTime)
        };
      });
    } else {
      txtShipmentNumber = null;
    }
  }

  singleSelectEndDeliveryTime(
    value: any,
    shipment: UpdateShipmentDeliveryComplete
  ) {
    shipment.endDeliveryTime = SearchDate.formatToISODate(
      moment(value.start).toDate()
    );
  }

  loadLazy(event: LazyLoadEvent) {
    this.event = event;
    setTimeout(() => {
      if (this.datasource) {
        var filterRows;

        //filter
        if (event.filters.length > 0)
          filterRows = this.datasource.filter(x =>
            FilterUtil.filterField(x, event.filters)
          );
        else
          filterRows = this.datasource.filter(x =>
            FilterUtil.gbFilterFiled(x, event.globalFilter, this.columns)
          );

        // sort data
        // filterRows.sort(
        //   (a, b) =>
        //     FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        // );
        this.listData = filterRows.slice(event.first, event.first + event.rows);
        this.totalRecords = filterRows.length;
      }
    }, 250);
  }

  async updateShipments() {
    this.messageService.clear();
    if (ArrayHelper.isNullOrZero(this.datasource)) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "DS vận đơn trống!"
      });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }

    let emptyRealRecipientName: string[] = [];
    this.datasource.forEach(x => {
      if (StringHelper.isNullOrEmpty(x.realRecipientName)) {
        emptyRealRecipientName.push(x.shipmentNumber);
      }
    });
    if (!ArrayHelper.isNullOrZero(emptyRealRecipientName)) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: `Vận đơn ${emptyRealRecipientName.join(
          " "
        )} chưa nhập tên người nhận thực tế`
      });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }

    this.checkSubmit = true;
    const data = await this.shipmentService.updateDeliveryCompleteByIdsAsync(
      this.datasource
    );
    this.checkSubmit = false;
    if (data) {
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Cập nhật thành công!"
      });
      this.refresh();
      this.totalRecords = this.datasource.length;
    }
  }

  refresh() {
    this.datasource = [];
    this.listData = [];
    this.arrSelectedShipmentNumber = [];
    this.shipmentNumber = null;
    this.checkSubmit = false;
  }
}
