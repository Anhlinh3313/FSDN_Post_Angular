import { BaseComponent } from "../../../shared/components/baseComponent";
import { OnInit, Component, TemplateRef } from "@angular/core";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
import { MessageService } from "primeng/components/common/messageservice";
import { HolidayService } from "../../../services";
import { Constant } from "../../../infrastructure/constant";
import { HolidayModel } from "../../../models/holiday.model";
import { BsModalService, BsModalRef } from "ngx-bootstrap";

@Component({
    selector: 'app-holiday',
    templateUrl: 'holiday.component.html',
    styles: []
})
export class HolidayComponent extends BaseComponent implements OnInit {
    parentPage: string = Constant.pages.general.name;
    currentPage: string = Constant.pages.general.children.Holiday.name;
    listData: any;
    date: Date;
    //
    year: any = [];
    selectYear: any;
    now: any
    currentYear: any;
    //
    bsModalRef: BsModalRef;
    dataDelete: any;
    //
    constructor(
        public messageService: MessageService,
        public permissionService: PermissionService,
        public router: Router,
        public holiday: HolidayService,
        private modalService: BsModalService,
    ) {
        super(messageService, permissionService, router);
        this.now = new Date();
        this.currentYear = this.now.getFullYear();
    }
    ngOnInit() {
        this.LoadYear();
        this.loadDataHoliday();
    }
    loadDataHoliday() {
        this.holiday.getHolidayByYear(this.currentYear).subscribe(x => {
            if (!this.isValidResponse(x)) return;
            let data = x.data;
            this.listData = data;
        })
    }
    async create() {
        this.messageService.clear();
        if (!this.date) {
            this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Vui lòng chọn ngày để tạo ngày nghỉ` });
            return false;
        }
        var object = new HolidayModel();

        object.date = this.date.getFullYear() + "-" + (this.date.getMonth() + 1) + "-" + this.date.getDate() + "T00:00:00";
        object.name = object.date;
        object.code = object.date;

        this.holiday.createAsync(object).then(
            x => {
                if (!this.isValidResponse(x)) return; {
                    this.selectYear = this.date.getFullYear();
                    this.currentYear = this.date.getFullYear();
                    this.messageService.add({ severity: Constant.messageStatus.success, detail: `Thêm dữ liệu thành công.` });
                    this.loadDataHoliday();
                }
            }
        )
    }
    LoadYear() {
        for (let i = this.currentYear - 10; i <= this.currentYear + 10; i++) {
            this.year.push({ label: i, data: null, value: i })
        }
        this.selectYear = this.currentYear;
    }
    changeYear() {
        this.currentYear = this.selectYear;
        this.loadDataHoliday();
    }

    async delete() {
        this.messageService.clear();
        await this.holiday.deleteAsync(this.dataDelete).then(
            x => {
                if (!this.isValidResponse(x)) return;
                this.messageService.add({ severity: Constant.messageStatus.success, detail: `Xóa dữ liệu thành công.` });
                this.loadDataHoliday();
                this.bsModalRef.hide();
            }
        );
    }
    openDeleteModel(template: TemplateRef<any>, data: HolidayModel) {
        this.dataDelete = data;
        this.dataDelete = this.clone(data);
        this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
    }
    clone(model: HolidayModel): HolidayModel {
        let data = new HolidayModel();
        for (let prop in model) {
            data[prop] = model[prop];
        }
        return data;
    }
}