import { Component, OnInit, TemplateRef, ElementRef, ViewChild } from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
import { InformationComponent } from '../../../infrastructure/information.helper';
import { MessageService } from "primeng/components/common/messageservice";
import { GeneralInfoService } from "../../../services/generalInfo.service";
import { Router } from "@angular/router";
import { PermissionService } from "../../../services/permission.service";
import { AuthService, HubService, PackageService } from "../../../services";
import { Constant } from "../../../infrastructure/constant";
import { SearchDate } from "../../../infrastructure/searchDate.helper";
import * as moment from "moment";
import { SelectModel } from "../../../models/select.model";
import { DaterangePickerHelper } from "../../../infrastructure/daterangePicker.helper";
import { environment } from '../../../../environments/environment';
import { Package } from "../../../models";
import { FilterUtil } from "../../../infrastructure/filter.util";
import { LazyLoadEvent } from "primeng/primeng";

@Component({
  selector: 'app-list-package',
  templateUrl: './list-package.component.html',
})
export class ListPackageComponent extends InformationComponent implements OnInit {
  columns: string[] = [
    "code", "statusName", "totalShipment","createdWhen",
    "createdHubName", "createdUserName", "toHubName",
    "content", "weight", "calWeight", "length", "width", "height"
  ];
  dateRange = {
    start: moment(),
    end: moment()
  };
  filterRows: any;
  rowPerPage: number = 20;
  pageNum = 1;
  searchText: string = "";

  allHubs: SelectModel[] = [];
  hubCreated: any;
  selectedHubCreated: any;
  hubCreateds: any;
  filteredCreatedHubs: any;

  selectedStatusPK: number = null;
  statusPKs: SelectModel[];

  dateFromCreate: any;
  dateToCreate: any;

  envir = environment;
  parentPage: string =  Constant.pages.pack.name;
  currentPage: string =  Constant.pages.pack.children.listPackage.name;
  datasource: Package[];
  listData: Package[];
  totalRecords: any;
  event: LazyLoadEvent;

  constructor(
    private packageService: PackageService,
    private hubService: HubService,
    protected generalInfoService: GeneralInfoService,
    protected bsModalService: BsModalService,
    protected messageService: MessageService,
    protected authService: AuthService,
    public permissionService: PermissionService,
    public router: Router
  ) {
    super(generalInfoService, authService, messageService, permissionService, router);
  }

  ngOnInit() {
    this.initData();
  }

  async initData() {
    let fromDate = null;
    let toDate = null;
    if (this.dateRange) {
        fromDate = this.dateRange.start.hour(0).minute(0).second(1).format("YYYY/MM/DD HH:mm");
        toDate = this.dateRange.end.hour(23).minute(59).second(0).format("YYYY/MM/DD HH:mm");
    }
    this.dateFromCreate = fromDate;
    this.dateToCreate = toDate;
    this.loadStatusPK();
    this.loadPackage();
  }

  async loadStatusPK() {
    this.statusPKs = await this.packageService.getSelectItemPackageStatusAsync();
  }

  async loadPackage() {
    await this.packageService.getListPackageAsync(this.selectedHubCreated, this.searchText, this.selectedStatusPK, this.dateFromCreate, this.dateToCreate, this.pageNum, this.rowPerPage).then(x => {
      if (x) {
        const data = x.data as Package[] || [];
        this.datasource = data;
        this.listData = this.datasource;
        this.totalRecords = this.listData.length > 0 ? data[0].totalCount : 0;
      }
    });
  }

  selectedDate() {
    this.dateFromCreate = SearchDate.formatToISODate(moment(this.dateFromCreate).toDate());
    this.dateToCreate = SearchDate.formatToISODate(moment(this.dateToCreate).toDate());
    this.pageNum = 1;
    this.loadPackage();
  }

  changStatusPK() {
    this.pageNum = 1;
    this.loadPackage();
  }

  // lọc bưu cục tạo
  onSelectedHubCreated() {
    let findH = this.allHubs.find(f => f.label == this.hubCreated);
    if (findH) {
      this.selectedHubCreated = findH.value;
    } else {
      this.selectedHubCreated = null;
    }
    this.pageNum = 1;
    this.loadPackage();
  }

  async filterHubCreateds(event) {
    let value = event.query;
    if (value.length >= 1) {
      await this.hubService.getHubSearchByValueAsync(value, null).then(
        x => {
          this.allHubs = [];
          this.filteredCreatedHubs = [];
          this.filteredCreatedHubs.push("-- Chọn tất cả --");
          x.map(m => this.allHubs.push({ value: m.id, label: `${m.code} ${m.name}`, data: m }));
          this.allHubs.map(m => this.filteredCreatedHubs.push(m.label));
        }
      );
    }
  }

  onSearchText() {
    this.pageNum = 1;
    this.loadPackage();
  }

  loadLazy(event: LazyLoadEvent) {
    this.event = event;
    setTimeout(() => {
      if (this.datasource) {
        this.filterRows = this.datasource;
        // sort data
        this.filterRows.sort(
          (a, b) =>
            FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        );
        this.listData = this.filterRows;
      }
    }, 250);
  }

  onPageChange(event: LazyLoadEvent) {
    this.pageNum = event.first / event.rows + 1;
    this.rowPerPage = event.rows;
    this.loadPackage();
  }

  refresh() {
    this.rowPerPage = 20;
    this.pageNum = 1;
    this.searchText = "";
    this.selectedHubCreated = null;
    this.selectedStatusPK = null;
    this.loadPackage();
  }
}
