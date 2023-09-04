import { Component, OnInit, TemplateRef } from '@angular/core';
import { Constant } from '../../../infrastructure/constant';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { MessageService } from 'primeng/components/common/messageservice';
import { Message } from 'primeng/components/common/message';
import {  UserService, ServiceDVGTService, ShipmentService, AuthService, FormPrintService } from '../../../services';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { environment } from '../../../../environments/environment';

import * as moment from "moment";
import { SelectModel } from '../../../models/select.model';
import { User, Shipment, Service, DataPrint } from '../../../models'; 
import { SearchDate } from '../../../infrastructure/searchDate.helper'; 
import { ChangeCODTypeService } from '../../../services/changeCODType.service';
import { ChangeCODService } from '../../../services/changeCOD.service';
import { ChargedCODFilterModel } from '../../../models/chargeCODFilter.model';
import { ArrayHelper } from '../../../infrastructure/array.helper';
import { StringHelper } from '../../../infrastructure/string.helper';
import { ServiceDVGTHelper } from '../../../infrastructure/serviceDVGTHelper';
import { InformationComponent } from "../../../infrastructure/information.helper";
import { PrintHelper } from '../../../infrastructure/printHelper';
import { GeneralInfoService } from '../../../services/generalInfo.service';
import { FromPrintViewModel } from '../../../view-model';
import { PrintFrormServiceInstance } from '../../../services/printTest.serviceInstace';
import { CurrencyFormatPipe } from "../../../pipes/currencyFormat.pipe";


@Component({
  selector: 'app-edit-cod',
  templateUrl: './edit-cod.component.html',
  styles: []
})
export class EditCodComponent extends InformationComponent implements OnInit {

  // Page
  rowPerPage: number = 20;
  pageSize: number = 1;
   
  parentPage: string = Constant.pages.codManagement.name;
  currentPage: string = Constant.pages.codManagement.children.editCOD.name;
  infoGeneral = environment;
  //

  // Calendar
  dateFrom: any = moment(new Date()).hour(0).minute(0).second(1).format("YYYY/MM/DD HH:mm");
  dateTo: any = moment(new Date()).hour(23).minute(59).second(0).format("YYYY/MM/DD HH:mm");

  public eventLog = "";   
  // Filter
  lstUsers: SelectModel[];
  selectedUser: number;  
  employee: any;
  employees: any[] = [];
  filteredEmployees: any;
  selectedEmployee: number;
  

  totalRecords: number = 0;
  bsModalRef: BsModalRef; 
  selected_userId: number;
  //
 
  datasource : ChargedCODFilterModel[]=[];
  listChangeCODType: SelectModel[];
  selected_data: ChargedCODFilterModel;
  shipmentSupport: Shipment;
  cloneSelectData: any;
  printCustomerId: any;
  serviceDVGTs: Service[];
  idPrint: string;
 changType = [
   {value: null, label: "-- Chọn tất cả --"},
   {value: false, label: "Chưa xác nhận"},
   {value: true, label: "Đã xác nhận"}
 ];
 selectedType = null;
  formatOldCOD: string;
  formatNewCOD: string;
  selected_newCOD = 0;
  constructor(
    protected messageService: MessageService, 
    public permissionService: PermissionService,
    public router: Router,
    private userService: UserService, 
    private modalService: BsModalService,
    public changeCodType : ChangeCODTypeService,
    public changeCODService: ChangeCODService,
    public serviceDVGTService: ServiceDVGTService,
    public  shipmentService: ShipmentService,
    protected authService: AuthService,
    protected generalInfoService: GeneralInfoService,
    protected printFrormServiceInstance: PrintFrormServiceInstance,
    protected formPrintService: FormPrintService, 
    protected currencyFormat: CurrencyFormatPipe
  ) {
    super(generalInfoService, authService, messageService, permissionService, router);
  }

  async ngOnInit() {
     this.loadData();
     this.loadChangeCODType();
  } 
  //#region Tab 1
  refresh() {
    // this.filterModel.userId = null;
    // this.filterModel.dateFrom = this.fromDate;
    // this.filterModel.dateTo = this.toDate;
    // this.filterModel.listGoodsCode = null;
    this.loadData();
  }

  // Load data
  async loadData() { 
    let obj =  new Object();
    obj['dateFrom'] = this.dateFrom;
    obj['dateTo'] = this.dateTo;
    obj['userId'] = this.selected_userId; 
    obj['isAccept'] = this.selectedType;
    let arrcol = ['changeCODType','shipment'];
    let res = await this.changeCODService.GetListChangeCOD(obj);
    if(res!=null) this.datasource = res; 
  }
   
 
  async loadUser() {
    this.lstUsers = await this.userService.getSelectModelAllUserByCurrentHubAsync();
  }
  

  async loadChangeCODType() {
    this.listChangeCODType = await this.changeCodType.getChangeCODTypeSelectModel();
  }
  // Calendar
  public mainInput = {
    start: moment().subtract(0, "day"),
    end: moment()
  };

  public selectedDate() {
    this.dateFrom = SearchDate.formatToISODate(moment(this.dateFrom).toDate());
    this.dateTo = SearchDate.formatToISODate(moment(this.dateTo).toDate());
    this.loadData();
  }

  public calendarEventsHandler(e: any) {
    this.eventLog += "\nEvent Fired: " + e.event.type;
  } 

  // filter Employee
  async filterEmployee(event) {
    let value = event.query;
    if (value.length >= 1) {
      let x = await this.userService.getSearchByValueAsync(value, null)
      this.employees = [];
      this.filteredEmployees = [];
      let data = (x as User[]);
      Promise.all(data.map(m => {
        this.employees.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
        this.filteredEmployees.push(`${m.code} ${m.name}`);
      }));
      this.employees.push({ value: null, label: `-- Tất cả --`, data: null })
      this.filteredEmployees.push(`-- Tất cả --`);
    }
  }

  onSelectedEmployee() {
    let cloneSelectedUser = this.employee;
    // let index = cloneSelectedUser.indexOf(" -");
    // let users: any;
    // if (index !== -1) {
    //   users = cloneSelectedUser.substring(0, index);
    //   cloneSelectedUser = users;
    // }
    this.employees.forEach(x => {
      let obj = x.label;
      if (obj) {
        if (cloneSelectedUser === obj) {
          this.selected_userId = x.value;
          this.loadData();
        }
      }
    });
  }
  async confim_change(data: ChargedCODFilterModel){
    if(data!= null){
      if(data.changeCODTypeId == 2 && this.selected_newCOD >= data.oldCOD)
      {
        this.messageService.add({
          severity: Constant.messageStatus.warn,
          detail: "COD mới không được lớn hơn COD cũ"
        })
      }else{
          data.newCOD = this.selected_newCOD;
          let res =  await this.changeCODService.AcceptChangeCOD(data);
          if(!res) {
            this.messageService.add({
              severity: Constant.messageStatus.warn,
              detail: "Xác nhận COD không thành công"
            });
          }else{
            this.shipmentSupport = res;
            this.selected_data.isAccept = true;
          } 

      } 
      await this.loadData();    
      
    }
  }
  async cancleChangeCOD(id:number)
  {
    let res = await this.changeCODService.CancleChangeCOD(id);
    if(res!=null) {
      this.messageService.add({
          severity: Constant.messageStatus.success,
          detail: "Đã hủy vận đơn thay đổi COD"
        }) 
    }else this.messageService.add({
          severity: Constant.messageStatus.warn,
          detail: "Hủy vận đơn thay đổi không thành công"
        });
    this.loadData();
    this.bsModalRef.hide();
  }
  openmodelConfim(template: TemplateRef<any>,data: any )
  {
    this.selected_data = data; 
    this.selected_newCOD = data.newCOD; 
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
   
  }
  openmodelCancle(template: TemplateRef<any>,data: any )
  {
    this.selected_data = data; 
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
  }
  multiPrintShipment(noPrintShipment, noPrintAdviceOfDelivery) {
    if (this.shipmentSupport==null) return;
    this.printShipment(noPrintShipment, noPrintAdviceOfDelivery);
  }
  async printShipment(noPrintShipment, noPrintAdviceOfDelivery) {
    this.cloneSelectData = await this.getPrintShipmentDatas();
    this.cloneSelectData.noPrintShipment = noPrintShipment;
    this.cloneSelectData.noPrintAdviceOfDelivery = noPrintAdviceOfDelivery;

    if (environment.isInTong) {
      await Promise.all(this.cloneSelectData.map(async ele => {
        let priceDVGT = await this.serviceDVGTService.getPriceDVGTByShipmentIdAsync(ele.id);
        ele.priceDVGT = priceDVGT;
      }));
    }


    if (!this.cloneSelectData.noPrintAdviceOfDelivery && this.cloneSelectData.noPrintShipment) {
      this.cloneSelectData = this.cloneSelectData.filter(x => x.isAdviceOfDelivery);
      this.cloneSelectData.noPrintShipment = noPrintShipment;
      if (this.cloneSelectData.length === 0) {
        this.messageService.add({
          severity: Constant.messageStatus.warn,
          detail: "Vui lòng chọn vđ có DVGT BP!"
        });
        return;
      }
    }
    this.idPrint = PrintHelper.printCreateMultiShipment;
    let dataPrint: DataPrint = new DataPrint();
    dataPrint.dataPrints = this.cloneSelectData;
    await this.formPrintService.getFormPrintA5Async(this.printCustomerId).then(
      x => {
        if (!this.isValidResponse(x)) return;
        let resultFormPrint = x.data as FromPrintViewModel;
        dataPrint.formPrint = resultFormPrint.formPrintBody;
        setTimeout(() => {
          this.printFrormServiceInstance.sendCustomEvent(dataPrint);
        }, 0);
      }
    );
  }
  async getPrintShipmentDatas(): Promise<any> {
    var dataSelected: any;
    var dataBox: any;
    let printSelectedData = [];
    printSelectedData.push(Object.assign({}, this.shipmentSupport));
    const ids: number[] = [];
    printSelectedData.map(x => {
      ids.push(x.id);
      if (!this.printCustomerId && x.senderId) {
        this.printCustomerId = x.senderId;
      } else {
        if (this.printCustomerId && this.printCustomerId != x.senderId) this.printCustomerId = -1;
      }
    });
    dataSelected = await this.shipmentService.getShipmentToPrintAsync(ids);
    if (dataSelected) {
      dataBox = await this.shipmentService.getBoxesAsync(ids);
      if (dataBox) {
        if (!ArrayHelper.isNullOrZero(dataBox)) {
          dataSelected.forEach(shipment => {
            shipment.boxes = [];
            dataBox.forEach(box => {
              if (box.shipmentId === shipment.id) {
                shipment.boxes.push(box);
              }
            });
            if (!StringHelper.isNullOrEmpty(shipment.strServiceDVGTIds)) {
              shipment.serviceDVGTName = ServiceDVGTHelper.mapServiceDVGT(this.serviceDVGTs, shipment.strServiceDVGTIds);
            } else {
              shipment.serviceDVGTName = "";
            }
          });
        } else {
          dataSelected.forEach(shipment => {
            shipment.boxes = [];
          });
        }
        this.cloneSelectData = await this.sendSelectDataPrintMultiShipmentVSE(dataSelected, this.generalInfo);
        return this.cloneSelectData;
      }
    }
  }
  onChangeValue(event){ 
    this.selected_newCOD = event.target.value.split(',').join('') as number;

  }
}