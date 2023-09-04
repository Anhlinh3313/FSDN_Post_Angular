import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";
import { ResponseModel } from '../models/response.model';
import { HttpParams } from '@angular/common/http';
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { IdViewModel } from '../view-model';
import { IdModel } from '../view-model/id.model';
import { MessageService } from 'primeng/components/common/messageservice';
import { ListGoods } from '../models/listGoods.model';
import { SelectModel } from '../models/select.model';
import { ListGoodsStatusIdsFilterModel } from '../models/abstract/listGoodsStatusIdsFilterModel.interface';
import { SelectItem } from 'primeng/primeng';
import { ListGoodsFilterViewModelByType } from '../models/listGoodsFilterViewModelByType.model';
import { CreateListGoods, InfoInListGoods } from '../models';

@Injectable()
export class ListGoodsService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "listGoods");
  }

  getByType(ids: number[], arrCols?: string[]): Observable<ResponseModel> {
    let obj = new IdViewModel();
    obj.ids = ids;
    obj.cols = arrCols.join(",");
    return super.postCustomApi("getByType", obj);
  }

  createListGoodsAsync(viewModel: CreateListGoods): Promise<ResponseModel> {
    return super.postCustomApi("createListGoods", viewModel).toPromise();
  }

  async getByTypeAsync(ids: number[], arrCols?: string[]): Promise<ListGoods[]> {
    const res = await this.getByType(ids, arrCols).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as ListGoods[];
    return data;
  }

  async getListGoodsTransferNewAsync(toHubId: any): Promise<ResponseModel> {
    let params = new HttpParams;
    params = params.append("toHubId", toHubId);
    return await super.getCustomApi("GetListGoodsTransferNew", params).toPromise();
  }

  async getListGoodsDeliveryNewAsync(empId: number): Promise<ResponseModel> {
    let params = new HttpParams;
    params = params.append("empId", empId + "");
    return await super.getCustomApi("GetListGoodsDeliveryNew", params).toPromise();
  }

  getReportBroadcastListGoodsByAppAndMobil(dateFrom: any = null, dateTo: any = null, hubId: any = null, empId: any = null, shipmentNumber?: string): Observable<ResponseModel> {
    let params = new HttpParams;
    params = params.append("dateFrom", `${dateFrom}`);
    params = params.append("dateTo", `${dateTo}`);
    params = params.append("hubId", `${hubId}`);
    params = params.append("empId", `${empId}`);
    params = params.append("shipmentNumber", shipmentNumber);
    return super.getCustomApi("GetReportBroadcastListGoodsByAppAndMobil", params);
  }

  async getReportBroadcastListGoodsByAppAndMobilAsync(dateFrom: any = null, dateTo: any = null, hubId: any = null, empId: any = null, shipmentNumber?: string): Promise<any[]> {
    const res = await this.getReportBroadcastListGoodsByAppAndMobil(dateFrom, dateTo, hubId, empId, shipmentNumber).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as any[];
    return data;
  }

  getListGoodsByHubId(hubId?: number, typeId?: number): Observable<ResponseModel> {
    let params = new HttpParams;
    params = params.append("hubId", hubId + "");
    params = params.append("typeId", typeId + "");
    return super.getCustomApi("getListGoodsByHubId", params);
  }

  async getListGoodsByHubIdAsync(hubId?: number, typeId?: number): Promise<ListGoods[]> {
    const res = await this.getListGoodsByHubId(hubId, typeId).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as ListGoods[];
    return data;
  }

  async getAllSelectModelListGoodsByHubIdAsync(hubId?: number, typeId?: number): Promise<SelectModel[]> {
    const res = await this.getListGoodsByHubIdAsync(hubId, typeId);
    if (res) {
      const listGoods = [];
      listGoods.push({ label: "-- Chọn dữ liệu --", data: null, value: null });
      res.forEach(element => {
        if (element) {
          listGoods.push({
            label: `${element.code}`,
            data: element,
            value: element.id
          });
        }
      });
      return listGoods;
    }
  }

  async getAllSelectItemListGoodsByHubIdAsync(hubId?: number, typeId?: number): Promise<SelectItem[]> {
    const res = await this.getListGoodsByHubIdAsync(hubId, typeId);
    if (res) {
      const listGoods = [];
      listGoods.push({ label: "-- Chọn tất cả --", value: null });
      res.forEach(element => {
        if (element) {
          listGoods.push({
            label: `${element.code}`,
            value: element.id
          });
        }
      });
      return listGoods;
    }
  }

  addShipments(id: number, shipmentIds: number[] = []): Observable<ResponseModel> {
    let obj = new IdModel();
    obj.id = id;
    obj.shipmentIds = shipmentIds;
    return super.postCustomApi("addShipments", obj);
  }

  removeShipments(id: number, shipmentIds: number[] = []): Observable<ResponseModel> {
    let obj = new IdModel();
    obj.id = id;
    obj.shipmentIds = shipmentIds;
    return super.postCustomApi("removeShipments", obj);
  }

  async updateAsync(model: ListGoods): Promise<any> {
    const res = await this.update(model).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as ListGoods;
    return data;
  }

  async updateInfoAsync(model: ListGoods): Promise<ResponseModel> {
    return await this.postCustomApi("UpdateInfo", model).toPromise();
  }

  async getAllAsync(arrCols?: string[], pageSize?: number, pageNumber?: number): Promise<any> {
    const res = await this.getAll(arrCols, pageSize, pageNumber).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as ListGoods;
    return data;
  }

  getListGoods(typeId?: number, createByHubId?: number, fromHubId?: number, toHubId?: number, userId?: number, statusId?: number, transportTypeId?: number, tplId?: number, dateFrom?: any, dateTo?: any, listGoodsCode?: string) {
    let params = new HttpParams();
    params = params.append("typeId", typeId + "");
    params = params.append("createByHubId", createByHubId + "");
    params = params.append("fromHubId", fromHubId + "");
    params = params.append("toHubId", toHubId + "");
    params = params.append("userId", userId + "");
    params = params.append("statusId", statusId + "");
    params = params.append("transportTypeId", transportTypeId + "");
    params = params.append("tplId", tplId + "");
    params = params.append("dateFrom", dateFrom);
    params = params.append("dateTo", dateTo);
    params = params.append("listGoodsCode", listGoodsCode);
    return super.getCustomApi("getListGoods", params);
  }

  async getListGoodsDetailAsync(typeId?: number, createByHubId?: number, fromHubId?: number, toHubId?: number, userId?: number, statusId?: number, transportTypeId?: number,
    tplId?: number, dateFrom?: any, dateTo?: any, listGoodsCode?: string, pageNumber?: any, pageSize?: any, listIds?: any) {
    let params = new HttpParams();
    params = params.append("typeId", typeId + "");
    params = params.append("createByHubId", createByHubId + "");
    params = params.append("fromHubId", fromHubId + "");
    params = params.append("toHubId", toHubId + "");
    params = params.append("userId", userId + "");
    params = params.append("statusId", statusId + "");
    params = params.append("transportTypeId", transportTypeId + "");
    params = params.append("tplId", tplId + "");
    params = params.append("dateFrom", dateFrom);
    params = params.append("dateTo", dateTo);
    params = params.append("listGoodsCode", listGoodsCode);
    params = params.append("pageNumber", pageNumber);
    params = params.append("pageSize", pageSize);
    params = params.append("listIds", listIds);
    let res = await super.getCustomApi("GetListGoodsDetail", params).toPromise();
    if (!res.isSuccess) return null;
    else return res.data;
  }

  async getListGoodsAsync(typeId?: number, createByHubId?: number, fromHubId?: number, toHubId?: number, userId?: number, statusId?: number, transportTypeId?: number, tplId?: number, dateFrom?: any, dateTo?: any, listGoodsCode?: string): Promise<ListGoods[]> {
    const res = await this.getListGoods(typeId, createByHubId, fromHubId, toHubId, userId, statusId, transportTypeId, tplId, dateFrom, dateTo, listGoodsCode).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as ListGoods[];
    return data;
  }

  getListGoodsByStatusIdsAndFromHubId(model: ListGoodsStatusIdsFilterModel) {
    return super.postCustomApi("GetListGoodsByStatusIdsAndFromHubId", model);
  }

  async getListGoodsByStatusIdsAndFromHubIdAsync(model: ListGoodsStatusIdsFilterModel): Promise<SelectItem[]> {
    const res = await this.getListGoodsByStatusIdsAndFromHubId(model).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as any;
    const listGoods: SelectItem[] = [];
    listGoods.push({ label: `-- Chọn bảng kê --`, value: null });
    data.forEach(element => {
      listGoods.push({
        label: element.code,
        value: element.id
      });
    });
    return listGoods;
  }

  postByType(filterViewModel?: ListGoodsFilterViewModelByType) {
    return super.postCustomApiPaging("postByType", filterViewModel);
  }

  async postByTypeAsync(filterViewModel?: ListGoodsFilterViewModelByType): Promise<any> {
    const res = await this.postByType(filterViewModel).toPromise();
    if (!this.isValidResponse(res)) return;
    return res;
  }

  GetListGoodsByTruckScheduleId(
    id: number,
    arrCols: string[] = []
  ): Observable<ResponseModel> {
    let obj = new IdModel();
    obj.id = id;
    obj.cols = arrCols.join(",");
    return super.postCustomApi("GetListGoodsByTruckScheduleId", obj);
  }

  async GetListGoodsByTruckScheduleIdAsync(id: number, arrCols?: string[]): Promise<ListGoods[]> {
    const res = await this.GetListGoodsByTruckScheduleId(id, arrCols).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as ListGoods[];
    return data;
  }

  async GetInfoInListGoodsAsync(id: any): Promise<InfoInListGoods> {
    let params = new HttpParams();
    params = params.append("id", id);
    let res = await this.getCustomApi("GetInfoInListGoods", params).toPromise();
    if (!this.isValidResponse(res)) return;
    return res.data as InfoInListGoods;
  }

  async BlockListGoodsAsync(viewMode: ListGoods): Promise<ResponseModel> {
    return await this.postCustomApi("BlockListGoods", viewMode).toPromise();
  }

  unBlock(id: any): Observable<ResponseModel> {
    let params = new HttpParams;
    params = params.append("id", id);
    return super.getCustomApi("UnBlock", params);
  }

  async getListGoodsReceiveMulselect(fromHubId?: any): Promise<SelectModel[]> {
    let params = new HttpParams();
    params = params.append("fromHubId", fromHubId);
    const res = await this.getCustomApi("GetListGoodsReceive", params).toPromise();
    if (res.isSuccess) {
      const listGoods = [];
      res.data.forEach(element => {
        if (element) {
          listGoods.push({
            label: `${element.code} - ${element.fromHubCode} - ${element.totalShipmentReceive}`,
            value: element.id
          });
        }
      });
      return listGoods;
    }
  }
}