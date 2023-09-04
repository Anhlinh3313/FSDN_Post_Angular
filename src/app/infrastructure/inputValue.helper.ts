import { Shipment } from "../models";
import { MessageService } from "primeng/components/common/messageservice";
import { Constant } from "./constant";

export class InputValue {
  static trimInput(input: string): string {
    input.trim();
    let array = input.split(" ");
    let value = "";
    for (let index = 0; index < array.length; index++) {
      const element = array[index];
      if (element !== "") {
        value += element + " ";
      }
    }
    value = value.trim();
    return value;
  }

  static checkSubmit(isSubmit: boolean): boolean {
    if (isSubmit === true) {
      isSubmit = false;
    } else {
      isSubmit = true;
    }
    return isSubmit;
  }

  static removeCharactersVI(obj: string): string {
    if (!obj) {
      return "";
    }
    let str;
    str = obj;
    str = str.toLowerCase().trim();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    //str= str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'| |\"|\&|\#|\[|\]|~|$|_/g,"-");  
    /* tìm và thay thế các kí tự đặc biệt trong chuỗi sang kí tự - */
    //str= str.replace(/-+-/g,"-"); //thay thế 2- thành 1-  
    str = str.replace(/^\-+|\-+$/g, "");
    str = str.replace(/ /g, "-");
    //cắt bỏ ký tự - ở đầu và cuối chuỗi 
    return str.toUpperCase();
  }

  static scanShipmentNumber(txtShipmentNumber: string, listData: Shipment[], selectedData: Shipment[] = [], messageService: MessageService): Shipment[] {
    let input = this.trimInput(txtShipmentNumber);
    let array = input.split(" ");
    let old_length: number = 0;
    if (!selectedData) {
      selectedData = [];
      old_length = 0;
    } else {
      old_length = selectedData.length;
    }
    let select = [...selectedData];
    array.forEach(e => {
      if (e.trim().length !== 0) {
        let s = listData.filter(
          x => x.shipmentNumber === e.trim()
        );
        if (s.length === 0) {
          txtShipmentNumber = null;
          messageService.add({
            severity: Constant.messageStatus.warn,
            detail: "Không tìm thấy vận đơn " + e
          });
          return;
        }
        select.push(s[0]);
      }
    });
    if (select.length > 0) {
      const total = select.length - old_length;
      messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Đã quét thành công " + total + " vận đơn"
      });
    }
    selectedData = [ ...Array.from(new Set(select))];

    return selectedData;
  }

  static scanPackageCode(txtPackageCode: string, listData: Shipment[], selectedData: Shipment[] = [], messageService: MessageService): Shipment[] {
    let input = this.trimInput(txtPackageCode);
    let array = input.split(" ");
    if (!selectedData) {
      selectedData = [];
    }
    let select = [...selectedData];
    array.forEach(e => {
      if (e.trim().length !== 0) {
        let s = listData.filter(
          x => x.package && x.package.code === e.trim()
        );
        if (s.length === 0) {
          txtPackageCode = null;
          messageService.add({
            severity: Constant.messageStatus.warn,
            detail: "Không tìm thấy mã gói " + e
          });
          return;
        }
        select.push(s[0]);
      }
    });
    selectedData = [ ...Array.from(new Set(select))];

    return selectedData;
  }

  static getArrOfInput(txt: any): any[] {
    let arr: any[] = txt.split(" ");
    let outArr: any[] = [];
    arr.forEach(x => {
      if (x) {
        outArr.push(x);
      }
    });
    outArr = Array.from(new Set(outArr));
    return outArr;
  }

  static checkDuplicateCode(code: any, prop: string, arr: any[], messageService: MessageService): boolean {
    prop = "shipmentNumber";
    let findDuplicate = arr.find(x => x.shipmentNumber == code);
    if (!findDuplicate) {
      return false;
    } else {
      messageService.add({
        severity: Constant.messageStatus.warn,
        detail: 'Trùng mã: ' + findDuplicate[prop] + ", vui lòng nhập mã khác",
      }); 
      return true; 
    }
  }

  static s2ab(s: string): ArrayBuffer {
    const buf: ArrayBuffer = new ArrayBuffer(s.length);
    const view: Uint8Array = new Uint8Array(buf);
    for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }    
}