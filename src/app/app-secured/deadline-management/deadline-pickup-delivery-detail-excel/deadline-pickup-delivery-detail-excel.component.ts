import { Component, OnInit, TemplateRef, EventEmitter, Output } from '@angular/core';
import { ViewChild } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
//
import { Constant } from '../../../infrastructure/constant';
import { PriceServiceDetailExcelViewModel, PriceUploadExcelViewModel } from '../../../view-model';
import { PriceService, Area, Weight, PriceList, PriceServiceDetail, DeadlinePickupDeliveryDetailExcel, Hub, DeadlinePickupDelivery, DeadlinePickupDeliveryDetail, Service, KPIShipmentDetailModel } from '../../../models';
import { LazyLoadEvent, CalendarModule, Calendar } from 'primeng/primeng';
import { BaseModel } from '../../../models/base.model';
import { PriceServiceService, AreaService, WeightService, PriceServiceDetailService, PriceListService, DeadlinePickupDeliveryDetailService, HubService, DeadlinePickupDeliveryService, ServiceService } from '../../../services';
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
type AOA = Array<Array<any>>;

function s2ab(s: string): ArrayBuffer {
  const buf: ArrayBuffer = new ArrayBuffer(s.length);
  const view: Uint8Array = new Uint8Array(buf);
  for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}
@Component({
  selector: 'app-deadline-pickup-delivery-detail-excel',
  templateUrl: 'deadline-pickup-delivery-detail-excel.component.html',
  styles: []
})
export class DeadlinePickupDeliveryDetailExcelComponent extends BaseComponent implements OnInit {
  @ViewChild("myInputFiles") myInputFilesVariable: any;
  targetDataTransfer: DataTransfer;
  constructor(private modalService: BsModalService,
    protected messageService: MessageService, private priceServiceService: PriceServiceService,
    private areaService: AreaService, private serviceService: ServiceService,
    private deadlinePickupDeliveryDetailService: DeadlinePickupDeliveryDetailService,
    private deadlinePickupDeliveryService: DeadlinePickupDeliveryService,
    private hubService: HubService,
    public permissionService: PermissionService, 
    public router: Router,
  ) {
    super(messageService,permissionService,router);
  }
  //
  parentPage: string = Constant.pages.price.name;
  currentPage: string = Constant.pages.price.children.priceServiceDetailExcel.name;
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
  countSuccesss = 0;
  countError = 0;
  dataUsersError: any = [];
  fileExcelName: string;
  value = 0;
  isLoading: HTMLElement;
  loading: HTMLElement;
  isBlockquote: HTMLElement;
  progressbarValue = 100;
  curSec = 0;
  dataKPIShipmentDetail = [];
  totalCount = 0;
  columns: ColumnExcel[] = [];
  columnsName: string[] = [
    'code',
    'name',
    'district',
    'ward',
    'vehicle',
    'target_delivery_time',
  ];

  ngOnInit() {
    // this.deadlinePickupDeliveryService.getAll().subscribe(
    //   x => {
    //     if (!super.isValidResponse(x)) return;
    //     this.deadlinePickupDeliverys = [];
    //     this.deadlinePickupDeliverys.push({value:null, label:`-- chọn deadline --`});
    //     let datas = x.data as DeadlinePickupDelivery[];
    //     datas.map(m=>this.deadlinePickupDeliverys.push({value:m.id,label:m.name,data:m}));
    //   }
    // );
    this.declareColumn();
    this.fileExcelName = 'Chọn tập tin';
    this.isLoading = (document.querySelector('.model-backdrop-loading') as HTMLElement);
    this.loading = (document.querySelector('#loading') as HTMLElement);
    this.isBlockquote = (document.querySelector('.blockquote') as HTMLElement);
    this.isLoading.style.display = 'none';
    this.loading.style.display = 'none';
  }
  //#region 
  // onFileChange(evt: any) {
  //   /* wire up file reader */
  //   const target: DataTransfer = <DataTransfer>(evt.target);
  //   this.targetDataTransfer = target;
  //   // console.log(this.targetDataTransfer.files);

  //   if (!this.isValidChangeFile()) return;
  //   if (target.files.length < 1) {
  //     // console.log('Vui lòng chọn file upload');
  //   } else if (target.files.length > 1) {
  //     // console.log('Không thể upload nhiều file cùng lúc');
  //     this.myInputFilesVariable.nativeElement.value = "";
  //   } else {
  //     const reader: FileReader = new FileReader();
  //     reader.onload = (e: any) => {
  //       /* read workbook */
  //       const bstr: string = e.target.result;
  //       const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

  //       /* grab first sheet */
  //       const wsname: string = wb.SheetNames[0];
  //       const ws: XLSX.WorkSheet = wb.Sheets[wsname];
  //       /* save data */
  //       this.datas = <AOA>(XLSX.utils.sheet_to_json(ws, { header: 1 }));
  //     };
  //     reader.readAsBinaryString(target.files[0]);
  //   }
  // }

  // uploadExcel() {
  //   if (this.datas.length == 0) {
  //     this.messageService.add({
  //       severity: Constant.messageStatus.warn,
  //       detail: "Không tìm thấy dữ liệu upload, vui lòng kiểm tra lại!"
  //     })
  //     return;
  //   }
  //   if (this.selectedDeadlinePickupDelivery) {
  //     if (!this.isValidChangeFile()) return;
  //     let dataExcels: DeadlinePickupDeliveryDetailExcelViewModel = new DeadlinePickupDeliveryDetailExcelViewModel();
  //     let fintDeadline = this.deadlinePickupDeliverys.find(f=>f.value==this.selectedDeadlinePickupDelivery).data;
  //     dataExcels.deadlinePickupDeliveryViewModel = fintDeadline;
  //     for (let i = 0; i < this.datas.length; i++) {
  //       let rows = this.datas[i] as string[];
  //       if (i == 0) {
  //         for (let k = 1; k < rows.length; k++) {
  //           dataExcels.areaCodes.push(rows[k]);
  //         }
  //       } else {
  //         let serviceCode: string = '';
  //         for (let j = 0; j < rows.length; j++) {
  //           if (j == 0) {
  //             serviceCode = rows[j];
  //             dataExcels.serviceCodes.push(serviceCode);
  //           } else {
  //             let deadlinePickupDeliveryDetailExcel: DeadlinePickupDeliveryDetailExcel = new DeadlinePickupDeliveryDetailExcel();
  //             deadlinePickupDeliveryDetailExcel.areaCode = (this.datas[0] as string[])[j];
  //             deadlinePickupDeliveryDetailExcel.serviceCode = rows[0];
  //             deadlinePickupDeliveryDetailExcel.timeDelivery = Number(rows[j]);
  //             dataExcels.deadlineUploadExcelViewModels.push(deadlinePickupDeliveryDetailExcel);
  //           }
  //         }
  //       }
  //     }
  //     this.deadlinePickupDeliveryDetailService.UploadExcelDeadline(dataExcels).subscribe(
  //       x => {
  //         if (x.isSuccess) {
  //           this.messageService.add({
  //             severity: Constant.messageStatus.success, detail: "Upload dữ liệu thành công."
  //           });
  //         } else {
  //           this.messageService.add({
  //             severity: Constant.messageStatus.error, detail: "Upload dữ liệu không thành công."
  //           });
  //         }
  //       }
  //     );
  //   } else {
  //     this.messageService.add({
  //       severity: Constant.messageStatus.warn, detail: "Vui lòng chọn bảng deadline!"
  //     });
  //   }
  // }

  // viewDeadline() {
  //   if (this.selectedDeadlinePickupDelivery) {
  //     let dataFilterPriceServiceDetail: DataFilterViewModel = new DataFilterViewModel;
  //     dataFilterPriceServiceDetail.typeInt1 = this.selectedDeadlinePickupDelivery;
  //     dataFilterPriceServiceDetail.typeString1 = "Weight,Service";
  //     this.deadlinePickupDeliveryDetailService.GetByDeadlinePickupDelivery(dataFilterPriceServiceDetail).subscribe(
  //       x => {
  //         this.deadlinePickupDeliveryDetail = x.data as DeadlinePickupDeliveryDetail[];
  //         let fintDeadline = this.deadlinePickupDeliverys.find(f=>f.value==this.selectedDeadlinePickupDelivery).data;
  //         this.areaService.GetByAreaGroup(fintDeadline.areaGroupId).subscribe(
  //           x => {
  //             this.areas = x.data as Area[];
  //             this.serviceService.GetListService().subscribe(
  //               x => {
  //                 this.services = x.data as Service[];
  //                 //
  //                 this.datas = [];
  //                 let headers = [];
  //                 headers.push("service_code");
  //                 this.areas.forEach(
  //                   x => headers.push(x.code)
  //                 );
  //                 this.datas.push(headers);
  //                 //end add header
  //                 for (let i = 0; i < this.services.length; i++) {
  //                   let rows = [];
  //                   rows.push([this.services[i].code]);
  //                   for (let j = 0; j < this.areas.length; j++) {
  //                     let deadlineDetail = this.deadlinePickupDeliveryDetail.find(f => f.areaId == this.areas[j].id && f.serviceId == this.services[i].id);
  //                     if (deadlineDetail != null) {
  //                       rows.push(deadlineDetail.timeDelivery);
  //                     }
  //                     else {
  //                       rows.push(0)
  //                     }
  //                   }
  //                   this.datas.push(rows);
  //                 }
  //               }
  //             )
  //           }
  //         )
  //       }
  //     );
  //   } else {
  //     this.messageService.add({
  //       severity: Constant.messageStatus.warn,
  //       detail: "Vui lòng chọn deadline!"
  //     })
  //   }
  // }

  // SimpleExcel(): void {
  //   /* generate worksheet */
  //   const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.datas);

  //   /* generate workbook and add the worksheet */
  //   const wb: XLSX.WorkBook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  //   /* save to file */
  //   const wbout: string = XLSX.write(wb, this.wopts);
  //   saveAs(new Blob([s2ab(wbout)]), this.fileName);
  // }

  // isValidChangeFile(): boolean {
  //   let result: boolean = true;
  //   let messages: Message[] = [];

  //   if (!this.targetDataTransfer || this.myInputFilesVariable.nativeElement.value === "") {
  //     this.messageService.add({
  //       severity: Constant.messageStatus.warn, detail: "Vui lòng chọn file upload."
  //     });
  //     result = false;
  //   }
  //   if (this.targetDataTransfer && this.targetDataTransfer.files.length > 1) {
  //     this.messageService.add({
  //       severity: Constant.messageStatus.warn, detail: "Không thể upload nhiều file cùng lúc"
  //     });
  //     this.myInputFilesVariable.nativeElement.value = "";
  //     result = false;
  //   }

  //   if (messages.length > 0) {
  //     this.messageService.addAll(messages);
  //   }

  //   return result;
  // }
  //#endregion
  
  onFileChange(evt: any) {
    this.fileName = 'Chọn tệp tin';
    /* wire up file reader */
    // tslint:disable-next-line:no-angle-bracket-type-assertion
    const target: DataTransfer = <DataTransfer>(evt.target);
    this.targetDataTransfer = target;

    if (!this.isValidChangeFile()) { return; }
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
    }
  }
  isValidChangeFile(): boolean {
    const result = true;
    const messages: Message[] = [];
    return result;
  }
  async setDataNew() {
    this.isLoading.style.display = 'block';
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
      if (i > 1) {
        const dataKPIShipmentDetail: KPIShipmentDetailModel = new KPIShipmentDetailModel();
        this.dataKPIShipmentDetail.concat(dataKPIShipmentDetail);
        // tslint:disable-next-line:no-string-literal
        dataKPIShipmentDetail['key'] = i - 1;
        rows.map((cell, j) => {
          const column = this.columns.find(f => f.Index === j);
          if (column) {
            if (column.Name === 'code') {
              dataKPIShipmentDetail.code = cell;
            }
            if (column.Name === 'name') {
              dataKPIShipmentDetail.name = cell;
            }
            if (column.Name === 'district') {
              dataKPIShipmentDetail.districtId = cell;
            }
            if (column.Name === 'ward') {
              dataKPIShipmentDetail.wardId = cell;
            }
            if (column.Name === 'vehicle') {
              dataKPIShipmentDetail.vehicle = cell;
            }
            // if (column.Name === this.columnNameExcel.gender) {
            //   const fGender = this.genders.find(f => f.name === cell);
            //   if (fGender) {
            //     dataUser.genderId = fGender.id;
            //   } else {
            //     dataUser.genderId = null;
            //   }
            // }
            if (column.Name === 'target_delivery_time') {
              dataKPIShipmentDetail.targetDeliveryTime = Number(cell);
            }
          }
        });
        this.totalCount++;
        this.dataKPIShipmentDetail.push(dataKPIShipmentDetail);
      }
    });
    setTimeout(() => {
      this.isLoading.style.display = 'none';
      this.loading.style.display = 'none';
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
}
