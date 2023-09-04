import { ResponseModel } from "../../models/index";
import { Constant } from "../../infrastructure/constant";
import { MessageService } from "primeng/components/common/messageservice";
import { Message } from "primeng/primeng";
import { IBaseModel } from "../../models/abstract/ibaseModel.interface";
import { FooterUtil } from "../../infrastructure/footer.util";
import { PermissionService } from "../../services/permission.service";
import { Router } from "@angular/router";

export class BaseComponent {

  isAdd = true;
  isEdit = true;
  isDelete = true;

  constructor(protected messageService: MessageService,
    protected permissionService: PermissionService,
    protected router: Router) {
    let pathName = window.location.pathname;
    // if (pathName == "/" || pathName == "") {

    // }
    // else {
    //   this.permissionService.checkPermissionDetail(pathName, 3).subscribe(x => {
    //     if (x.isSuccess) {
    //       if (x.data["length"] > 0) {
    //         let data = x.data[0];
    //         if (!data.access) {
    //           this.router.navigate(["403"]);
    //         }
    //         else {
    //           this.isAdd = data.add;
    //           this.isEdit = data.edit;
    //           this.isDelete = data.delete;
    //         }
    //       }
    //     }
    //   });
    // }
  }

  ngOnInit() {
  }

  isValidResponse(x: ResponseModel): boolean {
    if (!x.isSuccess) {
      if (x.message) {
        this.messageService.add({ severity: Constant.messageStatus.warn, detail: x.message });
      } else if (x.data) {
        let mess: Message[] = [];

        for (let key in x.data) {
          let element = x.data[key];
          mess.push({ severity: Constant.messageStatus.warn, detail: element });
        }

        this.messageService.addAll(mess);
      }
      else {
        this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Đã có lỗi xảy ra! Vui lòng thử lại!" });
        // console.log(x.exception);
      }
    }

    return x.isSuccess;
  }

  compareFn(c1: IBaseModel, c2: IBaseModel): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }
  sum(listData, columnName) {
    return FooterUtil.sum(listData, columnName);
  }
  route(c1: number): number {
    if (!c1) c1 = 0;
    return Math.ceil(c1 * 1000) / 1000;
  }
}