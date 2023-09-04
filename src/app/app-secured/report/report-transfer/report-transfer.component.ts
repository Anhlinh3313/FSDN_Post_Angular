import { Component, OnInit } from '@angular/core';
import { Constant } from '../../../infrastructure/constant';
import * as moment from 'moment';
import { Daterangepicker } from 'ng2-daterangepicker';
import { SelectItemGroup, SelectItem, LazyLoadEvent } from 'primeng/primeng';
import { HubService, ReportService } from '../../../services';
import { HubTransfer } from '../../../models/hubTransfer.model';
import { environment } from '../../../../environments/environment';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { MessageService } from 'primeng/components/common/messageservice';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-report-transfer',
  templateUrl: './report-transfer.component.html',
  styles: []
})
export class ReportTransferComponent extends BaseComponent implements OnInit {
  isAllowChild: boolean;
  selectedToDate: any;
  selectedFromDate: any;
  listData: HubTransfer[];
  receiverHub: SelectItem[];
  receiverHubs: SelectItemGroup[];
  selectedReceiverHub: number;

  constructor(
    private hubService: HubService,
    private reportService: ReportService,
    public messageService: MessageService,
    public permissionService: PermissionService, 
    public router: Router,
  ) {
    super(messageService,permissionService,router);
  }

  parentPage: string = Constant.pages.report.name;
  currentPage: string = Constant.pages.report.children.reportTransfer.name;
  totalRecords: number;
  dateRange = {
    start: moment(),
    end: moment()
  }

  columns: string[] = [
    "id",
    "code",
    "name",
    "totalListGoods",
    "totalListGoodsSend",
    "totalListGoodsSendWaiting",
    "totalListGoodsSendTransfering",
    "totalListGoodsSendComplete",
    "totalListGoodsSendCancel",
    "totalListGoodsSendTo",
    "totalListGoodsSendToWaiting",
    "totalListGoodsSendToTransfering",
    "totalListGoodsSendToComplete",
    "totalListGoodsSendToCancel",
    "totalListGoodsReceived",    
  ];

  async ngOnInit() {
    this.isAllowChild = false;
    const currentDate = moment(new Date()).format("YYYY/MM/DD");
    this.selectedFromDate = currentDate + "T01:00:00";
    this.selectedToDate = currentDate + "T23:59:59";
    this.selectedReceiverHub = null;
    this.loadGroupReceiverHubs();
    this.loadHubs();
  }

  async loadHubs() {
    const data = await this.reportService.getReportTransferAsync(this.isAllowChild, this.selectedReceiverHub, this.selectedFromDate, this.selectedToDate);
    if (data) {
      this.listData = data;
    }
  }

  loadLazy(event: LazyLoadEvent) {
    
  }

  async loadGroupReceiverHubs() {
    this.receiverHubs = [];          
    this.receiverHub = [];    
    this.selectedReceiverHub = null;
    const hubs = await this.hubService.getAllAsync();
    if (hubs) {
      hubs.forEach(element => {
        if (element.centerHubId) {
          // get SelectItemHubs with tag Title
          this.receiverHub.push({
            label: element.name, value: element.id, title: element.centerHubId.toString()
          });
        } else {
          this.receiverHub.push({
            label: element.name, value: element.id, title: element.id.toString()
          });
        }
      });
    }
    let groupOfCenterHubs = this.receiverHub.reduce((outData, item) => 
      // group all Hubs by title
      Object.assign(outData, { [item.title]:( outData[item.title] || [] ).concat(item) })
    , []);
    groupOfCenterHubs.forEach(x => {
      this.receiverHubs.push({
        label: `-- ${x[0].label} --`,
        items: x,
      });       
    });
  }

  eventLog = '';

  selectedDate(value: any, dateInput: any, type?: string) {
      dateInput.start = value.start;
      dateInput.end = value.end;
      this.selectedFromDate = dateInput.start.toJSON();
      this.selectedToDate = dateInput.end.toJSON();
      this.loadHubs();
  }

  calendarEventsHandler(e: any) {
    this.eventLog += '\nEvent Fired: ' + e.event.type;
  }

  changeReceiverHub() {
    this.loadHubs();
  }

  onViewAllowChild() {
    this.loadHubs();
  }
}
