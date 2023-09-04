import { Component, OnInit, ViewChild } from "@angular/core";
import { environment } from "../../../environments/environment";
import { RequestShipmentService, ShipmentService, HubService, ReportService, AuthService } from "../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { Shipment } from "../../models/shipment.model";
import { Constant } from "../../infrastructure/constant";
import { TotalNewRequestComponent } from "./pickup/total-new-request/total-new-request.component";
import { BaseComponent } from "../../shared/components/baseComponent";
import { TotalAssignedPickupComponent } from "./pickup/total-assigned-pickup/total-assigned-pickup.component";
import { TotalPickingComponent } from "./pickup/total-picking/total-picking.component";
import { TotalWaitRoutingComponent } from "./transfer/total-wait-routing/total-wait-routing.component";
import { TotalRoutedComponent } from "./transfer/total-routed/total-routed.component";
import { TotalTransferPOFromComponent } from "./transfer/total-transfer-POFrom/total-transfer-pofrom.component";
import { TotalTransferPOToComponent } from "./transfer/total-transfer-POTo/total-transfer-poto.component";
import { TotalDeliveryComponent } from "./delivery/total-delivery/total-delivery.component";
import { TotalUncompleteComponent } from "./delivery/total-uncomplete/total-uncomplete.component";
import { TotalCompleteComponent } from "./delivery/total-complete/total-complete.component";
import { TotalReturnComponent } from "./return/total-return/total-return.component";
import { TotalInventoryComponent } from "./inventory/total-inventory/total-inventory.component";
import { TotalWeightInventoryComponent } from "./inventory/total-weight-inventory/total-weight-inventory.component";
import { TotalUnprocessedComponent } from "./inventory/total-unprocessed/total-unprocessed.component";
import { ShipmentTypeHelper } from "../../infrastructure/shipmentType.helper";
import { TotalPickupCompleteComponent } from "./pickup/total-pickup-complete/total-pickup-complete.component";
import { TotalPickedComponent } from "./pickup/total-picked/total-picked.component";
import { PermissionService } from "../../services/permission.service";
import { Router } from "@angular/router";
import { ShipmentFilterViewModel } from "../../models/shipmentFilterViewModel";
import * as moment from 'moment';
import { DaterangepickerConfig } from "ng2-daterangepicker";
import { SelectModel } from "../../models/select.model";
import { DashboardFilter } from "../../models/dashboardFilter.model";
import { DashboardDeliveryAndReturn } from "../../models/dashboardDeliveryAndReturn.model";
import { DashboardTransfer } from "../../models/dashboardTransfer.model";
import { DashboardPickup } from "../../models/dashboardPickup.model";
import { DashboardService } from "../../models/dashboardService.model";
import { SearchDate } from "../../infrastructure/searchDate.helper";

@Component({
  selector: "welcome",
  templateUrl: "welcome.component.html",
  styles: []
})
export class WelcomeComponent extends BaseComponent implements OnInit {
  totalNewRequest: number;
  interval: any;
  countNum: number = 300;

  constructor(
    protected messageService: MessageService,
    public permissionService: PermissionService,
    public router: Router,
    private reportService: ReportService,
    private daterangepickerOptions: DaterangepickerConfig,
    private hubService: HubService,
    private authService: AuthService
  ) {
    super(messageService, permissionService, router);

    daterangepickerOptions.settings = {
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

  // Page
  parentPage: string = Constant.pages.dashBoard.name;
  //

  // Data
  filterModel: DashboardFilter = new DashboardFilter();

  dashboardPickup: DashboardPickup = new DashboardPickup();
  dashboardTransfer: DashboardTransfer = new DashboardTransfer();
  dashboardDeliveryAndReturn: DashboardDeliveryAndReturn = new DashboardDeliveryAndReturn();
  dashboardService: DashboardService = new DashboardService();
  //

  // Chart
  option = {
    legend: {
      display: false
    },
    title: {
      display: true,
      fontSize: 14,
      fontColor: 'red',
      text: ''
    },
  }

  optionChartDashboardPickup = JSON.parse(JSON.stringify(this.option));
  optionChartDashboardTransfer = JSON.parse(JSON.stringify(this.option));;
  optionChartDashboardDeliveryAndReturn = JSON.parse(JSON.stringify(this.option));;
  optionChartDashboardService = JSON.parse(JSON.stringify(this.option));;

  dataChartDashboardPickup = {};
  dataChartDashboardTransfer = {};
  dataChartDashboardDeliveryAndReturn = {};
  dataChartDashboardService = {};
  //

  // Select
  lstCenterHubs: SelectModel[] = [];
  lstPoHubs: SelectModel[] = [];
  lstHubs: SelectModel[] = [];

  selectedCenterHub: number;
  selectedPoHub: number;
  selectedHub: number;
  //

  // Calendar
  mainInput = {
    start: moment().subtract(0, "day"),
    end: moment()
  };

  eventLog = '';
  //

  async ngOnInit() {
    this.optionChartDashboardPickup.title.text = "Thống kê lấy hàng";
    this.optionChartDashboardTransfer.title.text = "Thống kê trung chuyển";
    this.optionChartDashboardDeliveryAndReturn.title.text = "Thống kê giao/trả hàng";
    this.optionChartDashboardService.title.text = "Thống kê doanh thu";
    this.optionChartDashboardService.legend.display = true;

    await this.getAccountInfo();
    this.loadData();
    this.loadCenterHub();
  }

  ngAfterViewInit() {
    this.setInterval();
  }

  setInterval() {
    this.interval = setInterval(() => {
      this.countNum -= 1;
      if (this.countNum === 0) {
        this.loadData();
        this.countNum = 30;
      }
    }, 1000);
  }

  //#region Load data
  async getAccountInfo() {
    let data = await this.authService.getAccountInfoAsync();
    if (data) {
      this.filterModel.hubId = data.hubId;
      if (!data.hub.centerHubId) {
        this.selectedCenterHub = data.hubId;
        this.loadPoHub();
      }
      else {
        this.selectedCenterHub = data.hub.centerHubId;
        this.loadPoHub();
        if (!data.hub.poHubId) {
          this.selectedPoHub = data.hubId;
          this.loadHub();
        }
        else {
          this.selectedPoHub = data.hub.poHubId;
          this.loadHub();
          this.selectedHub = data.hubId;
        }
      }
    }
  }

  async loadData() {
    this.dashboardPickup = await this.reportService.getDashboardPickup(this.filterModel);
    this.dashboardTransfer = await this.reportService.getDashboardTransfer(this.filterModel);
    this.dashboardDeliveryAndReturn = await this.reportService.getDashboardDeliveryAndReturn(this.filterModel);
    this.dashboardService = await this.reportService.getDashboardService(this.filterModel);

    // Pickup
    this.dataChartDashboardPickup = {
      labels: ["Yêu cầu mới", "Đang lấy", "Đã lấy", "Hủy lấy"],
      datasets: [
        {
          labels: ["Yêu cầu mới", "Đang lấy", "Đã lấy", "Hủy lấy"],
          backgroundColor: ["#4A86E8", "#F1C232", "#4FBD22", "#5B0F00"],
          borderColor: ["#4A86E8", "#F1C232", "#4FBD22", "#5B0F00"],
          data: [this.dashboardPickup.totalNewPickup, this.dashboardPickup.totalPicking, this.dashboardPickup.totalPickupComplete, this.dashboardPickup.totalPickCancel]
        },
      ]
    };
    //

    // Transfer
    this.dataChartDashboardTransfer = {
      labels: ['Chờ trung chuyển', 'Đã phân trung chuyển', 'Đang trung chuyển', 'Đang đến'],
      datasets: [
        {
          backgroundColor: ['#4A86E8', '#F1C232', '#4FBD22', '#5B0F00'],
          borderColor: ['#4A86E8', '#F1C232', '#4FBD22', '#5B0F00'],
          data: [this.dashboardTransfer.totalReadyToTransfer, this.dashboardTransfer.totalAssignEmployeeTransfer, this.dashboardTransfer.transferring, this.dashboardTransfer.totalDelivering]
        },
      ]
    };
    //

    // Transfer
    this.dataChartDashboardDeliveryAndReturn = {
      labels: ['Chờ giao', 'Giao không thành công', 'Giao thành công', 'Trả thành công'],
      datasets: [
        {
          labels: ["1", "2", "3", "4"],
          backgroundColor: ['#4A86E8', '#F1C232', '#4FBD22', '#5B0F00'],
          borderColor: ['#4A86E8', '#F1C232', '#4FBD22', '#5B0F00'],
          data: [this.dashboardDeliveryAndReturn.totalReadyToDelivery, this.dashboardDeliveryAndReturn.totalDeliveryFail, this.dashboardDeliveryAndReturn.totalDeliveryComplete, this.dashboardDeliveryAndReturn.totalReturnComplete]
        },
      ]
    };
    //

    // Service
    this.dataChartDashboardService = {
      labels: ['CPN', 'HT', 'DB', '48H', 'Giá rẻ', 'Tiết kiệm', 'Khác'],
      datasets: [
        {
          labels: ['#4A86E8', '#FF9900', '#38761D', '#0000FF', '#783F04', '#FFD966', '#999999'],
          backgroundColor: ['#4A86E8', '#FF9900', '#38761D', '#0000FF', '#783F04', '#FFD966', '#999999'],
          borderColor: ['#4A86E8', '#FF9900', '#38761D', '#0000FF', '#783F04', '#FFD966', '#999999'],
          data: [
            this.dashboardService.totalPriceCPN,
            this.dashboardService.totalPriceHT,
            this.dashboardService.totalPriceDB,
            this.dashboardService.totalPrice48,
            this.dashboardService.totalPriceGR,
            this.dashboardService.totalPriceTK,
            this.dashboardService.totalPriceKhac
          ]
        },
      ],
    };
    //
  }
  //#endregion

  // Filter
  async loadCenterHub() {
    this.lstCenterHubs = await this.hubService.getSelectModelCenterHubAsync();
  }

  async loadPoHub() {
    this.lstPoHubs = await this.hubService.getSelectModelPoHubByCenterIdAsync(this.selectedCenterHub);
    this.lstHubs = [];
    this.selectedPoHub = null;
    this.selectedHub = null;
  }

  async loadHub() {
    this.lstHubs = await this.hubService.getSelectModelStationHubByPoIdAsync(this.selectedPoHub);
    this.selectedHub = null;
  }

  changeFilter() {
    this.filterModel.hubId = this.selectedHub ? this.selectedHub : this.selectedPoHub ? this.selectedPoHub : this.selectedCenterHub ? this.selectedCenterHub : null;
    this.loadData();
  }
  //

  //#region Calendar
  public selectedDate(value: any, dateInput: any) {
    dateInput.start = value.start;
    dateInput.end = value.end;

    this.filterModel.fromDate = SearchDate.formatToISODate(value.start);
    this.filterModel.toDate = SearchDate.formatToISODate(value.end);

    this.changeFilter();
  }

  public calendarEventsHandler(e: any) {
    this.eventLog += '\nEvent Fired: ' + e.event.type;
  }
  //#endregion

  ngOnDestroy() {
    clearInterval(this.interval);
  }
}
