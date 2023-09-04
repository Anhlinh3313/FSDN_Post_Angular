import { Component, OnInit, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PersistenceService, StorageType } from 'angular-persistence';
import { MessageService } from 'primeng/components/common/messageservice';
import * as moment from 'moment';
import { ListReceiptMoneyService } from '../../../services/receiptMoney.service.';
import { ListReceiptMoney } from '../../../models/index';
import { ListReceiptMoneyShipment } from '../../../models/listReceiptMoneyShipment.model';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { Shipment } from '../../../models/shipment.model';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ShipmentDetailComponent } from '../../shipment-detail/shipment-detail.component';
//excel
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { environment } from '../../../../environments/environment';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
type AOA = Array<Array<any>>;
function s2ab(s: string): ArrayBuffer {
  const buf: ArrayBuffer = new ArrayBuffer(s.length);
  const view: Uint8Array = new Uint8Array(buf);
  for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}
//
@Component({
  selector: 'app-receive-money-detail',
  templateUrl: 'receive-money-detail.component.html',
  styles: []
})
export class ReceiveMoneyDetailComponent extends BaseComponent implements OnInit {

  //excel
  columnNameExcel: ColumnNameExcel = new ColumnNameExcel();
  columnsName: string[] = [this.columnNameExcel.shipment_Number, this.columnNameExcel.total, this.columnNameExcel.total_Price,
  this.columnNameExcel.cod, this.columnNameExcel.payment_Type, this.columnNameExcel.tpl_Number, this.columnNameExcel.tpl_code, this.columnNameExcel.order_Date,
  this.columnNameExcel.service_name, this.columnNameExcel.weight, this.columnNameExcel.total_Box];
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'binary' };
  fileName: string = 'SimpleExcel.xlsx';
  //
  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private persistenceService: PersistenceService,
    protected messageService: MessageService,
    private listReceiptMoneyService: ListReceiptMoneyService,
    public permissionService: PermissionService,
    public router: Router,
  ) {
    super(messageService, permissionService, router);
  }

  unit = environment.unit;

  listReceiptMoney: ListReceiptMoney;
  listData: ListReceiptMoneyShipment[]
  ngOnInit() {
    this.resetData();
  }

  resetData() {
    this.listData = [];
    this.listReceiptMoney = new ListReceiptMoney;
  }

  loadData(listReceiptMoney: ListReceiptMoney) {
    this.listReceiptMoney = listReceiptMoney;
    if (this.listReceiptMoney) {
      this.listReceiptMoneyService.getListReceiptMoneyShipmentByListReceiptMoney(this.listReceiptMoney.id,
        ["Shipment", "Shipment.PaymentType", "Shipment.Service", "Shipment.Sender"]).subscribe(x => {
          if (!super.isValidResponse(x)) return;
          this.listData = x.data as ListReceiptMoneyShipment[];
        });
    } else {
      this.listData = [];
    }
  }
  setData(listReceiptMoney: ListReceiptMoney, listData: ListReceiptMoneyShipment[]) {
    this.listReceiptMoney = listReceiptMoney;
    this.listData = listData;
  }
  view(data: ListReceiptMoneyShipment) {
    this.bsModalRef = this.modalService.show(ShipmentDetailComponent, { class: 'inmodal animated bounceInRight modal-xlg' });
    this.bsModalRef.content.loadData(data.shipment);
  }
  SimpleExcel(): void {
    // let evt : any;
    // const target: DataTransfer = <DataTransfer>(evt.target);
    // this.targetDataTransfer = target;

    // if (!this.isValidChangeFile()) return;
    // const reader: FileReader = new FileReader();
    // reader.onloadend = (e: any) => {
    //   /* read workbook */
    //   const bstr: string = e.target.result;
    //   const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

    //   /* grab first sheet */
    //   const wsname: string = wb.SheetNames[0];
    //   const ws: XLSX.WorkSheet = wb.Sheets[wsname];
    //   /* save data */
    //   this.datas = <AOA>(XLSX.utils.sheet_to_json(ws, { header: 1 }));
    //   this.setData();
    // };   
    // /* generate worksheet */
    let datas: any[] = [];

    datas.push([
      "STT", this.columnNameExcel.shipment_Number, this.columnNameExcel.total, this.columnNameExcel.total_Price,
      this.columnNameExcel.cod, this.columnNameExcel.receiver_code2, this.columnNameExcel.receiver_name,
      this.columnNameExcel.shipping_address, this.columnNameExcel.sender_code,
      this.columnNameExcel.sender_name, this.columnNameExcel.payment_Type, this.columnNameExcel.tpl_Number,
      this.columnNameExcel.tpl_code, this.columnNameExcel.order_Date,
      this.columnNameExcel.service_name, this.columnNameExcel.weight, this.columnNameExcel.total_Box
    ])
    // datas.push([
    //   "stt", "mã nhân viên nhận", "Mã vận đơn", "mã khách hàng", "Tên người nhận", "Điện thoại nhận", "Địa chỉ cụ thể", "Địa chỉ người nhận(google map)", "Mã tỉnh", "Thu hộ(vnđ)", "Trọng lượng(kg)", "Mã cơ cấu", "Dịch vụ", "Thanh toán", "Nội dung", "Ghi chú", "------"
    // ])
    let tong = 0;
    this.listData.map((item, i) => {
      tong += (item.totalPrice + item.cod);
      datas.push([
        // i + 1, this.listData[i].shipment.shipmentNumber, (this.listData[i].shipment.totalPrice + this.listData[i].cod), this.listData[i].totalPrice, this.listData[i].cod, (this.listData[i].shipment.paymentType ? this.listData[i].shipment.paymentType.name : ""), this.listData[i].shipment.tplNumber,(this.listData[i].shipment.tpl ? this.listData[i].shipment.tpl.code : ""), this.listData[i].shipment.orderDate, (this.listData[i].shipment.service ? this.listData[i].shipment.service.name : ""), this.listData[i].shipment.weight, this.listData[i].shipment.totalBox
        i + 1, item.shipment.shipmentNumber, (item.totalPrice + item.cod), item.totalPrice,
        item.cod,
        item.shipment.receiverCode2, item.shipment.receiverName, item.shipment.shippingAddress,
        (item.shipment.sender ? item.shipment.sender.code : "")
        , item.shipment.senderName,
        (item.shipment.paymentType ? item.shipment.paymentType.name : ""), item.shipment.tplNumber, (item.shipment.tpl ? item.shipment.tpl.code : ""), item.shipment.orderDate, (item.shipment.service ? item.shipment.service.name : ""), item.shipment.weight, item.shipment.totalBox
      ]);
    })
    datas.push([
      "", "Tổng", tong
    ])
    // datas = datas.concat(this.listData);
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(datas);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    /* save to file */
    const wbout: string = XLSX.write(wb, this.wopts);
    saveAs(new Blob([s2ab(wbout)]), this.fileName);
  }
}
export class ColumnNameExcel {
  shipment_Number: string = "Mã vận đơn";
  total: string = "Tổng đã thu";
  total_Price: string = "Tổng cước đã thu";
  cod: string = "COD đã thu";
  receiver_code2: string = "Mã người nhận";
  receiver_name: string = "Tên người nhận";
  shipping_address: string = "Địa chỉ nhận";
  sender_code: string = "Mã khách gửi";
  sender_name: string = "Tên người gửi";
  payment_Type: string = "Hình thức thanh toán";
  tpl_Number: string = "Mã vận đơn đối tác";
  tpl_code: string = "Mã đối tác";
  order_Date: string = "Ngày vận đơn";
  service_name: string = "Dịch vụ";
  weight: string = "Trọng lượng " + environment.unit;
  total_Box: string = "Số kiện";
}