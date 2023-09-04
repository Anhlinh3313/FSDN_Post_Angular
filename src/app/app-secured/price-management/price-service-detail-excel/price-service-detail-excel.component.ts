import { Component, OnInit, TemplateRef, EventEmitter, Output } from '@angular/core';
import { ViewChild } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
//
import { Constant } from '../../../infrastructure/constant';
import { PriceServiceDetailExcelViewModel, PriceUploadExcelViewModel } from '../../../view-model';
import { PriceService, Area, Weight, PriceList, PriceServiceDetail } from '../../../models';
import { LazyLoadEvent, CalendarModule, Calendar } from 'primeng/primeng';
import { BaseModel } from '../../../models/base.model';
import { PriceServiceService, AreaService, WeightService, PriceServiceDetailService, PriceListService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { Message } from 'primeng/components/common/message';
import { ResponseModel } from '../../../models/response.model';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { DataFilterViewModel } from '../../../view-model/index';
import { BaseComponent } from '../../../shared/components/baseComponent';

//
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { SelectModel } from '../../../models/select.model';

type AOA = Array<Array<any>>;

function s2ab(s: string): ArrayBuffer {
  const buf: ArrayBuffer = new ArrayBuffer(s.length);
  const view: Uint8Array = new Uint8Array(buf);
  for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}
@Component({
  selector: 'app-price-service-detail-excel',
  templateUrl: 'price-service-detail-excel.component.html',
  styles: []
})
export class PriceServiceDetailExcelComponent extends BaseComponent implements OnInit {
  @ViewChild("myInputFiles") myInputFilesVariable: any;
  targetDataTransfer: DataTransfer;
  constructor(private modalService: BsModalService,
    protected messageService: MessageService, private priceServiceService: PriceServiceService,
    private areaService: AreaService, private weightService: WeightService,
    private priceServiceDetailService: PriceServiceDetailService, private priceListService: PriceListService,
    public permissionService: PermissionService,
    public router: Router,
  ) {
    super(messageService, permissionService, router);

  }
  //
  parentPage: string = Constant.pages.price.name;
  currentPage: string = Constant.pages.price.children.priceServiceDetailExcel.name;
  //
  priceLists: SelectModel[] = [];
  selectedPriceList: number;
  //
  priceServices: PriceService[];
  selectedPriceService: PriceService;
  //
  priceServiceDetail: PriceServiceDetail[];
  //
  areas: Area[];
  //
  weights: Weight[];

  async ngOnInit() {
    this.priceLists = await this.priceListService.getAllSelectModelAsync();
    // this.priceListService.getAll().subscribe(
    //   x => this.priceLists = x.data as PriceList[]
    // )
  }
  priceListSelectChange() {
    if (this.selectedPriceList) {
      this.priceServiceService.GetByPriceList(this.selectedPriceList).subscribe(
        x => {
          if (!super.isValidResponse(x)) return;
          this.priceServices = x.data as PriceService[];

          this.selectedPriceService = new PriceService();
          if (this.priceServices.length > 0)
            this.selectedPriceService = this.priceServices[0];
        }
      );
    }

  }
  datas: AOA = [];
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'binary' };
  fileName: string = 'SimpleExcel.xlsx';

  onFileChange(evt: any) {
    /* wire up file reader */
    const target: DataTransfer = <DataTransfer>(evt.target);
    this.targetDataTransfer = target;
    // console.log(this.targetDataTransfer.files);

    if (!this.isValidChangeFile()) return;
    if (target.files.length < 1) {
      // console.log('Vui lòng chọn file upload');
    } else if (target.files.length > 1) {
      // console.log('Không thể upload nhiều file cùng lúc');
      this.myInputFilesVariable.nativeElement.value = "";
    } else {
      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {
        /* read workbook */
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

        /* grab first sheet */
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];
        /* save data */
        this.datas = <AOA>(XLSX.utils.sheet_to_json(ws, { header: 1 }));
      };
      reader.readAsBinaryString(target.files[0]);
    }
  }

  uploadExcel() {
    if (this.datas.length == 0) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Không tìm thấy dữ liệu upload, vui lòng kiểm tra lại!"
      })
      return;
    }

    if (this.selectedPriceService) {
      if (!this.isValidChangeFile()) return;
      let dataExcels: PriceServiceDetailExcelViewModel = new PriceServiceDetailExcelViewModel();
      dataExcels.priceServiceViewModel = this.selectedPriceService;
      for (let i = 0; i < this.datas.length; i++) {
        let rows = this.datas[i] as string[];
        if (i == 0) {
          for (let k = 1; k < rows.length; k++) {
            dataExcels.areaCodes.push(rows[k]);
          }
        } else {
          let weightCode: string = '';
          for (let j = 0; j < rows.length; j++) {
            if (j == 0) {
              weightCode = rows[j];
              dataExcels.WeightCodes.push(weightCode);
            } else {
              let priceUploadExcel: PriceUploadExcelViewModel = new PriceUploadExcelViewModel();
              priceUploadExcel.areaCode = (this.datas[0] as string[])[j];
              priceUploadExcel.WeightCode = rows[0];
              priceUploadExcel.price = Number(rows[j]);
              dataExcels.priceUploadExcelViewModel.push(priceUploadExcel);
            }
          }
        }
      }
      this.priceServiceDetailService.UploadExcelPriceService(dataExcels).subscribe(
        x => {
          if (x.isSuccess) {
            this.messageService.add({
              severity: Constant.messageStatus.success, detail: "Upload dữ liệu thành công."
            });
          } else {
            this.messageService.add({
              severity: Constant.messageStatus.error, detail: "Upload dữ liệu không thành công."
            });
          }
        }
      );
    } else {
      this.messageService.add({
        severity: Constant.messageStatus.warn, detail: "Vui lòng chọn bảng giá dịch vụ!"
      });
    }
  }

  viewPrice() {
    if (this.selectedPriceService) {
      let dataFilterPriceServiceDetail: DataFilterViewModel = new DataFilterViewModel;
      dataFilterPriceServiceDetail.typeInt1 = this.selectedPriceService.id;
      dataFilterPriceServiceDetail.typeString1 = "Weight,Area";
      this.priceServiceDetailService.GetByPriceService(dataFilterPriceServiceDetail).subscribe(
        x => {
          this.priceServiceDetail = x.data as PriceServiceDetail[];
          this.areaService.GetByAreaGroup(this.selectedPriceService.areaGroupId).subscribe(
            x => {
              this.areas = x.data as Area[];
              this.weightService.GetByWeightGroup(this.selectedPriceService.weightGroupId).subscribe(
                x => {
                  this.weights = x.data as Weight[];
                  //
                  this.datas = [];
                  let headers = [];
                  headers.push("weight_code");
                  this.areas.forEach(
                    x => headers.push(x.code)
                  );
                  this.datas.push(headers);
                  //end add header
                  for (let i = 0; i < this.weights.length; i++) {
                    let rows = [];
                    rows.push([this.weights[i].code]);
                    for (let j = 0; j < this.areas.length; j++) {
                      let priceDetail = this.priceServiceDetail.find(f => f.areaId == this.areas[j].id && f.weightId == this.weights[i].id);
                      if (priceDetail != null) {
                        rows.push(priceDetail.price);
                      }
                      else {
                        rows.push(0)
                      }
                    }
                    this.datas.push(rows);
                  }
                }
              )
            }
          )
        }
      );
    } else {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng chọn bàng giá dịch vụ!"
      })
    }
  }

  async savePriceService() {
    this.selectedPriceService.vatPercent = this.selectedPriceService.vatPercent ? this.selectedPriceService.vatPercent : 0;
    this.selectedPriceService.fuelPercent = this.selectedPriceService.fuelPercent ? this.selectedPriceService.fuelPercent : 0;
    this.selectedPriceService.remoteAreasPricePercent = this.selectedPriceService.remoteAreasPricePercent ? this.selectedPriceService.remoteAreasPricePercent : 0;
    this.selectedPriceService.dim = this.selectedPriceService.dim ? this.selectedPriceService.dim : 0;
    const data = await this.priceServiceService.updateAsync(this.selectedPriceService);
    if (data) {
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Cập nhật bảng giá dịch vụ thành công"
      });
    }
  }

  SimpleExcel(): void {
    /* generate worksheet */
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.datas);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    const wbout: string = XLSX.write(wb, this.wopts);
    saveAs(new Blob([s2ab(wbout)]), this.fileName);
  }

  isValidChangeFile(): boolean {
    let result: boolean = true;
    let messages: Message[] = [];

    if (!this.targetDataTransfer || this.myInputFilesVariable.nativeElement.value === "") {
      this.messageService.add({
        severity: Constant.messageStatus.warn, detail: "Vui lòng chọn file upload."
      });
      result = false;
    }
    if (this.targetDataTransfer && this.targetDataTransfer.files.length > 1) {
      this.messageService.add({
        severity: Constant.messageStatus.warn, detail: "Không thể upload nhiều file cùng lúc"
      });
      this.myInputFilesVariable.nativeElement.value = "";
      result = false;
    }

    if (messages.length > 0) {
      this.messageService.addAll(messages);
    }

    return result;
  }

}
