import { Component, OnInit } from '@angular/core';

import * as moment from 'moment';
//
import { Constant } from '../../../infrastructure/constant';
import { LazyLoadEvent, SelectItem, DataTable } from 'primeng/primeng';
import { ShipmentService, HubService, ReportService, ProvinceService, PaymentTypeService, ServiceService, CustomerService, ShipmentStatusService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { Customer } from '../../../models/index';
import { DateRangeFromTo } from '../../../view-model/index';
import { Shipment } from '../../../models/shipment.model';
import { SearchDate } from '../../../infrastructure/searchDate.helper';
import { ShipmentFilterViewModel } from '../../../models/shipmentFilterViewModel';
import { ShipmentTypeHelper } from '../../../infrastructure/shipmentType.helper';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { PermissionService } from '../../../services/permission.service';
import { SelectModel } from '../../../models/select.model';
import { ExportAnglar5CSV } from '../../../infrastructure/exportAngular5CSV.helper';
import { Angular5Csv } from 'angular5-csv/Angular5-csv';

@Component({
  selector: 'app-report-return',
  templateUrl: './report-return.component.html',
  styles: []
})

export class ReportReturnComponent extends BaseComponent implements OnInit {
  hub = environment;

  typeDelivery: string;
  isSuccessDelivery: boolean;
  constructor(
    protected messageService: MessageService,
    private shipmentService: ShipmentService,
    private hubService: HubService,
    private provinceService: ProvinceService,
    private paymentTypeService: PaymentTypeService,
    private serviceService: ServiceService,
    private customerService: CustomerService,
    private shipmentStatusService: ShipmentStatusService,
    public permissionService: PermissionService,
    public router: Router,
    //
    private reportService: ReportService,
  ) {
    super(messageService, permissionService, router);

    const currentDate = moment(new Date()).format("YYYY/MM/DD");
    let orderDateFrom = currentDate + "T01:00:00";
    let orderDateTo = currentDate + "T23:59:59";

    this.shipmentFilterViewModel.Cols = this.includes;
    this.shipmentFilterViewModel.Type = ShipmentTypeHelper.isreturn;
    this.shipmentFilterViewModel.OrderDateFrom = orderDateFrom;
    this.shipmentFilterViewModel.OrderDateTo = orderDateTo;
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.PageSize = this.rowPerPage;
    this.shipmentFilterViewModel.groupStatusId = 12;
    this.shipmentFilterViewModel.isReturn = true;
  }

  includes: string =
    Constant.classes.includes.shipment.fromHubRouting + "," +
    Constant.classes.includes.shipment.shipmentStatus + "," +
    Constant.classes.includes.shipment.service + "," +
    Constant.classes.includes.shipment.fromHub + "," +
    Constant.classes.includes.shipment.toHub + "," +
    Constant.classes.includes.shipment.toHubRouting + "," +
    Constant.classes.includes.shipment.pickUser + "," +
    Constant.classes.includes.shipment.fromWard + "," +
    Constant.classes.includes.shipment.toWard + "," +
    Constant.classes.includes.shipment.fromDistrict + "," +
    Constant.classes.includes.shipment.fromProvince + "," +
    Constant.classes.includes.shipment.toDistrict + "," +
    Constant.classes.includes.shipment.toProvince + "," +
    Constant.classes.includes.shipment.deliverUser + "," +
    Constant.classes.includes.shipment.paymentType + "," +
    Constant.classes.includes.shipment.sender + "," +
    Constant.classes.includes.shipment.structure + "," +
    Constant.classes.includes.shipment.serviceDVGT + "," +
    Constant.classes.includes.shipment.boxes;

  parentPage: string = Constant.pages.report.name;
  currentPage: string = Constant.pages.report.children.reportReturn.name;

  //============================
  //BEGIN
  //============================
  txtFilterGb: any;
  pageNum = 1;
  rowPerPage = 20;
  totalRecords: number = 0;
  totalRecevice: number = 0;
  maxRecordExport = 200;

  shipmentFilterViewModel: ShipmentFilterViewModel = new ShipmentFilterViewModel();

  // datasource: Shipment[];
  listData: Shipment[];
  event: LazyLoadEvent;

  //
  requestGetPickupHistory: DateRangeFromTo = new DateRangeFromTo();
  public dateRange = {
    start: moment().hour(1).minute(0).second(0),
    end: moment().hour(23).minute(59).second(0)
  }
  //
  customer: any;
  customers: SelectModel[];
  filteredCustomers: any;
  //
  txtShipmentNumber: string = "";
  txtSearchText: string = "";

  fromProvincesLS: SelectItem[];
  fromSelectedProvinceLS: number;

  toProvincesLS: SelectItem[];
  toSelectedProvinceLS: number;

  fromHub: SelectItem[];
  selectedFromHub: number;

  currentHub: SelectItem[];
  selectedCurrentHub: number;

  fromSendersLS: SelectItem[];
  fromSelectedSenderLS: number;

  servicesLS: SelectItem[];
  provinces: SelectItem[];
  selectedServicesLS: number;
  selectedToProvince: number[]=[];
  paymentTypesLS: SelectItem[];
  selectedPaymentTypeLS: number;

  statusesLS: SelectItem[];
  selectedStatusLS: number;

  selectedDateFrom: Date;
  selectedDateTo: Date;
  //

  //
  columns: any[] = [
    { field: "id", header: 'ID' },
    { field: "shipmentNumber", header: 'Mã vận đơn' },
    { field: "requestShipmentId", header: 'Mã bill tổng' },
    { field: "cusNote", header: 'Yêu cầu phục vụ' },
    { field: "orderDate", header: 'Ngày gửi' },
    { field: "paymentType.name", header: 'HTTT' },
    { field: "service.name", header: 'Dịch vụ' },

    { field: "shipmentServiceDVGTs", header: 'Dịch vụ gia tăng' },
    { field: "defaultPrice", header: 'Cước chính' },
    { field: "fuelPrice", header: 'PPXD' },
    { field: "remoteAreasPrice", header: 'VSVX' },
    { field: "totalDVGT", header: 'Phí DVGT' },
    { field: "vatPrice", header: 'VAT' },
    { field: "totalPrice", header: 'Tổng cước' },

    { field: "shipmentStatus.name", header: 'Trạng thái' },
    { field: "deliverUser.fullName", header: 'Nhân viên gửi' },
    { field: "senderName", header: 'Tên người gửi' },
    { field: "senderPhone", header: 'Đt gửi' },
    { field: "companyFrom", header: 'CTY gửi' },
    { field: "pickingAddress", header: 'Địa chỉ gửi' },
    { field: "fromWard.district.province.name", header: 'Tỉnh đi' },
    { field: "fromHub.name", header: 'Trạm lấy' },
    { field: "fromHubRouting.name", header: 'Tuyến lấy' },
    { field: "receiverName", header: 'Tên người nhận' },
    { field: "receiverPhone", header: 'Đt nhận' },
    { field: "companyTo", header: 'CTY nhận' },
    { field: "shippingAddress", header: 'Địa chỉ nhận' },
    { field: "toWard.district.province.name", header: 'Tỉnh đến' },
    { field: "toHub.name", header: 'Trạm giao' },
    { field: "toHubRouting.name", header: 'Tuyến giao' },
  ];
  //
  columnsExp: any[] = [
    { field: "numberAutoUp", header: 'STT' },
    { field: "receiverCode2", header: 'Mã Người nhận' },
    { field: "orderDate", header: 'Giờ Gửi', typeFormat: "time", formatString: 'HH:mm' },
    { field: "orderDate2", header: 'Ngày Gửi', typeFormat: "date", formatString: 'DD/MM/YYYY' },
    { field: "shipmentNumber", header: 'Vận Đơn', typeFormat: "stringNumber" },
    { field: "cod", header: 'COD', typeFormat: "number", sumField: "sumCOD" },
    { field: "insured", header: 'Giá Trị HH', typeFormat: "number", sumField: "sumInsured" },
    { field: "totalBox", header: "Số Kiện", typeFormat: "number" },
    { field: "weight", header: "Trọng Lượng", typeFormat: "number" },
    { field: "receiverName", header: "Người Nhận" },
    { field: "toProvinceName", header: "Tỉnh Thành" },
    { field: "toDistrictName", header: "Quận Huyện" },
    { field: "toWardName", header: "Phường Xã" },
    { field: "shippingAddress", header: "ĐC Phát" },
    { field: "deliveryNote", header: "Mô tả Phát" },
    { field: "note", header: "Ghi Chú Bill" },
    // { field: "shipmentStatusName", header: 'Tiến độ thực hiện đơn hàng' },
    // { field: "endPickTime", header: 'Thời gian xuất kho' },
    // { field: "endReturnTime", header: 'Thời gian giao hàng thành công', typeFormat: "date", formatString: 'YYYY/MM/DD HH:mm' },
    // { field: "realRecipientName", header: 'Người nhận hàng' },
    { field: "endReturnTime", header: 'Hoàn hàng',  typeFormat: "date", formatString: 'YYYY/MM/DD' },
    { field: "returnReason", header: 'Lý do hoàn hàng' },
    { field: "deliveryWhenOne", header: 'Thời gian giao hàng lần 1' },
    { field: "deliveryReasonOne", header: 'Lý do ko giao được lần 1' },
    { field: "deliveryWhenTwo", header: 'Thời gian giao hàng lần 2' },
    { field: "deliveryReasonTwo", header: 'Lý do ko giao được lần 2' },
    { field: "deliveryWhenThree", header: 'Thời gian giao hàng lần 3' },
    { field: "deliveryReasonThree", header: 'Lý do ko giao được lần 3' },
    { field: "realRecipientName", header: 'Người ký nhận' },
    // { field: "isReturn", header: 'Hoàn hàng' },
    // { field: "kmNumber", header: 'Khoản cách VSVX', typeFormat: "number" },
    // { field: "remoteAreasPrice", header: 'Phụ Phí VSVX', typeFormat: "number" },
    // { field: "totalPricePay", header: 'Tổng cộng phí DV', typeFormat: "number", sumField: "sumTotalPricePay" },
  ];
  //

  //============================
  //END 
  //============================

  ngOnInit() {
    this.initData();
    console.log(this.dateRange);
  }

  async initData() {
    this.provinces = await this.provinceService.getAllSelectModelAsync();
    this.provinces.splice(0,1)
    this.shipmentFilterViewModel.OrderDateFrom = this.dateRange.start.hour(0).minute(0).second(1).format("YYYY/MM/DD HH:mm");
    this.shipmentFilterViewModel.OrderDateTo = this.dateRange.end.hour(23).minute(59).second(0).format("YYYY/MM/DD HH:mm");
    this.loadShipment();
  }

  //======== BEGIN METHOD ListReceiveMoney ======= 

  async loadShipmentPaging() {

    // this.shipmentFilterViewModel.ShipmentNumber = null;
    // this.shipmentFilterViewModel.OrderDateFrom = this.selectedDateFrom;
    // this.

    // await this.shipmentService.postByTypeAsync(this.shipmentFilterViewModel).then(x => {
    //   if (x.isSuccess) {
    //     let data = x.data as Shipment[];
    //     this.listData = data.reverse();
    //     this.totalRecords = x.dataCount;
    //     this.sumTotalReceive();
    //   }
    // });
    this.shipmentFilterViewModel.ToProvinceIds = this.selectedToProvince.toString()
    await this.shipmentService.getReportListShipment(this.shipmentFilterViewModel).then(x => {
      if (x.isSuccess) {
        let data = x.data as Shipment[];
        this.listData = data.reverse();
        if (this.listData && this.listData.length > 0) this.totalRecords = this.listData[0].totalCount;
        else this.totalRecords = 0;
        this.sumTotalReceive();
      }
    });
  }

  loadShipment() {
    this.loadShipmentPaging();
    this.loadFilter();
  }

  loadFilter() {
    this.loadProvinceLS();
    this.loadSenderLS();
    this.loadServiceLS();
    this.loadPaymentTypeLS();
    this.loadShipmentStatusLS();
    this.loadHub();
  }

  loadLazy(event: LazyLoadEvent) {
    this.event = event;
    setTimeout(() => {
      if (this.listData) {

        this.listData.sort((a, b) => FilterUtil.compareField(a, b, event.sortField) * event.sortOrder);
      }
    }, 250);
  }

  refresh() {
    this.txtShipmentNumber = "";
    this.customer = "";

    this.selectedPaymentTypeLS = 0;
    this.selectedServicesLS = 0;
    this.selectedStatusLS = 0;
    this.toSelectedProvinceLS = 0;
    this.fromSelectedProvinceLS = 0;
    this.fromSelectedSenderLS = 0;

    this.shipmentFilterViewModel = new ShipmentFilterViewModel();

    this.shipmentFilterViewModel.Cols = this.includes;
    this.shipmentFilterViewModel.Type = ShipmentTypeHelper.isreturn;
    this.shipmentFilterViewModel.OrderDateFrom = this.dateRange.start.hour(0).minute(0).second(1).format("YYYY/MM/DD HH:mm");
    this.shipmentFilterViewModel.OrderDateTo = this.dateRange.end.hour(23).minute(59).second(0).format("YYYY/MM/DD HH:mm");
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.PageSize = this.rowPerPage;
    this.shipmentFilterViewModel.groupStatusId = 12;

    this.loadShipment();
  }

  async exportCSV(dt: DataTable) {
    if (dt) {
      let fileName = "BAO_CAO_HANG_HOAN.xlsx";
      if (this.totalRecords > 0) {
        if (this.totalRecords > this.maxRecordExport) {
          let data: any[] = [];
          let count = Math.ceil(this.totalRecords / this.maxRecordExport);
          let promise = [];
          for (let i = 1; i <= count; i++) {
            let clone = this.shipmentFilterViewModel;
            clone.PageNumber = i;
            clone.PageSize = this.maxRecordExport;

            promise.push(await this.shipmentService.getReportListShipment(clone));
          }
          Promise.all(promise).then(rs => {
            rs.map(x => {
              data = data.concat(x.data);
            });

            let dataE = data.reverse();
            var dataEX = ExportAnglar5CSV.ExportData(dataE, this.columnsExp, true, false);
            ExportAnglar5CSV.exportExcelBB(dataEX, fileName);
          });
        }
        else {
          let clone = this.shipmentFilterViewModel;
          clone.PageNumber = 1;
          clone.PageSize = this.totalRecords;

          this.shipmentService.getReportListShipment(clone).then(x => {
            let data = x.data.reverse();
            dt.value = data;
            var dataEX = ExportAnglar5CSV.ExportData(data, this.columnsExp, true, false);
            ExportAnglar5CSV.exportExcelBB(dataEX, fileName);
          });
        }
      }
      else {
        dt.exportCSV();
      }
    }
  }


  // Handler Filter
  // Date picker
  public selectedDate() {
    this.shipmentFilterViewModel.OrderDateFrom = SearchDate.formatToISODate(moment(this.shipmentFilterViewModel.OrderDateFrom).toDate());
    this.shipmentFilterViewModel.OrderDateTo = SearchDate.formatToISODate(moment(this.shipmentFilterViewModel.OrderDateTo).toDate());
  }

  public mainInput = {
    start: moment().subtract(0, "day"),
    end: moment()
  };

  public eventLog = "";

  public calendarEventsHandler(e: any) {
    this.eventLog += "\nEvent Fired: " + e.event.type;
  }
  //

  //
  loadProvinceLS() {
    this.fromProvincesLS = [];
    this.toProvincesLS = [];
    this.provinceService.getAllSelectModelAsync().then(x => {
      this.fromProvincesLS = x;
      this.toProvincesLS = x;
    });
  }

  loadHub() {
    this.fromHub = [];
    this.currentHub = [];
    this.hubService.getAllHubSelectModelAsync().then(x => {
      this.fromHub = x;
      this.currentHub = x;
    });
  }

  loadSenderLS() {
    // this.fromSendersLS = [];
    // this.customerService.getAllSelectModelAsync().then(x => {
    //   this.fromSendersLS = x;
    // })
  }

  loadServiceLS() {
    this.servicesLS = [];
    this.serviceService.getAllSelectModelAsync().then(x => {
      this.servicesLS = x;
    })
  }

  loadPaymentTypeLS() {
    this.paymentTypesLS = [];
    this.paymentTypeService.getAllSelectModelAsync().then(x => {
      this.paymentTypesLS = x;
    })
  }

  loadShipmentStatusLS() {
    this.statusesLS = [];
    this.shipmentStatusService.getAllSelectModelAsync().then(x => {
      this.statusesLS = x;
    })
  }
  //

  //
  changeShipmentNumber() {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.ShipmentNumber = this.txtShipmentNumber.trim();
    this.loadShipmentPaging();
  }

  search() {
    this.shipmentFilterViewModel.SearchText = this.txtSearchText;
    this.loadShipmentPaging();
  }

  changeFromProvince() {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.FromProvinceId = this.fromSelectedProvinceLS;
    this.loadShipmentPaging();
  }

  changeToProvince() {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.ToProvinceId = this.toSelectedProvinceLS;
    this.loadShipmentPaging();
  }

  changeSender() {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.SenderId = this.fromSelectedSenderLS;
    this.loadShipmentPaging();
  }

  changeShipmentStatus() {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.ShipmentStatusId = this.selectedStatusLS;
    this.loadShipmentPaging();
    // this.loadLazy(this.event);
  }

  changeServices() {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.ServiceId = this.selectedServicesLS;
    this.loadShipmentPaging();
    // this.loadLazy(this.event);
  }

  changePaymentType() {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.PaymentTypeId = this.selectedPaymentTypeLS;
    this.loadShipmentPaging();
    // this.loadLazy(this.event);
  }

  changeFromHub() {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.FromHubId = this.selectedFromHub;
    this.loadShipmentPaging();
    // this.loadLazy(this.event);
  }

  changeCurrentHub() {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.CurrentHubId = this.selectedCurrentHub;
    this.loadShipmentPaging();
    // this.loadLazy(this.event);
  }

  onPageChange(event: any) {
    this.shipmentFilterViewModel.PageNumber = event.first / event.rows + 1;
    this.shipmentFilterViewModel.PageSize = event.rows;
    this.loadShipmentPaging();
  }
  //
  //
  sumTotalReceive() {
    this.totalRecevice = this.listData.reduce((priceKeeping, shipment) => {
      return priceKeeping += (shipment.cod + shipment.totalPrice);
    }, 0)
  }

  filterCustomers(event) {
    let value = event.query;
    if (value.length >= 2) {
      this.customerService.getByCustomerCodeAsync(value, null, 10, 1, null).then(
        x => {
          if (x.isSuccess == true) {
            this.customers = [];
            this.filteredCustomers = [];
            let data = (x.data as Customer[]);
            data.map(m => {
              this.customers.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
              this.filteredCustomers.push(`${m.code} ${m.name}`);
            });
          }
        }
      );
    }
  }

  onSelectedCustomer() {
    let cloneSelectedCustomer = this.customer;
    let index = cloneSelectedCustomer.indexOf(" -");
    let customers: any;
    if (index !== -1) {
      customers = cloneSelectedCustomer.substring(0, index);
      cloneSelectedCustomer = customers;
    }
    this.customers.forEach(x => {
      let obj = x.data as Customer;
      if (obj) {
        if (cloneSelectedCustomer === x.label) {
          this.fromSelectedSenderLS = obj.id;
          this.changeSender();
        }
      }
    });
  }

  keyTabSender(event) {
    let value = event.target.value;
    if (value && value.length > 0) {
      this.customerService.getByCustomerCodeAsync(value, null, 10, 1, null).then(
        x => {
          if (x.isSuccess == true) {
            this.customers = [];
            this.filteredCustomers = [];
            let data = (x.data as Customer[]);
            data.map(m => {
              this.customers.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
              this.filteredCustomers.push(`${m.code} ${m.name}`);
            });
            let findCus: SelectModel = null;
            if (this.customers.length == 1) {
              findCus = this.customers[0];
            } else {
              findCus = this.customers.find(f => f.data.code == value || f.label == value);
            }
            if (findCus) {
              this.fromSelectedSenderLS = findCus.value;
              this.customer = findCus.label;
            }
            else {
              this.fromSelectedSenderLS = null
            }
            this.changeSender();
          } else {
            this.fromSelectedSenderLS = null;
            this.changeSender();
          }
        }
      );
    } else {
      this.fromSelectedSenderLS = null;
      this.changeSender();
    }
  }
}
