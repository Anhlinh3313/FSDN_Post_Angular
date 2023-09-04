import { Component, OnInit, TemplateRef, EventEmitter, ViewChildren } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
import * as JsBarcode from "jsbarcode";
//
import { Constant } from '../../../infrastructure/constant';
import { LazyLoadEvent, SelectItem } from 'primeng/primeng';
import { BaseModel } from '../../../models/base.model';
import { ShipmentService, TPLService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { Message } from 'primeng/components/common/message';
import { ResponseModel } from '../../../models/response.model';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { StatusHelper } from '../../../infrastructure/statusHelper';
import { Shipment } from '../../../models/shipment.model';
import { TPL, AssignShipmentToTPL } from '../../../models/index';
import { PersistenceService, StorageType } from 'angular-persistence';
import { KeyValuesViewModel, ListUpdateStatusViewModel } from '../../../view-model/index';
import { ShipmentStatus } from '../../../models/shipmentStatus.model';
import { ShipmentTypeHelper } from '../../../infrastructure/shipmentType.helper';
import { ListGoods } from '../../../models/listGoods.model';
import { retry } from 'rxjs/operator/retry';
import { filter } from 'rxjs/operator/filter';
import { now } from 'moment';
//
// import { Angular2Csv } from 'angular2-csv/Angular2-csv';
//excel
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Table } from 'primeng/table';
import { environment } from '../../../../environments/environment';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
type AOA = Array<Array<any>>;
function s2ab(s: string): ArrayBuffer {
  const buf: ArrayBuffer = new ArrayBuffer(s.length);
  const view: Uint8Array = new Uint8Array(buf);
  for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}

declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-tpl-shipment',
  templateUrl: 'tpl-shipment.component.html',
  styles: []
})
export class TPLShipmentComponent extends BaseComponent implements OnInit {
  txtFilterGb: any;
  generatorBarcode: string;
  itemShipment: any = [];
  stt: number;

  listGoods: any;
  dateCreate: Date;

  constructor(private modalService: BsModalService, private persistenceService: PersistenceService, protected messageService: MessageService,
    private shipmentService: ShipmentService,
    private tplService: TPLService, public permissionService: PermissionService, public router: Router) {
      super(messageService, permissionService, router);
  }

  parentPage: string = Constant.pages.tpl.name;
  currentPage: string = Constant.pages.tpl.children.shipmentTPL.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  selectedData: Shipment[];
  listData: Shipment[];
  //
  columns: string[] = ["shipmentNumber", "numPick", "pickupAppointmentTime", "orderDate", "fromHubRouting.name",
    "cusNote", "senderName", "senderPhone", "pickingAddress", "pickupNote", "shipmentStatus.name", "currentEmp.fullName"];
  datasource: Shipment[];
  totalRecords: number;
  rowPerPage: number = 20;
  event: LazyLoadEvent;
  //
  statuses: SelectItem[];
  selectedStatus: number;
  //
  tpls: SelectItem[];
  selectedTPL: TPL;
  //
  selectedDateFrom: Date;
  selectedDateTo: Date;
  //  
  public singlePicker = {
    timePicker: true,
    timePicker24Hour: true,
    singleDatePicker: true,
    showDropdowns: true,
    opens: "left",
    locale: {
      "applyLabel": "Chọn",
      "cancelLabel": "Hủy",
    }
  }

  //excel
  columnNameExcel: ColumnNameExcel = new ColumnNameExcel();
  columnsName: string[] = [this.columnNameExcel.tpl_code, this.columnNameExcel.to_Province, this.columnNameExcel.receiver_Name,
  this.columnNameExcel.shipping_Address, this.columnNameExcel.receiver_Phone, this.columnNameExcel.shipment_ServiceDVGTs, this.columnNameExcel.note];
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'binary' };
  fileName: string = 'SimpleExcel.xlsx';
  //
  ngOnInit() {
    let fromDate = new Date();
    fromDate.setHours(0, 0, 0, 0);
    this.selectedDateFrom = fromDate;
    this.selectedDateTo = new Date();
    this.initData();
  }

  initData() {
    this.loadTPL();
    this.loadShipment();
    this.selectedData = null;
  }

  public singleSelectFrom(value: any) {
    this.selectedDateFrom = moment(value.start).toDate();
    this.loadShipment();
  }

  public singleSelectTo(value: any) {
    this.selectedDateTo = moment(value.start).toDate();
    this.loadShipment();
  }

  loadShipment() {
    let includes = [];
    includes.push(Constant.classes.includes.shipment.fromHubRouting);
    includes.push(Constant.classes.includes.shipment.currentEmp);
    includes.push(Constant.classes.includes.shipment.shipmentStatus);
    includes.push(Constant.classes.includes.shipment.pickUser);
    includes.push(Constant.classes.includes.shipment.fromProvince);
    includes.push(Constant.classes.includes.shipment.toProvince);
    includes.push(Constant.classes.includes.shipment.sender);
    includes.push(Constant.classes.includes.shipment.tpl);
    includes.push(Constant.classes.includes.listGoods.createdByHub);

    this.shipmentService.getByTPL(this.selectedDateFrom, this.selectedDateTo, includes, null, null).subscribe(
      x => {
        if (!super.isValidResponse(x)) return;
        let shipments = x.data as Shipment[];
        this.datasource = shipments;
        this.totalRecords = this.datasource.length;
        this.listData = this.datasource.slice(0, this.rowPerPage);
        this.loadFilter();
      }
    );
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
      jQuery('.i-checks').iCheck({
        checkboxClass: 'icheckbox_square-green',
        radioClass: 'iradio_square-green',
      });
      jQuery('.footable').footable();
    });
  }

  loadLazy(event: LazyLoadEvent) {
    //in a real application, make a remote request to load data using state metadata from event
    //event.first = First row offset
    //event.rows = Number of rows per page
    //event.sortField = Field name to sort with
    //event.sortOrder = Sort order as number, 1 for asc and -1 for dec
    //filters: FilterMetadata object having field as key and filter value, filter matchMode as value
    this.event = event;

    //imitate db connection over a network
    setTimeout(() => {
      if (this.datasource) {
        var filterRows;

        //filter
        if (event.filters.length > 0)
          filterRows = this.datasource.filter(x => FilterUtil.filterField(x, event.filters));
        else
          filterRows = this.datasource.filter(x => FilterUtil.gbFilterFiled(x, event.globalFilter, this.columns));

        //Begin Custom filter
        if (this.selectedStatus) {
          filterRows = filterRows.filter(x => x.shipmentStatusId === this.selectedStatus);
        }
        //
        if (this.selectedTPL) {
          filterRows = filterRows.filter(x => x.tplId === this.selectedTPL);
        }
        //End Custom filter

        // sort data
        filterRows.sort((a, b) => FilterUtil.compareField(a, b, event.sortField) * event.sortOrder);
        this.listData = filterRows.slice(event.first, (event.first + event.rows))
        this.totalRecords = filterRows.length;

        // this.listData = filterRows.slice(event.first, (event.first + event.rows));
      }
    }, 250);
  }

  changeFilter() {
    this.loadLazy(this.event);
  }

  loadFilter() {
    //
    this.selectedStatus = null;
    let uniqueStatus = [];
    this.statuses = [];
    //
    this.selectedTPL = null;
    //
    this.datasource.forEach(x => {
      if (uniqueStatus.length === 0) {
        this.statuses.push({ label: "Chọn tất cả", value: null });
      }
      //
      if (uniqueStatus.indexOf(x.shipmentStatusId) === -1 && x.shipmentStatusId) {
        uniqueStatus.push(x.shipmentStatusId);
        this.statuses.push({ label: x.shipmentStatus.name, value: x.shipmentStatusId });
      }
    });
  }

  refresh() {
    this.loadShipment();
    this.loadFilter();
    if (this.bsModalRef)
      this.bsModalRef.hide();
    this.selectedData = null;
    this.txtFilterGb = null;
  }

  clickRefresh() {
    this.refresh();
  }

  getStorage(name: string): object {
    return this.persistenceService.get(name, StorageType.LOCAL);
  }

  setStorage(name: string, obj: object) {
    this.persistenceService.set(name, obj, { type: StorageType.LOCAL });
  }

  removeStorage(name: string) {
    this.persistenceService.remove(name, StorageType.LOCAL);
  }

  clone(model: Shipment): Shipment {
    let data = new Shipment();
    for (let prop in model) {
      data[prop] = model[prop];
    }
    return data;
  }

  public ExportExcel(table: Table): void {
    let datas: any[] = [];
    datas.push([
      "STT", "NGÀY ĐI ĐT", "Mã vận đơn NB", "MÃ VẬN ĐƠN ĐT", "ĐỐI TÁC", "NGƯỜI GỬI", "SỐ ĐT NGƯỜI GỬI", "COD", "CƯỚC", "NGƯỜI NHẬN", "SỐ ĐT NGƯỜI NHẬN", "ĐỊA CHỈ NHẬN HÀNG", "TỈNH GIAO", "GHI CHÚ KHÁCH HÀNG", "GHI CHÚ GIAO HÀNG", "TÌNH TRẠNG", "NGÀY GỬI"
    ])
    let i = 0;
    let tong = 0;
    table.value.forEach(item => {
      datas.push([
        i + 1, item.tplCreatedWhen ? moment(item.tplCreatedWhen).format(environment.formatDateTime) : "", item.shipmentNumber, item.tplNumber, item.tpl ? item.tpl.name : "", item.senderName, item.senderPhone, item.cod, item.totalPrice, item.receiverName, item.receiverPhone, (item.shippingAddress ? item.shippingAddress : "") + "\n" + (item.addressNoteTo ? item.addressNoteTo : "") , item.toProvince ? item.toProvince.name : "", item.cusNote, item.deliveryNote, item.shipmentStatus ? item.shipmentStatus.name : "", item.orderDate ? moment(item.orderDate).format(environment.formatDateTime) : "",
      ])
      i++;
    })

    // datas = datas.concat(this.listData);
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(datas);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    /* save to file */
    const wbout: string = XLSX.write(wb, this.wopts);
    saveAs(new Blob([s2ab(wbout)]), this.fileName);
  }

  public SimpleExcel(component): void {
    let datas: any[] = [];
    datas.push([
      "STT", this.columnNameExcel.tpl_code, this.columnNameExcel.to_Province, this.columnNameExcel.receiver_Name,
      this.columnNameExcel.shipping_Address, this.columnNameExcel.receiver_Phone, this.columnNameExcel.shipment_ServiceDVGTs, this.columnNameExcel.note
    ])
    let i = 0;
    let tong = 0;
    this.listData.forEach(item => {
      let message = "";
      tong += (this.listData[i].totalPrice + this.listData[i].cod);
      datas.push([
        // i + 1, this.listData[i].shipment.shipmentNumber, (this.listData[i].shipment.totalPrice + this.listData[i].cod), this.listData[i].totalPrice, this.listData[i].cod, (this.listData[i].shipment.paymentType ? this.listData[i].shipment.paymentType.name : ""), this.listData[i].shipment.tplNumber,(this.listData[i].shipment.tpl ? this.listData[i].shipment.tpl.code : ""), this.listData[i].shipment.orderDate, (this.listData[i].shipment.service ? this.listData[i].shipment.service.name : ""), this.listData[i].shipment.weight, this.listData[i].shipment.totalBox
        i + 1, this.listData[i].shipmentNumber, (this.listData[i].toProvince ? this.listData[i].toProvince.name : ""), this.listData[i].receiverName, this.listData[i].shippingAddress, this.listData[i].receiverPhone, this.listData[i].shipmentServiceDVGTs, this.listData[i].note
      ])
      i++;
    })
    // debugger
    // const options = component._value;
    // const rows = options[0].rows;
    // let altIdx = 0;
    // rows.forEach((row) => {
    //   if (row.type === 'data') {
    //     if (altIdx % 2 !== 0) {
    //       row.cells.forEach((cell) => {
    //         cell.background = '#aabbcc';
    //       });
    //     }
    //     altIdx++;
    //   }
    // });

    // datas = datas.concat(this.listData);
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(datas);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    /* save to file */
    const wbout: string = XLSX.write(wb, this.wopts);
    saveAs(new Blob([s2ab(wbout)]), this.fileName);
  }
}
export class ColumnNameExcel {
  tpl_code: string = "Mã Vận đơn Đối tác";
  to_Province: string = "Tỉnh đến";
  receiver_Name: string = "Người nhận/KH nhận";
  shipping_Address: string = "Địa chỉ nhận";
  receiver_Phone: string = "Số ĐT người nhận";
  shipment_ServiceDVGTs: string = "Dịch vụ gia tăng";
  note: string = "Ghi chú";
}