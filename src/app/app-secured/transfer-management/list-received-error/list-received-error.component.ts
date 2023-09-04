import { Component, OnInit } from '@angular/core';
import { Constant } from '../../../infrastructure/constant';
import { LazyLoadEvent, SelectItem } from 'primeng/primeng';
import { Shipment } from '../../../models';
import { environment } from '../../../../environments/environment';
import { ShipmentTypeHelper } from '../../../infrastructure/shipmentType.helper';
import { ShipmentService, CustomerService, ListGoodsService } from '../../../services';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/components/common/messageservice';

import * as moment from 'moment';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { SearchDate } from '../../../infrastructure/searchDate.helper';
import { DaterangepickerConfig } from 'ng2-daterangepicker';
import { ListGoodsTypeHelper } from '../../../infrastructure/listGoodsType.helper';
import { ListGoods } from '../../../models/listGoods.model';
import { ListGoodsFilterViewModelByType } from '../../../models/listGoodsFilterViewModelByType.model';
import { StringHelper } from '../../../infrastructure/string.helper';

@Component({
  selector: 'app-list-received-error',
  templateUrl: 'list-received-error.component.html',
  styles: []
})
export class ListReceivedErrorComponent extends BaseComponent  implements OnInit {
  riderLRETs: SelectItem[];
  selectedRiderLRET: string;
  txtSearch: string;
  fromSenders: SelectItem[];
  eventLog = "";
  filterRows: ListGoods[];
  datasource: ListGoods[];
  listData: ListGoods[];
  totalRecords: number;
  rowPerPage: number = 20;
  pageNum = 1;
  listGoodsFilterViewModelByType: ListGoodsFilterViewModelByType = new ListGoodsFilterViewModelByType();
  event: LazyLoadEvent;
  hub = environment;
  parentPage: string = Constant.pages.transfer.name;
  currentPage: string = Constant.pages.transfer.children.listReceivedError.name;
  // dateRangePicker
  mainInput = {
    start: moment().subtract(0, "day"),
    end: moment()
  };
  selectedSender: number;

  constructor (
    private listGoodsService: ListGoodsService,
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
  }

  initData() {
    let includes: string =
    Constant.classes.includes.listGoods.fromHub + "," +
    Constant.classes.includes.listGoods.emp;

  const currentDate = moment(new Date()).format("YYYY/MM/DD");
  const orderDateFrom = currentDate + "T00:00:00";
  const orderDateTo = currentDate + "T23:59:59";

  this.listGoodsFilterViewModelByType.Cols = includes;
  this.listGoodsFilterViewModelByType.Type = ListGoodsTypeHelper.receivedErrorTransfer;
  this.listGoodsFilterViewModelByType.OrderDateFrom = orderDateFrom;
  this.listGoodsFilterViewModelByType.OrderDateTo = orderDateTo;
  this.listGoodsFilterViewModelByType.PageNumber = this.pageNum;
  this.listGoodsFilterViewModelByType.PageSize = this.rowPerPage;
    this.loadListRecceivedErrorTransfer();
  }

  async loadListRecceivedErrorTransfer() {
    await this.listGoodsService.postByTypeAsync(this.listGoodsFilterViewModelByType).then(x => {
      if (x) {
        const data = x.data as ListGoods[];
        this.datasource = data.reverse();
        this.datasource = this.datasource.map(obj => {
          // get tpl and transportType
          if (obj.transportType) {
            if (!obj.tpl) {
              const transportTypeName = obj.transportType.name;
              obj.transportTypeFullName = transportTypeName + " (NB)";
            } else {
              const transportTypeName = obj.transportType.name;
              const tplCode = obj.tpl.code;
              obj.transportTypeFullName = tplCode + " - " + transportTypeName;
            }
          } else {
            obj.transportTypeFullName = null;
          }
          // get receivedShipmentError from note
          const note = obj.note;
          if (StringHelper.isNullOrEmpty(note)) {
            obj.receivedShipmentErrors = null;
          } else {
            const indexError = note.lastIndexOf("Vận đơn lỗi:");
            if (indexError !== -1) {
              // cắt lấy mã vận đơn lỗi từ note của listGoods
              const strShipmentNumberErrors: string = note.substring(indexError + 12).trim();
              if (strShipmentNumberErrors !== "") {
                obj.receivedShipmentErrors = strShipmentNumberErrors;
              } else {
                obj.receivedShipmentErrors = null;
              }
            }
          }

          return obj;
        });
        this.listData = this.datasource;
        this.totalRecords = x.dataCount;
        // this.loadFilterLRET();
      }
    });
  }

  // loadFilterLRET() {

  // }

  // changeFilterLRETRider() {
  //   this.loadLazy(this.event);
  // }

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
    this.listGoodsFilterViewModelByType.PageNumber = event.first / event.rows + 1;
    this.listGoodsFilterViewModelByType.PageSize = event.rows;
    setTimeout(() => {
      this.loadListRecceivedErrorTransfer();
    }, 0);
  }

  search(value) {
    this.listGoodsFilterViewModelByType.SearchText = value;
    this.loadListRecceivedErrorTransfer();
  }

  calendarEventsHandler(e: any) {
    this.eventLog += "\nEvent Fired: " + e.event.type;
  }

  selectedDate(value: any, dateInput: any) {
    dateInput.start = value.start;
    dateInput.end = value.end;
    this.listGoodsFilterViewModelByType.OrderDateFrom = SearchDate.formatToISODate(moment(value.start).toDate());
    this.listGoodsFilterViewModelByType.OrderDateTo = SearchDate.formatToISODate(moment(value.end).toDate());
    this.loadListRecceivedErrorTransfer();
  }

  refresh() {
    this.txtSearch = null;
    this.loadListRecceivedErrorTransfer();
  }
}
