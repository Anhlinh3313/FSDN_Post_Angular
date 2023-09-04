import { Component, OnInit, TemplateRef, EventEmitter, Output } from '@angular/core';
import { ViewChild } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
//
import { Constant } from '../../../infrastructure/constant';
import { UpdateScheduleModel } from '../../../models';
import { LazyLoadEvent, CalendarModule, Calendar } from 'primeng/primeng';
import { BaseModel } from '../../../models/base.model';
import { ShipmentService } from '../../../services';
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

type AOA = Array<Array<any>>;

function s2ab(s: string): ArrayBuffer {
  const buf: ArrayBuffer = new ArrayBuffer(s.length);
  const view: Uint8Array = new Uint8Array(buf);
  for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}
@Component({
  selector: 'app-update-schedule',
  templateUrl: 'update-schedule.component.html',
  styles: []
})
export class UpdateScheduleComponent extends BaseComponent implements OnInit {
  @ViewChild("myInputFiles") myInputFilesVariable: any;
  targetDataTransfer: DataTransfer;
  constructor(private modalService: BsModalService,
    protected messageService: MessageService, private shipmentService:ShipmentService, public permissionService: PermissionService, public router: Router) {
      super(messageService, permissionService, router);

  }
  //
  parentPage: string = Constant.pages.tpl.name;
  currentPage: string = Constant.pages.tpl.children.updateSchedule.name;
  //
  ngOnInit() {

  }

  datas: AOA = [];
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'binary' };
  fileName: string = 'SimpleExcel.xlsx';

  onFileChange(evt: any) {
    /* wire up file reader */
    const target: DataTransfer = <DataTransfer>(evt.target);
    this.targetDataTransfer = target;

    if (!this.isValidChangeFile()) return;
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

  uploadExcel() {
    if (this.datas.length == 0) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Không tìm thấy dữ liệu upload, vui lòng kiểm tra lại!"
      })
      return;
    }
    
      if (!this.isValidChangeFile()) return;
      let dataExcels: UpdateScheduleModel[] = [];
      for (let i = 0; i < this.datas.length; i++) {
        if (i>=1) {
          let updateSchedule = new UpdateScheduleModel();
          let rows = this.datas[i] as string[];
          let weightCode: string = '';
          for (let j = 0; j < rows.length; j++) {
            if (j == 0) {
              updateSchedule.TPLNumber = rows[j];
            } else if(j==1){
              updateSchedule.StatusCode = rows[j];
            } else if(j==2){
              updateSchedule.Location = rows[j];
            } else if(j==3){
              updateSchedule.SignalBy = rows[j];
            } else if(j==4){
              updateSchedule.Note = rows[j];
            } else if(j==5){
              updateSchedule.UpdatedWhen = rows[j];
            }
          }
          dataExcels.push(updateSchedule);
        }
      }
      // console.log(dataExcels);
      this.shipmentService.updateLadingSchedule(dataExcels).subscribe(
        x => {
          if (x.isSuccess) {
            this.messageService.add({
              severity: Constant.messageStatus.success, detail: "Upload dữ liệu thành công."
            });
          } else {
            this.messageService.add({
              severity: Constant.messageStatus.error, detail: x.message
            });
          }
        }
      );
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
