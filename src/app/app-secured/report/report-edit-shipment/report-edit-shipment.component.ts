import { Component, OnInit, TemplateRef } from '@angular/core';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
//
import { Constant } from '../../../infrastructure/constant';
import { LazyLoadEvent, SelectItem } from 'primeng/primeng';
import { UserService, ShipmentService, HubService, ReportService, CustomerService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { User, Hub, Customer, ShipmentVersion } from '../../../models/index';
import { PersistenceService } from 'angular-persistence'; 

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { environment } from '../../../../environments/environment';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { SelectModel } from '../../../models/select.model';
import { ReportPickupDetail } from '../../../models/reportPickupDetail.model';
import { ReportDeliveryDetail } from '../../../models/reportDeliveryDetail.model';
import { ReportDeliveryFail } from '../../../models/reportDeliveryFail.model';
import { SearchDate } from '../../../infrastructure/searchDate.helper';
import { ShipmentVersionFilterModel } from '../../../models/ShipmentVersionFilterModel.model';

@Component({
  selector: 'app-report-edit-shipment',
  templateUrl: './report-edit-shipment.component.html',
  styles: []
})
export class ReportEditShipmentComponent extends BaseComponent implements OnInit {
    hub = environment;
  isCompleted: boolean = false;
  textCompleted = "COD giảm dần";
  customers: any[];
  filteredCustomers: any[];
  customer: any;
  selectedCustomer: number;
    compare_data: ShipmentVersion = new ShipmentVersion(); 
    selected_data: ShipmentVersion = new ShipmentVersion(); 

    constructor(private modalService: BsModalService, private persistenceService: PersistenceService, protected messageService: MessageService,
        private shipmentService: ShipmentService,
        private hubService: HubService,
        private userService: UserService,
        private reportService: ReportService,
        public permissionService: PermissionService,
        public router: Router,
        public customerService : CustomerService,
    ) {
        super(messageService, permissionService, router);
    }

    parentPage: string = Constant.pages.report.name;
    currentPage: string = Constant.pages.report.children.reportEditShipment.name;

    wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'binary' };
    fileName: string = 'ShipmentVersion.xlsx';

    //
    sumOfTotalPickup: number;
    sumOfTotalPickupFail: number;
    sumOfTotalDelivery: number;
    sumOfTotalDeliveryFail: number;
    sumOfTotalReturn: number;

    //============================
    //BEGIN Danh sách bảng kê nộp tiền về TT/CN/T
    //============================
    rowPerPage = 20;
    totalRecords: number;
    columns: any[] = ["code", "fullName", "phoneNumber", "address",
        "hubName", "departmentName", "roleName", "totalPickup", "totalDelivery", "totalReturn"];
    datasource: ShipmentVersion[];
    listData: ShipmentVersion[];
    event: LazyLoadEvent;
    emps: SelectItem[];
    selectedEmp: User;
    selectedEmpId: any = null;
    hubs: SelectItem[];
    selectedHub: Hub;
    selectedHubId: any = null;
    public dateRange = {
        start: moment(),
        end: moment()
    }

    employee_2: any;
    employees_2: any;
    filteredEmployees_2: any;
    selectedEmployee_2: number;
    //============================
    //END Danh sách bảng kê nộp tiền về TT/CN/T
    //============================

    // Modal report
    bsModalRef: BsModalRef;
    lstReportPickupDetail: ReportPickupDetail[] = [];
    lstReportDeliveryDetail: ReportDeliveryDetail[] = [];
    lstReportDeliveryFail: ReportDeliveryFail[] = [];
    filterModel = new ShipmentVersionFilterModel();
    
    columnsExpBeta : any[]=[
        { field: 'rowNum', header: 'STT' },
        { field: 'version', header: 'VERSION' },
        { field: 'reShipmentNumber', header: 'Mã đơn hàng' },
        { field: 'receiverName', header: 'Tên người nhận' },
        { field: 'receiverPhone', header: 'Số điện thoại' },
        { field: 'companyTo', header: 'Công ty nhận' },
        { field: 'shippingAddress', header: 'Địa chỉ nhận' },
        { field: 'addressNoteTo', header: 'Địa chỉ chi tiết' },
        { field: 'toDistrictName', header: 'Quận huyện' },
        { field: 'fromHubName', header: 'Trạm phát' },
        { field: 'weight', header: 'Trọng lượng' },
        { field: 'calWeight', header: 'Trọng lượng quy đổi' },
        { field: 'height', header: 'Chiều cao' },
        { field: 'length', header: 'Độ dài' },
        { field: 'width', header: 'Chiều rộng' },
        { field: 'fuelPrice', header: 'PPXD' },
        { field: 'totalDVGT', header: 'Tổng DVGT' },
        { field: 'otherPrice', header: 'Phụ phí khác' },
        { field: 'vatPrice', header: 'VAT' },
        { field: 'totalPrice', header: 'Tổng cước phí' },
        { field: 'insured', header: 'Khai giá' }, 
    ]
     
    selectedDateFrom =  SearchDate.formatToISODate(moment(new Date()).toDate());;
    selectedDateTo = SearchDate.formatToISODate(moment(new Date()).toDate());
    ngOnInit() {
        this.initData();
    }

    async initData() {
        // this.selectedDateFrom = 
        // this.selectedDateTo = await ; 
        this.loadFilter();
        this.loadShipment();
    }
    //======== BEGIN METHOD ListReceiveMoney ======= 
    async loadShipment() {
        this.filterModel.dateFrom = this.selectedDateFrom;
        this.filterModel.dateTo = this.selectedDateTo;
        let x = await this.reportService.getReportShipmentVersion(this.filterModel).toPromise();
        this.datasource = x.data as ShipmentVersion[];
        this.totalRecords = this.datasource.length;
        this.listData = this.datasource.slice(0, this.rowPerPage);
        //
        // if (this.datasource) {
        //     this.sumTotalEmp();
        // }
    }
    onChangeIsCompleted(){
      if (this.isCompleted == true) {
        this.textCompleted = "COD tăng dần";
        this.isCompleted = false;
        this.filterModel.isShortByCOD = false;
        // this.LoadListCompensation(); 
        this.loadShipment();
        return true;
      }
      if (this.isCompleted == false) {
        this.textCompleted = "COD giảm dần";
        this.isCompleted = null;
        this.filterModel.isShortByCOD = true;
        // this.LoadListCompensation(); 
        this.loadShipment();
        return false;
      }
    }
    

    loadLazy(event: LazyLoadEvent) {
        this.event = event;
        setTimeout(() => {
            if (this.datasource) {
                var filterRows;
                if (event.filters.length > 0)
                    filterRows = this.datasource.filter(x => FilterUtil.filterField(x, event.filters));
                else
                    filterRows = this.datasource.filter(x => FilterUtil.gbFilterFiled(x, event.globalFilter, this.columns));
                if (this.selectedHub) {
                    filterRows = filterRows.filter(
                        x => x.hubId === this.selectedHub
                    );
                }
                if (this.selectedEmp) {
                    filterRows = filterRows.filter(
                        x => x.id === this.selectedEmp
                    );
                }
                filterRows.sort((a, b) => FilterUtil.compareField(a, b, event.sortField) * event.sortOrder);
                this.listData = filterRows.slice(event.first, (event.first + event.rows))
                this.totalRecords = filterRows.length;
            }
        }, 250);
    }
    async loadFilter() {
        this.selectedHub = null;
        //this.hubs = [{ label: "Chọn tất cả", value: null }];
        this.hubs = await this.hubService.getAllHubSelectModelAsync();
        //
    }
    async loadUser(hubId: any) {
        this.selectedEmp = null;
        this.emps = await this.userService.getSelectModelAllEmpByHubIdAsync(hubId);
      
    }
    refresh() {
        this.loadShipment();
    }
    changeHub() {
        if (this.selectedHub) this.selectedHubId = this.selectedHub;
        else this.selectedHubId = null;
        this.filterModel.hubId = this.selectedHubId;
        this.loadUser(this.selectedHubId);
        this.loadShipment();
    }
    changeUser() {
        if (this.selectedEmp) this.selectedEmpId = this.selectedEmp;
        else this.selectedEmpId = null;
        this.filterModel.empId = this.selectedEmpId;
        this.loadShipment();
    }
    public eventLog = '';

    public selectedDate() {
        this.selectedDateFrom = SearchDate.formatToISODate(moment(this.selectedDateFrom).toDate());
        this.selectedDateTo = SearchDate.formatToISODate(moment(this.selectedDateTo).toDate());
        this.loadShipment();
    }

    private applyDate(value: any, dateInput: any) {
        dateInput.start = value.start;
        dateInput.end = value.end;
    }

    public calendarEventsHandler(e: any) {
        this.eventLog += '\nEvent Fired: ' + e.event.type;
    }
 
    filterCustomers(event) {
      let value = event.query;
      if (value.length >= 1) {
          this.customerService.getByCustomerCodeAsync(value, null, 10, 1, null).then(
              x => {
                  if (x.isSuccess == true) {
                      this.customers = [];
                      this.filteredCustomers = [];
                      this.filteredCustomers.push("-- Chọn tất cả --");
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
    this.customers.forEach(x => {
        let obj = x.data as Customer;
        if (obj) {
            if (cloneSelectedCustomer === x.label) {
                this.selectedCustomer = obj.id;
            }
        } else {
            this.selectedCustomer = null;
        }
    });
    // this.changeCustomer();
    this.filterModel.senderId = this.selectedCustomer;
    this.loadShipment();
}
    s2ab(s: string): ArrayBuffer {
        const buf: ArrayBuffer = new ArrayBuffer(s.length);
        const view: Uint8Array = new Uint8Array(buf);
        for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }
 
    //#region Report
    async openModel(template: TemplateRef<any>,data) { 
        if(data){
        this.selected_data = data;
        this.compare_data = await this.shipmentService.getCompareShipmentVersion(data.id); 
        }
        this.bsModalRef = this.modalService.show(template, { class: "inmodal animated bounceInRight modal-xlg" });
    } 
    
    searchByShipmentNumber(value) {
      // this.shipmentFilterViewModel.ShipmentNumber = value;
      this.filterModel.shipmentNumber = value;
      this.loadShipment();
  }
  exportCSV() {
        let fileName = "BAO_CAO_CHI_PHI";
        let clone = this.filterModel;
        clone.customExportFile.fileNameReport = fileName;
        clone.customExportFile.columnExcelModels = this.columnsExpBeta; 
        this.reportService.getReportShipmentVersionExcel(clone);
    
    }

} 