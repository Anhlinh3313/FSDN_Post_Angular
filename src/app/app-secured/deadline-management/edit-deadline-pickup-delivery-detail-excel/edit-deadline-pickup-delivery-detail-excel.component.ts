import { Component, OnInit, TemplateRef, EventEmitter, Output } from '@angular/core';
import { ViewChild } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
//
import { Constant } from '../../../infrastructure/constant';
import { PriceServiceDetailExcelViewModel, PriceUploadExcelViewModel } from '../../../view-model';
import { PriceService, Area, Weight, PriceList, PriceServiceDetail, DeadlinePickupDeliveryDetailExcel, Hub, DeadlinePickupDelivery, DeadlinePickupDeliveryDetail, Service, KPIShipmentDetailModel, District } from '../../../models';
import { LazyLoadEvent, CalendarModule, Calendar } from 'primeng/primeng';
import { BaseModel } from '../../../models/base.model';
import { PriceServiceService, AreaService, WeightService, PriceServiceDetailService, PriceListService, DeadlinePickupDeliveryDetailService, HubService, DeadlinePickupDeliveryService, ServiceService, DistrictService, WardService, AuthService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { Message } from 'primeng/components/common/message';
import { ResponseModel } from '../../../models/response.model';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { DataFilterViewModel } from '../../../view-model/index';
import { BaseComponent } from '../../../shared/components/baseComponent';

//
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { DeadlinePickupDeliveryDetailExcelViewModel } from '../../../models/deadlinePickupDeliveryDetailExcel.model';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { SelectModel } from '../../../models/select.model';
import { ColumnExcel, ColumnNameExcel } from '../../shipment-management/create-shipment-excel/create-shipment-excel.component';

import { interval } from 'rxjs';
import { KPIShipmentServices } from '../../../services/KPIShipment.service';
import { KPIShipmentModel } from '../../../models/KPIShipment.model';
import { KPIShipmentDetailServices } from '../../../services/KPIShipmentDetail.service';
import { ExportExcelHelper } from '../../../infrastructure/exportExcel.helper.';
type AOA = Array<Array<any>>;

function s2ab(s: string): ArrayBuffer {
  const buf: ArrayBuffer = new ArrayBuffer(s.length);
  const view: Uint8Array = new Uint8Array(buf);
  for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}
@Component({
  selector: 'app-edit-deadline-pickup-delivery-detail-excel',
  templateUrl: 'edit-deadline-pickup-delivery-detail-excel.component.html',
  styles: []
})
export class EditDeadlinePickupDeliveryDetailExcelComponent extends BaseComponent implements OnInit {
  @ViewChild("myInputFiles") myInputFilesVariable: any;
  targetDataTransfer: DataTransfer;
  constructor(private modalService: BsModalService,
    protected messageService: MessageService,
    private kpiShipmentServices: KPIShipmentServices,
    private kpiShipmentDetailServices: KPIShipmentDetailServices,
    public permissionService: PermissionService, 
    public districtService: DistrictService, 
    public wardService: WardService, 
    public authService: AuthService, 
    public router: Router,
  ) {
    super(messageService,permissionService,router);
  }
  //
  parentPage: string = Constant.pages.deadline.name;
  currentPage: string = Constant.pages.deadline.children.editDeadlineUploadExcelManagement.name;
  //
  deadlinePickupDeliverys: SelectModel[] = [];
  selectedDeadlinePickupDelivery: number;
  //
  deadlinePickupDeliveryDetail: DeadlinePickupDeliveryDetail[];
  //
  areas: Area[];
  //
  services: Service[];
  datas: AOA = [];
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'binary' };
  fileName: string = 'SimpleExcel.xlsx';
  //
  kqiShipments: SelectModel[] = [];
  selectedKPIShipment: number;
  kPIShipmentDetail: any[] = [];
  districts: District[];
  pageNumberKPIDetail: number = 1;
  pageSizeKPIDetail: number = 20;
  onPageChangeEvent: any;
  //
  countSuccesss = 0;
  countError = 0;
  dataKPIShipmentDetailError: any = [];
  fileExcelName: string;
  value = 0;
  isLoading: HTMLElement;
  loading: HTMLElement;
  isBlockquote: HTMLElement;
  isDisabled: boolean;
  progressbarValue = 100;
  curSec = 0;
  dataKPIShipmentDetail = [];
  totalCount = 0;
  columns: ColumnExcel[] = [];
  columnsName: string[] = [
    'code',
    'name',
    'districtId',
    'wardId',
    'vehicle',
    'target_delivery_time',
    'kpi_shipment',
  ];
  totalRecords: number;

  ngOnInit() {
    this.fileExcelName = 'Chọn tập tin';
    this.declareColumn();
    this.getKPIShipment();
  }
  async getKPIShipment() {
    this.kqiShipments = await this.kpiShipmentServices.getKPIShipmentSelectModelAsync();
  }

  SaveFile() {
    if (this.kPIShipmentDetail && this.kPIShipmentDetail.length > 0) {
      let columnExport: any = [
        { field: 'kpiShipmentId', header: 'kpiShipmentId' },
        { field: 'code', header: 'code' },
        { field: 'name', header: 'name' },
        { field: 'districtId', header: 'districtId' },
        { field: 'wardId', header: 'wardId' },
        { field: 'vehicle', header: 'vehicle' },
        { field: 'targetDeliveryTime', header: 'target_delivery_time' },
      ]
      let dataEx = ExportExcelHelper.ExportData(this.kPIShipmentDetail, columnExport);
      ExportExcelHelper.exportXLSX(dataEx, 'DANH_SACH_SUA_CHI_TIET_DEADLINE');
    }
  }

  onChangeKPIShipment() {
    if (!this.selectedKPIShipment) {
      this.kPIShipmentDetail = [];
      return;
    }
    this.getKPIShipmentDetail();
  }
  async getKPIShipmentDetail() {
    const results = await this.kpiShipmentDetailServices.getKPIShipmentDetail(this.selectedKPIShipment, this.pageNumberKPIDetail, this.pageSizeKPIDetail).toPromise();
    this.kPIShipmentDetail = results.data as any[];
  }
  onPageChange(event: any) {
    this.onPageChangeEvent = event;
    this.pageNumberKPIDetail = this.onPageChangeEvent.first / this.onPageChangeEvent.rows + 1;
    this.pageSizeKPIDetail = this.onPageChangeEvent.rows;
    this.getKPIShipmentDetail();
  }
  //

  onFileChange(evt: any) {
    this.fileName = 'Chọn tệp tin';
    /* wire up file reader */
    // tslint:disable-next-line:no-angle-bracket-type-assertion
    const target: DataTransfer = <DataTransfer>(evt.target);
    this.targetDataTransfer = target;

    const reader: FileReader = new FileReader();
    if (target.files.length > 0) {
      reader.onload = (e: any) => {
        /* read workbook */
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

        /* grab first sheet */
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];
        /* save data */
        // tslint:disable-next-line:no-angle-bracket-type-assertion
        this.datas = <AOA>(XLSX.utils.sheet_to_json(ws, { header: 1 }));
        this.value += 10;
        this.setDataNew();
      };
      reader.readAsBinaryString(target.files[0]);
      this.fileName = target.files[0].name;
      this.fileExcelName = this.fileName;
    }
  }
  async setDataNew() {
    let countSuccesss = 0;
    this.dataKPIShipmentDetail = [];
    this.totalCount = 0;
    const firstRows = this.datas[0] as string[];
    for (let i = 1; i < firstRows.length; i++) {
      const check = this.columns.find(f => f.Name === firstRows[i]);
      if (check) {
        check.Index = i;
      }
    }
    this.datas.map((rows: string[], i) => {
      if (i > 0) {
        const dataKPIShipmentDetail: KPIShipmentDetailModel = new KPIShipmentDetailModel();
        this.dataKPIShipmentDetail.concat(dataKPIShipmentDetail);
        // tslint:disable-next-line:no-string-literal
        dataKPIShipmentDetail['key'] = i - 1;
        rows.map(async (cell, j) => {
          const column = this.columns.find(f => f.Index === j);
          if (column) {
            if (column.Name === 'code') {
              dataKPIShipmentDetail.code = cell;
            }
            if (column.Name === 'name') {
              dataKPIShipmentDetail.name = cell;
            }
            if (column.Name === 'districtId') {
              dataKPIShipmentDetail.districtId = cell;
            }
            if (column.Name === 'wardId') {
              dataKPIShipmentDetail.wardId = cell;
            }
            if (column.Name === 'vehicle') {
              dataKPIShipmentDetail.vehicle = cell;
            }
            if (column.Name === 'target_delivery_time') {
              dataKPIShipmentDetail.targetDeliveryTime = Number(cell);
            }
          }
        });
        this.totalCount++;
        if (!dataKPIShipmentDetail.districtId) {
          dataKPIShipmentDetail.districtId = null;
        }
        if (!dataKPIShipmentDetail.wardId) {
          dataKPIShipmentDetail.wardId = null;
        }
        dataKPIShipmentDetail.createdWhen = new Date();
        dataKPIShipmentDetail.ModifiedWhen = new Date();
        dataKPIShipmentDetail.ModifiedBy = this.authService.getUserId();
        dataKPIShipmentDetail.createdBy = this.authService.getUserId();
        dataKPIShipmentDetail.kpiShipmentId = this.selectedKPIShipment;
        this.dataKPIShipmentDetail.push(dataKPIShipmentDetail);
      }
    });
    setTimeout(() => {
      //
      const element = (document.querySelector('.progress-bar.progress-bar-striped.bg-info') as HTMLElement);
      this.startTimer(element, (this.totalCount / 100), 100);
      console.log(this.dataKPIShipmentDetail);
    }, 100);
  }
  startTimer(element, seconds: number, percent) {
    element.style.width = 0 + '%';
    const time = seconds < 1 ? 1 : seconds;
    const timer$ = interval(seconds * 10);

    const sub = timer$.subscribe((sec) => {
      this.progressbarValue = sec * 100 / time;
      this.curSec = sec;
      element.style.width = (((this.progressbarValue / 100) * 100) * percent / 100) + '%';
      if (this.curSec >= time) {
        sub.unsubscribe();
      }
    });
  }
  declareColumn() {
    this.columns = [];
    this.columnsName.forEach(element => {
      const columnExcel: ColumnExcel = new ColumnExcel();
      columnExcel.Name = element;
      columnExcel.Index = -1;
      this.columns.push(columnExcel);
    });
  }
  resData() {
    const element1 = (document.querySelector('.progress-bar.progress-bar-striped.bg-info') as HTMLElement);
    this.startTimer(element1, 1000, 0);
    const element2 = (document.querySelector('.progress-bar.progress-bar-striped.bg-success') as HTMLElement);
    this.startTimer(element2, 1000, 0);
    const element3 = (document.querySelector('.progress-bar.progress-bar-striped.bg-danger') as HTMLElement);
    this.startTimer(element3, 1000, 0);
    this.isDisabled = false;
    this.fileExcelName = 'Chọn tập tin';
    this.dataKPIShipmentDetail = [];
  }
  SaveFileError() {
    if (this.dataKPIShipmentDetailError && this.dataKPIShipmentDetailError.length > 0) {
      let columnExport: any = [
        { field: 'kpiShipmentId', header: 'kpiShipmentId' },
        { field: 'code', header: 'code' },
        { field: 'name', header: 'name' },
        { field: 'districtId', header: 'districtId' },
        { field: 'wardId', header: 'wardId' },
        { field: 'vehicle', header: 'vehicle' },
        { field: 'targetDeliveryTime', header: 'target_delivery_time' },
      ]
      let dataEx = ExportExcelHelper.ExportData(this.dataKPIShipmentDetailError, columnExport);
      ExportExcelHelper.exportXLSX(dataEx, 'DANH_SACH_LOI');
    }
  }
  clickSave() {
    this.isDisabled = true;
    this.createKPIShipmentDetail();
  }
  async createKPIShipmentDetail() {
    if (this.dataKPIShipmentDetail.length < 1) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Vui lòng chọn tập tin excel!" });
      this.isDisabled = false;
      return;
    }
    const result = await this.kpiShipmentDetailServices.updateKPIShipmentDetail(this.dataKPIShipmentDetail).toPromise();
    if (result.isSuccess) {
      this.messageService.add({ severity: Constant.messageStatus.success, detail: "Upload chi tiết tiêu chí giao hàng thành công!" });
      setTimeout(() => {
        //
        const element = (document.querySelector('.progress-bar.progress-bar-striped.bg-success') as HTMLElement);
        this.startTimer(element, (this.totalCount / 100), 100);
        console.log(this.dataKPIShipmentDetail);
      }, 100);
    } else {
      setTimeout(() => {
        //
        const element = (document.querySelector('.progress-bar.progress-bar-striped.bg-danger') as HTMLElement);
        this.startTimer(element, (this.totalCount / 100), 100);
        console.log(this.dataKPIShipmentDetail);
      }, 100);
    }
    this.isDisabled = false;
  }
}
