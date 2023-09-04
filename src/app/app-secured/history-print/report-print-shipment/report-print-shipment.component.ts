import { Component, OnInit, TemplateRef } from '@angular/core';
import { Constant } from '../../../infrastructure/constant';
import { Daterangepicker } from "ng2-daterangepicker";
import { DaterangepickerConfig } from "ng2-daterangepicker";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
import * as moment from "moment";
import { environment } from '../../../../environments/environment';
import { SelectItem, SelectItemGroup, LazyLoadEvent, MenuItem } from 'primeng/primeng';
import { ShipmentService, ReportService, HubService, AuthService, UserService } from '../../../services';
import { Hub, User } from '../../../models';
import { ReportPrintShipment } from '../../../models/abstract/reportPrintShipment.interface';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { HistoryPrintShipmentId } from '../../../models/abstract/historyPrintShipmentId.interface';
import { MessageService } from '../../../../../node_modules/primeng/components/common/messageservice';
import { Table } from '../../../../../node_modules/primeng/table';
import { SearchDate } from '../../../infrastructure/searchDate.helper';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { InputValue } from "../../../infrastructure/inputValue.helper";


@Component({
  selector: 'app-report-print-shipment',
  templateUrl: './report-print-shipment.component.html',
  styles: []
})
export class ReportPrintShipmentComponent implements OnInit {
  wopts: XLSX.WritingOptions = { bookType: "xlsx", type: "binary" };
  fileName: string = "ReportPrintShipments.xlsx";
  columnsExport: any[];
  itemTypeRePrints: MenuItem[];
  bsModalRef: BsModalRef;
  searchText: string;
  selectedData: ReportPrintShipment[];
  listData: ReportPrintShipment[];
  datasource: ReportPrintShipment[];
  totalRecords: number = 0;
  hubItemGroups: SelectItemGroup[];
  selectedHub: number;
  selectedHubItem: number;
  hubSelectItems: SelectItem[];
  environment = environment;
  pageNum = 1;
  pageNumItemPrint = 1;
  rowPerPage: number = 20;
  rowPerPageItemPrint: number = 10;
  listEmps: SelectItem[];
  selectedEmp: number;
  selectedEmpItem: number;
  printTypes: SelectItem[];
  selectedPrintType: number;
  selectedPrintTypeItem: number;
  txtFilterGb: any;
  parentPage: string = Constant.pages.historyPrint.name;
  currentPage: string = Constant.pages.historyPrint.children.printShipments.name;

  mainInput = {
    start: moment().subtract(0, "day"),
    end: moment()
  };
  mainInputItemPrint = this.mainInput;
  eventLog = "";
  selectedDateFrom: any;
  selectedDateTo: any;
  filterRows: ReportPrintShipment[];
  event: LazyLoadEvent;
  itemPrint: ReportPrintShipment;
  listHistoryByShipmentId: HistoryPrintShipmentId[];
  totalRecordsPrintShipmentId: number;
  eventItemPrint: LazyLoadEvent;
  datasourceItemPrint: HistoryPrintShipmentId[];
  filterRowItemPrints: HistoryPrintShipmentId[];
  selectedDateFromItemPrint: string;
  selectedDateToItemPrint: string;
  listEmpItems: SelectItem[];
  typeRePrintId: any;

  constructor(
    private messageService: MessageService,
    private modalService: BsModalService,
    private userService: UserService,
    private hubService: HubService,
    private authService: AuthService,
    private daterangepickerOptions: DaterangepickerConfig,
    private shipmentService: ShipmentService,
    private reportService: ReportService,
  ) {
    // dateRangePicker
    this.daterangepickerOptions.settings = {
      locale: { format: environment.formatDate },
      alwaysShowCalendars: false,
      ranges: {
        "Hôm nay": [moment().subtract(0, "day"), moment()],
        "1 tuần": [moment().subtract(7, "day"), moment()],
        "1 tháng trước": [moment().subtract(1, "month"), moment()],
        "3 tháng trước": [moment().subtract(4, "month"), moment()],
        "6 tháng trước": [moment().subtract(6, "month"), moment()],
        "12 tháng trước": [moment().subtract(12, "month"), moment()],
        "2 năm trước": [moment().subtract(24, "month"), moment()]
      }
    };
}

  ngOnInit() {
    this.columnsExport = [
      { field: "shipmentNumber", header: "Mã vận đơn" },
      { field: "createdWhen", header: "Ngày tạo" },
      { field: "totalPrintDetail", header: "In chi tiết" },
      { field: "totalPrintCodeA4", header: "In Code A4" },
      { field: "totalPrintSticker", header: "In máy barcode" },
      { field: "totalPrintBillAndAdviceOfDelivery", header: "In vđ và Phiếu BP" },
      { field: "totalPrintAdviceOfDelivery", header: "In phiếu BP" },
      { field: "totalPrintBox", header: "In số kiện" },
      { field: "totalPrintPickup", header: "In nhận hàng" },
    ];
    this.initData();
  }

  initData() {
    this.loadPrintType();
    this.loadAllHubs();

    const currentDate : string = moment(new Date()).format(environment.formatDate);
    let fromDate : string, toDate: string;
    fromDate = currentDate + "T00:00:00";
    toDate = currentDate + "T23:59:59";
    this.selectedDateFrom = fromDate;
    this.selectedDateTo = toDate;

    this.loadReportPrintShipment();
  }

  async loadAllHubs() {
    this.hubItemGroups = [];
    this.hubSelectItems = [];
    let curentHub: Hub = null;
    const currentUser: User = await this.authService.getAccountInfoAsync();
    if (currentUser.hub) {
      curentHub = currentUser.hub;
    }
    const hubs: Hub[] = await this.hubService.getAllAsync();
    if (hubs) {
      hubs.forEach(element => {
        if (element.centerHubId && element.poHubId) {
          // get SelectItemHubs with tag Title
          this.hubSelectItems.push({
            label: element.name,
            value: element.id,
            title: element.centerHubId.toString()
          });
        }
      });
    }
    let groupOfCenterHubs = this.hubSelectItems.reduce(
      (outData, item) =>
        // group all Hubs by title
        Object.assign(outData, {
          [item.title]: (outData[item.title] || []).concat(item)
        }),
      []
    );
    let centerHubs = [];
    hubs.map(x => {
      if (!x.centerHubId) {
        centerHubs.push(x);
        return x;
      }
    });
    centerHubs.forEach(x => {
      groupOfCenterHubs.forEach((y, index) => {
        if (x.id == y[0].title) {
          let hubs = y.filter(e => e.value);
          hubs.push({
            label: x.name,
            value: x.id,
            title: null
          });
          //
          this.hubItemGroups.push({
            label: `-- ${x.name} --`,
            items: hubs
          });
        }
      });
    });
  }

  async loadPrintType() {
    const data = await this.shipmentService.getAllPrintTypeSelectItemAsync();
    if (data) {
      this.printTypes = data;

      this.itemTypeRePrints = [];
      this.printTypes.forEach(x => {
        if (x.value) {
          let itemMenu: MenuItem = new Object();
          itemMenu = {
            label: x.label,
            icon: "fa-print",
            command: () => {
              this.onRePrint(x.value);
            }
          };
          this.itemTypeRePrints.push(itemMenu);
        }
      });
    }
  }

  async loadReportPrintShipment() {
    const res = await this.reportService.getReportPrintShipmentAsync(this.selectedHub,  this.selectedEmp, this.selectedPrintType, this.selectedDateFrom, this.selectedDateTo, this.searchText, this.rowPerPage, this.pageNum);
    if (res) {
      const data = res.data as ReportPrintShipment[];
      this.datasource = data.reverse();
      this.listData = this.datasource;
      this.totalRecords = res.dataCount;
    }
  }

  loadLazy(event: LazyLoadEvent) {
    this.event = event;
    setTimeout(() => {
      if (this.datasource) {
        this.filterRows = this.datasource;

        this.filterRows.sort(
          (a, b) =>
            FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        );
        this.listData = this.filterRows;
        // this.totalRecords = this.filterRows.length;
      }
    }, 250);
  }

  loadLazyItemPrint(event: LazyLoadEvent) {
    this.eventItemPrint = event;
    setTimeout(() => {
      if (this.datasourceItemPrint) {
        this.filterRowItemPrints = this.datasourceItemPrint;

        this.filterRowItemPrints.sort(
          (a, b) =>
            FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        );
        this.listHistoryByShipmentId = this.filterRowItemPrints;
      }
    }, 250);
  }

  onPageChange(event: any) {
    this.pageNum = event.first / event.rows + 1;
    this.rowPerPage= event.rows;
    this.loadReportPrintShipment();
  }

  onPageChangeItemPrint(event: any) {
    this.pageNumItemPrint = event.first / event.rows + 1;
    this.rowPerPageItemPrint= event.rows;
    this.loadItemPrints(this.itemPrint);
  }

  search(value) {
    this.searchText = value;
    this.loadReportPrintShipment();
  }

  selectedDate(value: any, dateInput: any) {
    this.selectedDateFrom =  moment(value.start).format("YYYY-MM-DDTHH:mm:ss.SSS");
    this.selectedDateTo =  moment(value.end).format("YYYY-MM-DDTHH:mm:ss.SSS");
    this.pageNum = 1;
    this.loadReportPrintShipment();
  }

  selectedDateItemPrint(value: any, dateInput: any) {
    this.selectedDateFromItemPrint =  moment(value.start).format("YYYY-MM-DDTHH:mm:ss.SSS");
    this.selectedDateToItemPrint =  moment(value.end).format("YYYY-MM-DDTHH:mm:ss.SSS");
    this.pageNumItemPrint = 1;
    this.loadItemPrints(this.itemPrint);
  }

  calendarEventsHandler(e: any) {
    this.eventLog += "\nEvent Fired: " + e.event.type;
  }

  async onChangeHub() {
    this.loadEmpByHubId();
  }

  async onChangeHubItem() {
    this.loadEmpByHubIdItem();
  }

  async loadEmpByHubId() {
    this.pageNum = 1;
    const data = await this.userService.getSelectModelAllEmpByHubIdAsync(this.selectedHub);
    if (data) {
      this.listEmps = data as SelectItem[];
    }
    this.loadReportPrintShipment();
  }
  
  async loadEmpByHubIdItem() {
    this.pageNumItemPrint = 1;
    const data = await this.userService.getSelectModelAllEmpByHubIdAsync(this.selectedHubItem);
    if (data) {
      this.listEmpItems = data as SelectItem[];
    }
    this.loadItemPrints(this.itemPrint);
  }

  changePrintTypes() {
    this.pageNum = 1;
    this.loadReportPrintShipment();
  }

  changePrintTypeItems() {
    this.pageNumItemPrint = 1;
    this.loadItemPrints(this.itemPrint);
  }

  onChangeEmps() {
    this.pageNum = 1;
    this.loadReportPrintShipment();
  }

  onChangeEmpItems() {
    this.pageNumItemPrint = 1;
    this.loadItemPrints(this.itemPrint);
  }

  async onViewPrintDetail(template: TemplateRef<any>, rowData: ReportPrintShipment) {
    this.itemPrint = rowData;
    this.selectedPrintTypeItem = null;
    this.selectedHubItem = null;
    this.selectedEmpItem = null;
    await this.loadItemPrints(rowData);
    this.bsModalRef = this.modalService.show(template, { class: "inmodal animated bounceInRight modal-lg" });
  }

  async loadItemPrints(rowData: ReportPrintShipment) {
    const res = await this.reportService.getHistoryPrintShipmentIdAsync(rowData.shipmentId, this.selectedHubItem, this.selectedEmpItem, this.selectedPrintTypeItem, this.selectedDateFromItemPrint, this.selectedDateToItemPrint, this.rowPerPageItemPrint, this.pageNumItemPrint);
    if (res) {
      this.datasourceItemPrint = res.data as HistoryPrintShipmentId[];
      this.listHistoryByShipmentId = this.datasourceItemPrint;
      this.totalRecordsPrintShipmentId = res.dataCount;
    }
  }

  async onRePrint(printTypeId?: any) {
    this.messageService.clear();
    this.typeRePrintId = printTypeId;
    if (!this.selectedData || this.selectedData.length === 0) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn vận đơn"
      });
      return;
    }
    this.printShipmets();
  }

  async printShipmets() {
    const shipmentIds: number[] = Array.from(new Set(this.selectedData.map(x => x.shipmentId) as number[]));
    const data = await this.shipmentService.printShipmentsAsync(shipmentIds, this.typeRePrintId);
    if (data) {
      // In

      // refresh
      this.loadReportPrintShipment();
    }
  }

  onClickButtonRePrint() {
    this.messageService.clear();
    let checkValid: boolean = true;
    if (!this.selectedData || this.selectedData.length === 0) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn vận đơn"
      });
      checkValid = false;
    }
    if (!this.typeRePrintId) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn loại in lại"
      });
      checkValid = false;
    }
    if (!checkValid) {
      return;
    }
  }

  exportCSV(dt: Table) {
    let data: any[] = [];
    data.push([
      "Mã vận đơn",
      "Ngày tạo",
      "In chi tiết",
      "In Code A4",
      "In máy barcode",
      "In vđ và Phiếu BP",
      "In phiếu BP",
      "In số kiện",
      "In nhận hàng"
    ]);

    this.datasource.map((shipment) => {
      let ship = Object.assign({}, shipment);
      ship.createdWhen = SearchDate.formatDate(shipment.createdWhen);
      data.push([
        ship.shipmentNumber,
        ship.createdWhen,
        ship.totalPrintDetail,
        ship.totalPrintCodeA4,
        ship.totalPrintSticker,
        ship.totalPrintBillAndAdviceOfDelivery,
        ship.totalPrintAdviceOfDelivery,
        ship.totalPrintBox,
        ship.totalPrintPickup
      ]);
    });

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const wbout: string = XLSX.write(wb, this.wopts);
    saveAs(new Blob([InputValue.s2ab(wbout)]), this.fileName);
  }

  refresh() {
    this.selectedData = [];
    this.selectedHub = null;
    this.selectedEmp = null;
    this.pageNum = 1;
    this.searchText = null;
    this.loadReportPrintShipment();
  }
}