import { Component, OnInit } from '@angular/core';
import { Constant } from '../../../infrastructure/constant';
import { LazyLoadEvent, SelectItem } from 'primeng/primeng';
import { Shipment } from '../../../models';
import { environment } from '../../../../environments/environment';
import { ShipmentFilterViewModel } from '../../../models/shipmentFilterViewModel';
import { ShipmentTypeHelper } from '../../../infrastructure/shipmentType.helper';
import { ShipmentService, CustomerService } from '../../../services';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/components/common/messageservice';

import * as moment from 'moment';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { SearchDate } from '../../../infrastructure/searchDate.helper';
import { DaterangepickerConfig } from 'ng2-daterangepicker';

@Component({
  selector: 'app-list-process-error',
  templateUrl: 'list-process-error.component.html',
  styles: []
})
export class ListProcessErrorComponent extends BaseComponent  implements OnInit {
  txtSearch: string;
  fromSenders: SelectItem[];
  eventLog = "";
  filterRows: Shipment[];
  datasource: Shipment[];
  listData: Shipment[];
  totalRecords: number;
  rowPerPage: number = 20;
  pageNum = 1;
  shipmentFilterViewModel: ShipmentFilterViewModel = new ShipmentFilterViewModel();
  event: LazyLoadEvent;
  hub = environment;
  parentPage: string = Constant.pages.transfer.name;
  currentPage: string = Constant.pages.transfer.children.listProcessError.name;
  // dateRangePicker
  mainInput = {
    start: moment().subtract(0, "day"),
    end: moment()
  };
  selectedSender: number;

  constructor (
    private customerService: CustomerService,
    private daterangepickerOptions: DaterangepickerConfig,
    private shipmentService: ShipmentService,
    protected messageService: MessageService,
    protected permissionService: PermissionService,
    protected router: Router
  ) {
    super(messageService, permissionService, router);

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
    this.initData();
    this.loadSender();
  }
  
  loadSender() {
    this.fromSenders = [];
    this.customerService.getAllSelectModelAsync().then(x => {
      this.fromSenders = x;
    });
  }

  initData() {
    let includes: string =
      Constant.classes.includes.shipment.listGoods + "," +
      Constant.classes.includes.shipment.package + "," +
      Constant.classes.includes.shipment.fromHub + "," +
      Constant.classes.includes.shipment.receiveHub + "," +
      Constant.classes.includes.shipment.toHub + "," +
      Constant.classes.includes.shipment.transferUser + "," +
      Constant.classes.includes.shipment.transferReturnUser + "," +
      Constant.classes.includes.shipment.shipmentStatus;

    const currentDate = moment(new Date()).format("YYYY/MM/DD");
    const orderDateFrom = currentDate + "T00:00:00";
    const orderDateTo = currentDate + "T23:59:59";

    this.shipmentFilterViewModel.Cols = includes;
    this.shipmentFilterViewModel.Type = ShipmentTypeHelper.processError;
    this.shipmentFilterViewModel.OrderDateFrom = orderDateFrom;
    this.shipmentFilterViewModel.OrderDateTo = orderDateTo;
    this.shipmentFilterViewModel.PageNumber = this.pageNum;
    this.shipmentFilterViewModel.PageSize = this.rowPerPage;
    //
    this.loadShipment();
  }

  async loadShipment() {
    await this.shipmentService.postByTypeAsync(this.shipmentFilterViewModel).then(x => {
      if (x) {
        const data = x.data as Shipment[];
        this.datasource = data.reverse();
        this.listData = this.datasource;
        this.totalRecords = x.dataCount;
      }
    });
  }

  loadLazy(event: LazyLoadEvent) {
    this.event = event;

    //imitate db connection over a network
    setTimeout(() => {
      if (this.datasource) {
        this.filterRows = this.datasource;

        //End Custom filter

        // sort data
        this.filterRows.sort(
          (a, b) =>
            FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        );
        this.listData = this.filterRows;

        // this.listData = filterRows.slice(event.first, (event.first + event.rows));
      }
    }, 250);
  }

  onPageChange(event: any) {
    this.shipmentFilterViewModel.PageNumber = event.first / event.rows + 1;
    this.shipmentFilterViewModel.PageSize = event.rows;
    setTimeout(() => {
      this.loadShipment();
    }, 0);
  }

  search(value) {
    this.shipmentFilterViewModel.SearchText = value;
    this.loadShipment();
  }

  calendarEventsHandler(e: any) {
    this.eventLog += "\nEvent Fired: " + e.event.type;
  }

  selectedDate(value: any, dateInput: any) {
    dateInput.start = value.start;
    dateInput.end = value.end;
    this.shipmentFilterViewModel.OrderDateFrom = SearchDate.formatToISODate(moment(value.start).toDate());
    this.shipmentFilterViewModel.OrderDateTo = SearchDate.formatToISODate(moment(value.end).toDate());
    this.loadShipment();
  }

  changeSender() {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.SenderId = this.selectedSender;
    this.loadShipment();
    // this.loadLazy(this.event);
  }

  refresh() {
    this.selectedSender = null;
    this.shipmentFilterViewModel.SenderId = null;
    this.txtSearch = null;
    this.loadShipment();
  }
}
