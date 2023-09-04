import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";
import { ResponseModel } from "../models/response.model";
import { BaseModel } from "../models/base.model";
import { GeneralService } from "./general.service";
import { HttpParams } from "@angular/common/http";
import { PersistenceService } from "angular-persistence";
import { environment } from "../../environments/environment";
import { ListUpdateStatusViewModel } from "../view-model/index";

import * as moment from "moment";
import { AssignShipmentToTPL } from "../models/assignShipmentToTPL.model";
import { UpdateScheduleModel } from "../models/updateSchedule.model";
import { AssignShipmentWarehousing } from "../models/assignShipmentWarehousing.model";
import { IdViewModel } from "../view-model/id.viewModel";
import { IdModel } from "../view-model/id.model";
import { Shipment, LadingSchesule, Boxes } from "../models";
import { ListGoods } from "../models/listGoods.model";
import { MessageService } from "primeng/components/common/messageservice";
import { ShipmentFilterViewModel } from "../models/shipmentFilterViewModel";
import { UpdateViewModelShipment } from "../models/abstract/updateViewModelShipment.interface";
import { ShipmentTracking } from "../models/abstract/shipmentTracking.interface";
import { SelectItem } from "../../../node_modules/primeng/primeng";
import { UpdateShipmentDeliveryComplete } from "../models/abstract/updateShipmentDeliveryComplete.interface";
import { IncidentsFilter } from "../models/incidentsFilter.model";
import { HandleIncidents } from "../models/handleIncidents.model";
import { AddCompensation } from "../models/addCompensation.model";
import { UpdateStatusCurrentEmp } from "../models/updateStatusCurrentEmp.models";
import { GetListWarehousingFilter } from "../models/getListWarehousingFilter.model";
import { DeliveryAndhubRouting } from "../view-model/deliveryAndHubRouting.viewModel";

@Injectable()
export class ShipmentService extends GeneralService {
  constructor(
    protected messageService: MessageService,
    protected httpClient: HttpClient,
    protected persistenceService: PersistenceService
  ) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "shipment");
  }

  async getListIncidents(model: IncidentsFilter) {
    let params = new HttpParams();
    params = params.append("empId", model.empId);
    params = params.append("shipmentNumber", model.shipmentNumber);
    params = params.append("fromDate", model.fromDate);
    params = params.append("toDate", model.toDate);
    params = params.append("pageSize", model.pageSize);
    params = params.append("pageNum", model.pageNum);
    params = params.append("cols", model.cols);

    let res = await this.getCustomApi("GetListIncidents", params).toPromise();
    return res;
  }

  async getIncidentsById(incidentsId: any, cols: string = null) {
    let params = new HttpParams();
    params = params.append("incidentsId", incidentsId);
    params = params.append("cols", cols);

    let res = await this.getCustomApi("getIncidentsById", params).toPromise();
    if (!this.isValidResponse(res)) return;
    return res.data;
  }

  getByListCode(listCode: string[]) {
    return super.postCustomUrlApi(environment.apiPostUrl, "getByListCode", listCode);
  }

  async getByListCodeAsync(listCode: string[]): Promise<Shipment[]> {
    const res = await this.getByListCode(listCode).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Shipment[];
    return data;
  }

  getByType(
    type: string,
    arrCols: string[] = [],
    fromDate?: any,
    toDate?: any,
    pageSize?: number,
    pageNumber?: number
  ) {
    let params = new HttpParams();
    params = params.append("type", type);
    params = params.append("fromDate", fromDate);
    params = params.append("toDate", toDate);
    return super.getCustomApiPaging(
      "getByType",
      arrCols,
      params,
      pageSize,
      pageNumber
    );
  }

  async getByTypeAsync(
    type: string,
    arrCols?: string[],
    fromDate?: any,
    toDate?: any,
    pageSize?: number,
    pageNumber?: number
  ): Promise<Shipment[]> {
    const res = await this.getByType(
      type,
      arrCols,
      fromDate,
      toDate,
      pageSize,
      pageNumber
    ).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Shipment[];
    return data;
  }

  postByType(
    filterViewModel?: ShipmentFilterViewModel,
  ) {
    return super.postCustomApiPaging(
      "postByType",
      filterViewModel,
    );
  }

  async postByTypeAsync(
    filterViewModel?: ShipmentFilterViewModel
  ): Promise<any> {
    const res = await this.postByType(
      filterViewModel
    ).toPromise();
    if (!this.isValidResponse(res)) return;
    return res;
  }

  async getListShipment(filterViewModel?: ShipmentFilterViewModel): Promise<ResponseModel> {
    const res = await super.postCustomApi("GetListShipment", filterViewModel).toPromise();
    if (!this.isValidResponse(res)) return;
    return res;
  }

  async getReportListShipment(filterViewModel?: ShipmentFilterViewModel): Promise<ResponseModel> {
    const res = await super.postCustomApi("GetReportListShipment", filterViewModel).toPromise();
    if (!res.isSuccess) return;
    return res;
  }

  async getReportListShipmentExport(filterViewModel?: ShipmentFilterViewModel) {
    const res = await super.postAny("GetReportListShipmentExport", filterViewModel).toPromise();
    this.downLoadFile(res, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filterViewModel.customExportFile.fileNameReport);
  }

  async getListShipmentExport(filterViewModel?: ShipmentFilterViewModel) {
    const res = await super.postAny("GetListShipmentExport", filterViewModel).toPromise();
    this.downLoadFile(res, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filterViewModel.customExportFile.fileNameReport);
  }

  downLoadFile(data: any, type: string, fileName: string) {
    if (!fileName) fileName = "EXPORT_BAO_CAO";
    var a = document.createElement("a");
    document.body.appendChild(a);
    //
    let blob = new Blob([data], { type: type });
    let url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
    //
  }

  getListShipmentKeepingByUserId(userId: number, recovery?: any, isPickup?: any, dateFrom?: any, dateTo?: any, cols?: string[], pageSize?: number, pageNumber?: number) {
    let params = new HttpParams();
    params = params.append("userId", userId + "");
    params = params.append("recovery", recovery);
    params = params.append("dateFrom", dateFrom);
    params = params.append("dateTo", dateTo);
    params = params.append("isPickup", isPickup);
    return super.getCustomApiPaging("GetListShipmentKeeping", cols, params, pageSize, pageNumber);
  }

  async getListShipmentKeepingByUserIdAsync(userId: number, recovery?: any, isPickup?: any, dateFrom?: any, dateTo?: any, cols?: string[], pageSize?: number, pageNumber?: number): Promise<Shipment[]> {
    const res = await this.getListShipmentKeepingByUserId(userId, recovery, isPickup, dateFrom, dateTo, cols, pageSize, pageNumber).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Shipment[];
    return data;
  }

  async getListWarehousing(model: GetListWarehousingFilter): Promise<Shipment[]> {
    let params = new HttpParams();
    params = params.append("warehousingType", model.warehousingType);
    params = params.append("userId", model.userId);
    params = params.append("hubId", model.hubId);
    params = params.append("serviceId", model.serviceId);
    params = params.append("isPrioritize", model.isPrioritize);
    params = params.append("isAllShipment", model.isAllShipment);
    params = params.append("isIncidents", model.isIncidents);
    params = params.append("isNullHubRouting", model.isNullHubRouting);
    if (model.listGoodsList) params = params.append("listGoodsList", model.listGoodsList.join(","));
    params = params.append("typeWarehousing", model.typeWarehousing);
    params = params.append("pageNumber", model.pageNumber);
    params = params.append("pageSize", model.pageSize);
    params = params.append("toHubId", model.toHubId);
    params = params.append("toUserId", model.toUserId);
    params = params.append("senderId", model.senderId);
    params = params.append("dateFrom", model.dateFrom);
    params = params.append("dateTo", model.dateTo);

    let res = await super.getCustomApi("GetListWarehousing", params).toPromise();

    if (!this.isValidResponse(res)) return;
    const data = res.data as Shipment[];
    return data;
  }

  async getListWarehousingExportExcel(filterViewModel?: GetListWarehousingFilter) {
    const res = await super.postAny("GetListWarehousingExportExcel", filterViewModel).toPromise();
    this.downLoadFile(res, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filterViewModel.customExportFile.fileNameReport);
  }

  async getAsync(id: any, arrCols?: string[]): Promise<any> {
    const res = await this.get(id, arrCols).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Shipment;
    return data;
  }

  getByStatusCurrentEmp(
    statusId: any,
    arrCols: string[] = [],
    pageSize: number = undefined,
    pageNumber: number = undefined
  ) {
    let params = new HttpParams();
    params = params.append("statusId", statusId);

    return super.getCustomApiPaging(
      "getByStatusCurrentEmp",
      arrCols,
      params,
      pageSize,
      pageNumber
    );
  }

  async getDeliveryAndHubRoutingAsync(listGoodsId: any): Promise<DeliveryAndhubRouting[]> {
    let params = new HttpParams();
    params = params.append("listGoodsId", listGoodsId);
    var res = await super.getCustomApi("GetDeliveryAndHubRouting", params).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as DeliveryAndhubRouting[];
    return data;
  }

  trackingShort(shipmentNumber: string, arrCols?: string[]) {
    let params = new HttpParams();
    params = params.append("shipmentNumber", shipmentNumber);
    return super.getCustomApiPaging("trackingShort", arrCols, params);
  }

  async trackingShortAsync(
    shipmentNumber: string,
    arrCols: string[]
  ): Promise<Shipment> {
    const res = await this.trackingShort(shipmentNumber, arrCols).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Shipment;
    return data;
  }

  async getShipmentByCodeAsync(shipmentNumber: string, arrCols: string[]) {
    let params = new HttpParams();
    params = params.append("shipmentNumber", shipmentNumber);
    return super.getCustomApiPaging("getShipmentByCode", arrCols, params).toPromise();
  }

  async trackingShortNoMessageAsync(
    shipmentNumber: string,
    arrCols?: string[]
  ): Promise<Shipment> {
    const res = await this.trackingShort(shipmentNumber, arrCols).toPromise();
    if (!res.isSuccess) {
      return null;
    }
    const data = res.data as Shipment;
    return data;
  }

  getListShipmentPriceByPaymentId(paymentId: string, arrCols: string[]) {
    let params = new HttpParams();
    params = params.append("paymentid", paymentId);
    return super.getCustomApiPaging("GetListShipmentPriceByPaymentId", arrCols, params);
  }

  async getListShipmentPriceByPaymentIdAsync(paymentId: string, arrCols: string[]): Promise<Shipment[]> {
    const res = await this.getListShipmentPriceByPaymentId(paymentId, arrCols).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Shipment[];
    return data;
  }

  getByShopCode(shopCode: string, customerId?: any, arrCols?: string[]) {
    let params = new HttpParams();
    params = params.append("shopCode", shopCode);
    params = params.append("customerId", customerId);
    return super.getCustomApiPaging("GetByShopCode", arrCols, params);
  }

  async getByShopCodeAsync(shopCode: string, customerId?: any, arrCols?: string[]): Promise<Shipment[]> {
    const res = await this.getByShopCode(shopCode, customerId, arrCols).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Shipment[];
    return data;
  }

  async getByShopCodeFirstAsync(shopCode: string, customerId?: any, arrCols?: string[]): Promise<Shipment[]> {
    let params = new HttpParams();
    params = params.append("shopCode", shopCode);
    params = params.append("customerId", customerId);
    const res = await super.getCustomApiPaging("GetByShopCodeFirst", arrCols, params).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Shipment[];
    return data;
  }

  getListShipmentCODByPaymentId(paymentId: string, arrCols: string[]) {
    let params = new HttpParams();
    params = params.append("paymentid", paymentId);
    return super.getCustomApiPaging("GetListShipmentCODByPaymentId", arrCols, params);
  }

  async getListShipmentCODByPaymentIdAsync(paymentId: string, arrCols: string[]): Promise<Shipment[]> {
    const res = await this.getListShipmentCODByPaymentId(paymentId, arrCols).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Shipment[];
    return data;
  }

  assignDeliveryList(model: ListUpdateStatusViewModel) {
    return super.postCustomApi("assignDeliveryList", model);
  }

  async assignDeliveryListAsync(model: ListUpdateStatusViewModel): Promise<ListGoods> {
    const res = await this.assignDeliveryList(model).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as ListGoods;
    return data;
  }

  transferLostPackage(model: Shipment) {
    return super.postCustomApi("TransferLostPackage", model);
  }


  async transferLostPackageAsync(model: Shipment): Promise<Shipment> {
    const res = await this.transferLostPackage(model).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Shipment;
    return data;
  }


  assignShipmentWarehousing(model: AssignShipmentWarehousing) {
    return super.postCustomApi("AssignShipmentWarehousing", model);
  }

  receiptWarehousing(model: AssignShipmentWarehousing) {
    return super.postCustomApi("ReceiptWarehousing", model);
  }

  async receiptWarehousingAsync(model: AssignShipmentWarehousing): Promise<any> {
    return this.receiptWarehousing(model).toPromise();
  }

  assignUpdateDeliveryList(model: ListUpdateStatusViewModel) {
    return super.postCustomApi("assignUpdateDeliveryList", model);
  }

  async assignUpdateDeliveryListAsync(model: ListUpdateStatusViewModel): Promise<ResponseModel> {
    const res = await this.assignUpdateDeliveryList(model).toPromise();
    if (!this.isValidResponse(res)) return;
    return res;
  }

  assignReturnList(model: ListUpdateStatusViewModel) {
    return super.postCustomApi("assignReturnList", model);
  }

  async assignReturnListAsync(model: ListUpdateStatusViewModel): Promise<any> {
    const res = await this.assignReturnList(model).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as ListGoods;
    return data;
  }

  assignUpdateReturnList(model: ListUpdateStatusViewModel) {
    return super.postCustomApi("assignUpdateReturnList", model);
  }

  assignTransferList(model: ListUpdateStatusViewModel) {
    return super.postCustomApi("assignTransferList", model);
  }

  async assignTransferListAsync(model: ListUpdateStatusViewModel): Promise<ListGoods> {
    const res = await this.assignTransferList(model).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as ListGoods;
    return data;
  }

  assignUpdateTransferList(model: ListUpdateStatusViewModel) {
    return super.postCustomApi("assignUpdateTransferList", model);
  }

  async assignUpdateTransferListAsync(model: ListUpdateStatusViewModel): Promise<ListGoods> {
    const res = await this.assignUpdateTransferList(model).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as ListGoods;
    return data;
  }

  hubConfirmMoneyFromRider(model: ListUpdateStatusViewModel) {
    return super.postCustomApi("hubConfirmMoneyFromRider", model);
  }

  assignShipmentToTPL(model: AssignShipmentToTPL[]) {
    return super.postCustomApi("assignShipmentToTPL", model);
  }

  updateLadingSchedule(model: UpdateScheduleModel[]) {
    return super.postCustomApi("UpdateLadingSchedule", model);
  }

  updateStatusCurrentEmp(model: Shipment) {
    return super.postCustomApi("UpdateStatusCurrentEmp", model);
  }

  async assignStatusCurrentEmpAsync(model: Shipment): Promise<ListGoods> {
    const res = await this.updateStatusCurrentEmp(model).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as ListGoods;
    return data;
  }

  checkExistTPLNumber(tplNumber: string) {
    let params = new HttpParams();
    params = params.append("tplNumber", tplNumber);
    return super.getCustomApi("CheckExistTPLNumber", params);
  }

  async checkExistTPLNumberAsync(tplNumber: string): Promise<any> {
    const res = await this.checkExistTPLNumber(tplNumber).toPromise();
    if (!this.isValidResponse(res)) return;
    return res.data as any;
  }

  getDeliveryHistory(fromDate: any, toDate: any) {
    let params = new HttpParams();

    params = params.append(
      "fromDate",
      moment(fromDate).format("YYYY/MM/DD 00:00:00")
    );
    params = params.append(
      "toDate",
      moment(toDate).format("YYYY/MM/DD 23:59:59")
    );

    return super.getCustomApi("getDeliveryHistory", params);
  }

  getByTPL(
    fromDate: any,
    toDate: any,
    arrCols: string[] = [],
    pageSize: number = undefined,
    pageNumber: number = undefined
  ) {
    let params = new HttpParams();
    if (fromDate)
      params = params.append(
        "fromDate",
        moment(fromDate).format("YYYY/MM/DD 00:00:00")
      );
    if (toDate)
      params = params.append(
        "toDate",
        moment(toDate).format("YYYY/MM/DD 23:59:59")
      );

    return super.getCustomApiPaging(
      "GetByTPL",
      arrCols,
      params,
      pageSize,
      pageNumber
    );
  }

  getReturnHistory(fromDate: any, toDate: any) {
    let params = new HttpParams();

    params = params.append(
      "fromDate",
      moment(fromDate).format("YYYY/MM/DD 00:00:00")
    );
    params = params.append(
      "toDate",
      moment(toDate).format("YYYY/MM/DD 23:59:59")
    );

    return super.getCustomApi("getReturnHistory", params);
  }

  getTransferHistory(fromDate: any, toDate: any) {
    let params = new HttpParams();

    params = params.append(
      "fromDate",
      moment(fromDate).format("YYYY/MM/DD 00:00:00")
    );
    params = params.append(
      "toDate",
      moment(toDate).format("YYYY/MM/DD 23:59:59")
    );

    return super.getCustomApi("getTransferHistory", params);
  }

  getHubConfirmMoneyFromRiderHistory(fromDate: any, toDate: any) {
    let params = new HttpParams();

    params = params.append(
      "fromDate",
      moment(fromDate).format("YYYY/MM/DD 00:00:00")
    );
    params = params.append(
      "toDate",
      moment(toDate).format("YYYY/MM/DD 23:59:59")
    );

    return super.getCustomApi("getHubConfirmMoneyFromRiderHistory", params);
  }

  getAccountantConfirmMoneyFromHubHistory(fromDate: any, toDate: any) {
    let params = new HttpParams();

    params = params.append(
      "fromDate",
      moment(fromDate).format("YYYY/MM/DD 00:00:00")
    );
    params = params.append(
      "toDate",
      moment(toDate).format("YYYY/MM/DD 23:59:59")
    );

    return super.getCustomApi(
      "getAccountantConfirmMoneyFromHubHistory",
      params
    );
  }

  getByStatusEmpId(
    empId: any,
    statusId: any,
    fromDate: Date,
    toDate: Date,
    arrCols: string[] = [],
    pageSize: number = undefined,
    pageNumber: number = undefined
  ) {
    let params = new HttpParams();
    params = params.append("empId", empId);
    params = params.append("statusId", statusId);
    if (fromDate)
      params = params.append(
        "fromDate",
        moment(fromDate).format("YYYY/MM/DD 00:00:00")
      );
    if (toDate)
      params = params.append(
        "toDate",
        moment(toDate).format("YYYY/MM/DD 23:59:59")
      );

    return super.getCustomApiPaging(
      "getByStatusEmpId",
      arrCols,
      params,
      pageSize,
      pageNumber
    );
  }

  getShipmentReportByEmpId(
    empId: any,
    fromDate: Date,
    toDate: Date,
    arrCols: string[] = [],
    pageSize: number = undefined,
    pageNumber: number = undefined
  ) {
    let params = new HttpParams();
    params = params.append("empId", empId);
    if (fromDate)
      params = params.append(
        "fromDate",
        moment(fromDate).format("YYYY/MM/DD 00:00:00")
      );
    if (toDate)
      params = params.append(
        "toDate",
        moment(toDate).format("YYYY/MM/DD 23:59:59")
      );

    return super.getCustomApiPaging(
      "getShipmentReportByEmpId",
      arrCols,
      params,
      pageSize,
      pageNumber
    );
  }

  getAllHistory(fromDate: any, toDate: any) {
    let params = new HttpParams();

    params = params.append(
      "fromDate",
      moment(fromDate).format("YYYY/MM/DD 00:00:00")
    );
    params = params.append(
      "toDate",
      moment(toDate).format("YYYY/MM/DD 23:59:59")
    );

    return super.getCustomApi("getAllHistory", params);
  }

  checkExistTrackingNumber(trackingNumber: string): Observable<ResponseModel> {
    let params = new HttpParams();
    params = params.append("shipmentNumber", trackingNumber);
    return super.getCustomApi("CheckExistTrackingNumber", params);
  }

  async checkExistTrackingNumberAsync(trackingNumber: string): Promise<ResponseModel> {
    return await this.checkExistTrackingNumber(trackingNumber).toPromise();
  }

  getByStatusIds(ids: number[], arrCols: string[] = []): Observable<ResponseModel> {
    let obj = new IdViewModel();
    obj.ids = ids;
    obj.cols = arrCols.join(",");
    return super.postCustomApi("getByStatusIds", obj);
  }

  async getByStatusIdsAsync(
    ids: number[],
    arrCols?: string[]
  ): Promise<Shipment[]> {
    const res = await this.getByStatusIds(ids, arrCols).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Shipment[];
    return data;
  }

  getByListGoodsId(
    id: number,
    arrCols: string[] = [],
    isHideInPackage: boolean = false
  ): Observable<ResponseModel> {
    let obj = new IdModel();
    obj.id = id;
    obj.cols = arrCols.join(",");
    obj.isHideInPackage = isHideInPackage;
    return super.postCustomApi("getByListGoodsId", obj);
  }

  async getByListGoodsIdAsync(id: number, arrCols?: string[], isHideInPackage?: boolean): Promise<Shipment[]> {
    const res = await this.getByListGoodsId(id, arrCols, isHideInPackage).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Shipment[];
    return data;
  }

  getByListGoodsIds(
    ids: number[],
    arrCols: string[] = [],
    isHideInPackage: boolean = false
  ): Observable<ResponseModel> {
    let obj = new IdModel();
    obj.ids = ids;
    obj.cols = arrCols.join(",");
    obj.isHideInPackage = isHideInPackage;
    return super.postCustomApi("getByListGoodsIds", obj);
  }

  async getByListGoodsIdsAsync(ids: number[], arrCols?: string[], isHideInPackage?: boolean): Promise<Shipment[]> {
    const res = await this.getByListGoodsIds(ids, arrCols, isHideInPackage).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Shipment[];
    return data;
  }

  async getByListGoodsIdPagingAsync(viewModel: any): Promise<ResponseModel> {
    return await super.postCustomApi("getByListGoodsId", viewModel).toPromise();
  }

  getByListListGoodsId(
    ids: number[],
    arrCols: string[] = []
  ): Observable<ResponseModel> {
    let obj = new IdViewModel();
    obj.ids = ids;
    obj.cols = arrCols.join(",");
    return super.postCustomApi("getByListListGoodsId", obj);
  }

  async getByListListGoodsIdAsync(ids: number[], arrCols?: string[]): Promise<Shipment[]> {
    const res = await this.getByListListGoodsId(ids, arrCols).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Shipment[];
    return data;
  }

  getByListGoodsCode(
    code: string,
    arrCols?: string[]
  ): Observable<ResponseModel> {
    const obj = {
      code: code,
      cols: arrCols.join(",")
    }
    return super.postCustomApi("getByListGoodsCode", obj);
  }
  WarehousingShopCheck(shipmentId:string[]): Observable<ResponseModel>{
    const ojb={
      ShipmentIds:shipmentId.join(",")
    }
    return super.postCustomApi("WarehousingShopCheck",ojb);
  }

  async getByListGoodsCodeAsync(code: string, arrCols?: string[]): Promise<Shipment[]> {
    const res = await this.getByListGoodsCode(code, arrCols).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Shipment[];
    return data;
  }

  getByRequestShipmentId(id: any, cols: string[] = []): Observable<ResponseModel> {
    let params = new HttpParams();
    params = params.append("id", id);;
    return super.getCustomApiPaging("getByRequestShipmentId", cols, params);
  }

  async getByRequestShipmentIdAsync(id: any, cols?: string[]): Promise<Shipment[]> {
    const res = await this.getByRequestShipmentId(id, cols).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Shipment[];
    return data;
  }

  async createAsync(data: Shipment): Promise<any> {
    const res = await this.create(data).toPromise();
    if (!this.isValidResponse(res)) return;
    const shipment = res.data as Shipment;
    return shipment;
  }

  async updateAsync(data: Shipment): Promise<any> {
    const res = await this.update(data).toPromise();
    if (!this.isValidResponse(res)) return;
    const shipment = res.data as Shipment;
    return shipment;
  }

  acceptCreditTransfer(model) {
    return super.postCustomApi("AcceptCreditTransfer", model);
  }

  async acceptCreditTransferAsync(model): Promise<Shipment> {
    const res = await this.acceptCreditTransfer(model).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Shipment;
    return data;
  }

  cancelDeliveryComplete(model) {
    return super.postCustomApi("CancelDeliveryComplete", model);
  }

  async cancelDeliveryCompleteAsync(model): Promise<Shipment> {
    const res = await this.cancelDeliveryComplete(model).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Shipment;
    return data;
  }

  cancel(model: UpdateViewModelShipment) {
    return super.postCustomApi("cancel", model);
  }

  async cancelAsync(model: UpdateViewModelShipment) {
    const res = await this.cancel(model).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Shipment;
    return data;
  }
  //================================//
  async trackingShortAsyncTransferReceive(
    shipmentNumber: string,
    arrCols: string[]
  ): Promise<Shipment> {
    const res = await this.trackingShort(shipmentNumber, arrCols).toPromise();
    const data = res.data as Shipment;
    return data;
  }

  getByShipmentNumber(shipmentNumber: string) {
    let params = new HttpParams();
    params = params.append("shipmentNumber", shipmentNumber);
    return super.getCustomApi("getByShipmentNumber", params);
  }

  async getByShipmentNumberAsync(shipmentNumber: string): Promise<ShipmentTracking> {
    const res = await this.getByShipmentNumber(shipmentNumber).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as ShipmentTracking;
    return data;
  }

  async getByShipmentNumberNoMessageAsync(shipmentNumber: string): Promise<ShipmentTracking> {
    const res = await this.getByShipmentNumber(shipmentNumber).toPromise();
    if (!res.isSuccess) return;
    const data = res.data as ShipmentTracking;
    return data;
  }

  getOnlyShipment(shipmentNumber: string, clos?: string[]) {
    let strCols = null;
    if (clos.length > 0) {
      strCols = clos.join(',');
    }
    let params = new HttpParams();
    params = params.append("shipmentNumber", shipmentNumber);
    params = params.append("cols", strCols);
    return super.getCustomApi("GetOnlyShipment", params);
  }

  async getOnlyShipmentAsync(shipmentNumber: string, clos?: string[]): Promise<Shipment> {
    const res = await this.getOnlyShipment(shipmentNumber, clos).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Shipment;
    return data;
  }

  getGetLadingSchedule(shipmentId: number) {
    let params = new HttpParams();
    params = params.append("id", shipmentId + "");
    return super.getCustomApi("GetLadingSchedule", params);
  }

  async getGetLadingScheduleAsync(shipmentId: number): Promise<LadingSchesule[]> {
    const res = await this.getGetLadingSchedule(shipmentId).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as LadingSchesule[];
    return data;
  }

  //================================//

  cancelReturn(model: BaseModel) {
    return super.postCustomApi("CancelReturn", model);
  }

  async cancelReturnAsync(model: BaseModel): Promise<Shipment> {
    const res = await this.cancelReturn(model).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Shipment;
    return data;
  }

  getByListId(shipmentIds: number[], cols?: string): Observable<ResponseModel> {
    const obj = new Object({
      "shipmentIds": shipmentIds,
      "cols": cols
    });
    return super.postCustomApi("getByListId", obj);
  }

  async updateStatusCurrentEmpAsync(model: any): Promise<ResponseModel> {
    return await super.postCustomApi("UpdateStatusCurrentEmp", model).toPromise();
  }

  async getByListIdAsync(shipmentIds: number[], cols?: string): Promise<Shipment[]> {
    const res = await this.getByListId(shipmentIds, cols).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Shipment[];
    return data;
  }

  getAllPrintType() {
    let params = new HttpParams();
    return super.getCustomApi("getAllPrintType", params);
  }

  async getAllPrintTypeSelectItemAsync(): Promise<SelectItem[]> {
    const res = await this.getAllPrintType().toPromise();
    if (!this.isValidResponse(res)) return;
    let selectItem: SelectItem[] = [];
    const datas = res.data as any[];

    selectItem.push({ label: "Chọn tất cả", value: null });
    datas.forEach(element => {
      selectItem.push({
        label: element.name,
        value: element.id
      });
    });
    return selectItem;
  }

  printShipments(shipmentIds: number[], printTypeId: number): Observable<ResponseModel> {
    const obj = new Object({
      "shipmentIds": shipmentIds,
      "printTypeId": printTypeId
    });
    return super.postCustomApi("printShipments", obj);
  }

  async printShipmentsAsync(shipmentIds: number[], printTypeId: number): Promise<any> {
    const res = await this.printShipments(shipmentIds, printTypeId).toPromise();
    if (!res.isSuccess) return;
    return res;
  }


  getAllShipmentType() {
    let params = new HttpParams();
    return super.getCustomApi("getAllShipmentType", params);
  }

  async getAllShipmentTypeSelectItemAsync(): Promise<SelectItem[]> {
    const res = await this.getAllShipmentType().toPromise();
    if (!this.isValidResponse(res)) return;
    let selectItem: SelectItem[] = [];
    const datas = res.data as any[];

    datas.forEach(element => {
      selectItem.push({
        label: element.name,
        value: element.id
      });
    });
    return selectItem;
  }

  getCountByDeadLineType() {
    return super.getCustomApi("getCountByDeadLineType", null);
  }

  async getCountByDeadLineTypeAsync(): Promise<any> {
    const res = await this.getCountByDeadLineType().toPromise();
    if (!this.isValidResponse(res)) return;
    return res;
  }

  updateDeliveryCompleteByIds(shipments: UpdateShipmentDeliveryComplete[]) {
    return super.postCustomApiPaging("updateDeliveryCompleteByIds", shipments);
  }

  async updateDeliveryCompleteByIdsAsync(shipments: UpdateShipmentDeliveryComplete[]): Promise<any> {
    const res = await this.updateDeliveryCompleteByIds(shipments).toPromise();
    if (!this.isValidResponse(res)) return;
    return res;
  }

  getReportSumaryByListIds(
    ids: number[],
    arrCols: string[] = []
  ): Observable<ResponseModel> {
    let obj = new IdViewModel();
    obj.ids = ids;
    obj.cols = arrCols.join(",");
    return super.postCustomApi("getReportSumaryByListIds", obj);
  }

  async getReportSumaryByListIdsAsync(ids: number[], arrCols?: string[]): Promise<Shipment[]> {
    const res = await this.getReportSumaryByListIds(ids, arrCols).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Shipment[];
    return data;
  }

  getShipmentToPrint(ids: number[], arrCols: string[] = []): Observable<ResponseModel> {
    let obj = new IdViewModel();
    obj.ids = ids;
    obj.cols = arrCols.join(",");
    return super.postCustomApi("GetShipmentToPrint", obj);
  }

  async getShipmentToPrintAsync(ids: number[], arrCols: string[] = []): Promise<any> {
    const res = await this.getShipmentToPrint(ids, arrCols).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as any;
    return data;
  }

  getBoxes(ids: number[], arrCols: string[] = []): Observable<ResponseModel> {
    let obj = new IdViewModel();
    obj.ids = ids;
    obj.cols = arrCols.join(",");
    return super.postCustomApi("GetBoxes", obj);
  }

  async getBoxesAsync(ids: number[], arrCols: string[] = []): Promise<Boxes> {
    const res = await this.getBoxes(ids, arrCols).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Boxes;
    return data;
  }
  //
  async issueWarehousingAsync(viewModel: AssignShipmentWarehousing): Promise<ResponseModel> {
    let res = await super.postCustomApi("IssueTransfer", viewModel).toPromise();
    return res;
  }

  issueDeliveryAsync(model: AssignShipmentWarehousing): Promise<ResponseModel> {
    return super.postCustomApi("IssueDelivery", model).toPromise();
  }

  getListCompensationAsync(isCompleted: any, shipmentNumber?: any, dateFrom?: any, dateTo?: any, pageSize?: number, pageNumber?: number, cols?: string[]): Promise<ResponseModel> {
    let params = new HttpParams();
    params = params.append("isCompleted", isCompleted);
    params = params.append("shipmentNumber", shipmentNumber);
    params = params.append("formDate", dateFrom);
    params = params.append("toDate", dateTo);
    return super.getCustomApiPaging("GetListCompensation", cols, params, pageSize, pageNumber).toPromise();
  }
  getCompensationType(): Promise<ResponseModel> {
    let params = new HttpParams();
    return super.getCustomApi("CompensationType", params).toPromise();
  }
  getFeeType(): Promise<ResponseModel> {
    let params = new HttpParams();
    return super.getCustomApi("GetFeeType", params).toPromise();
  }
  //handleCompensation
  async handleCompensationAsync(model: any): Promise<ResponseModel> {
    return await super.postCustomApi("HandleCompensation", model).toPromise();
  }
  async handleIncidents(model: HandleIncidents) {
    let res = await super.postCustomApi("HandleIncidents", model).toPromise();
    if (!this.isValidResponse(res)) return;
    return res.data;
  }

  async addCompensation(model: AddCompensation) {
    let res = await super.postCustomApi("AddCompensation", model).toPromise();
    if (!this.isValidResponse(res)) return;
    return res.data;
  }

  async getListShipmentDelayAsync(customerId: any, serviceId: any, reasonDelayId: any, dateFrom?: any, dateTo?: any, pageSize?: number, pageNumber?: number, cols?: string[]): Promise<ResponseModel> {
    let params = new HttpParams();
    params = params.append("customerId", customerId);
    params = params.append("serviceId", serviceId);
    params = params.append("reasonDelayId", reasonDelayId);
    params = params.append("fromDate", dateFrom);
    params = params.append("toDate", dateTo);
    return await super.getCustomApiPaging("GetListShipmentDelay", cols, params, pageSize, pageNumber).toPromise();
  }

  async reCalcualteShipmentAsync(model: UpdateStatusCurrentEmp): Promise<ResponseModel> {
    return await super.postCustomApi("ReCalculateShipment", model).toPromise();
  }

  getByPackageId(
    id: number,
    arrCols: string[] = []
  ): Observable<ResponseModel> {
    let obj = new IdModel();
    obj.id = id;
    obj.cols = arrCols.join(",");
    return super.postCustomApi("getByPackageId", obj);
  }

  async getByPackageIdAsync(id: number, arrCols?: string[]): Promise<Shipment[]> {
    const res = await this.getByPackageId(id, arrCols).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Shipment[];
    return data;
  } 
  async getCompareShipmentVersion(id: any, cols: string = null) {
      let params = new HttpParams();
      params = params.append("shipmentVersionId", id);
      params = params.append("cols", cols);
  
      let res = await this.getCustomApi("CompareShipmentVersion", params).toPromise();
      if (!this.isValidResponse(res)) return;
      return res.data;
    }
  unAssign(obj: any): Observable<ResponseModel> {
    return super.postCustomApi("UnAssign", obj);
  }

  async unAssignAsync(obj: any): Promise<any> {
    const res = await this.unAssign(obj).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data;
    return data;
  }
}