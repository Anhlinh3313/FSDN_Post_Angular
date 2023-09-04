import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";
import { ResponseModel } from '../models/response.model';
import { GeneralService } from './general.service';
import { HttpParams } from '@angular/common/http';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { ListUpdateStatusViewModel } from '../view-model/index';

import * as moment from 'moment';
import { IdViewModel } from '../view-model/id.viewModel';
import { RequestShipment } from '../models/RequestShipment.model';
import { MessageService } from 'primeng/components/common/messageservice';
import { RequestShipmentFilterViewModel } from '../models/abstract/requestShipmentFilterViewModel.interface';
import { ResponseOfRequestShipment } from '../models/abstract/responseOfRequestShipment.interface';


@Injectable()
export class RequestShipmentService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "requestShipment");
  }

  getByType(type: string, arrCols: string[] = [], pageSize: number = undefined, pageNumber: number = undefined) {
    let params = new HttpParams();
    params = params.append("type", type);
    return super.getCustomApiPaging("getByType", arrCols, params, pageSize, pageNumber);
  }

  async getByTypeAsync(type: string, arrCols: string[] = [], pageSize: number = undefined, pageNumber: number = undefined) {
    return await this.getByType(type, arrCols, pageSize, pageNumber).toPromise();
  }


  getWaitingForPickup() {
    let params = new HttpParams();
    return super.getCustomApi("GetWaitingForPickup", params);
  }

  async getWaitingForPickupAsync(): Promise<number> {
    let res = await this.getWaitingForPickup().toPromise();
    if (!this.isValidResponse(res)) return 0;
    return res.data.dataCount;
  }

  trackingShort(shipmentNumber: string, arrCols: string[]) {
    let params = new HttpParams();
    params = params.append("shipmentNumber", shipmentNumber);
    return super.getCustomApiPaging("trackingShort", arrCols, params)
  }

  async trackingShortAsync(shipmentNumber: string, arrCols: string[]): Promise<RequestShipment> {
    const res = await this.trackingShort(shipmentNumber, arrCols).toPromise();
    if (!this.isValidResponse(res)) return;

    if (res.isSuccess) {
      const data = res.data as RequestShipment;
      return data;
    } else {
      return null;
    }
  }
  //
  async trackingShortAsyncNoMessage(shipmentNumber: string, arrCols: string[]): Promise<RequestShipment> {
    const res = await this.trackingShort(shipmentNumber, arrCols).toPromise();
    if (res.isSuccess) {
      const data = res.data as RequestShipment;
      return data;
    } else {
      return null;
    }
  }
  //
  async trackingShortForWareHousingAsync(shipmentNumber: string, arrCols: string[]): Promise<ResponseModel> {
    return await this.trackingShort(shipmentNumber, arrCols).toPromise();
  }

  UpdateStatusCurrentEmp(model: ListUpdateStatusViewModel) {
    return super.postCustomApi("UpdateStatusCurrentEmp", model);
  }

  assignPickupList(model: ListUpdateStatusViewModel) {
    return super.postCustomApi("assignPickupList", model);
  }

  assignUpdatePickupList(model: ListUpdateStatusViewModel) {
    return super.postCustomApi("assignUpdatePickupList", model);
  }

  pickupCancel(model: any) {
    return super.postCustomApi("pickupCancel", model);
  }

  acceptCompleteByWarehousing(model: RequestShipment) {
    return super.postCustomApi("acceptCompleteByWarehousing", model);
  }

  async acceptCompleteByWarehousingAsync(model: RequestShipment): Promise<any> {
    const res = await this.acceptCompleteByWarehousing(model).toPromise();
    if (!this.isValidResponse(res)) return;
    if (res.isSuccess) {
      return true;
    }
    return false;
  }

  getPickupHistory(fromDate: any, toDate: any) {
    let params = new HttpParams();

    params = params.append("fromDate", moment(fromDate).format('YYYY/MM/DD 00:00:00'));
    params = params.append("toDate", moment(toDate).format('YYYY/MM/DD 23:59:59'));

    return super.getCustomApi("getPickupHistory", params)
  }

  getByStatusIds(ids: number[], arrCols: string[] = []): Observable<ResponseModel> {
    let obj = new IdViewModel();
    obj.ids = ids;
    obj.cols = arrCols.join(",");
    return super.postCustomApi("getByStatusIds", obj);
  }

  getListRequestShipmentKeeping(userId: number, recovery?: any, dateFrom?: any, dateTo?: any, cols?: string[], pageSize?: number, pageNumber?: number) {
    let params = new HttpParams();
    params = params.append("userId", userId + "");
    params = params.append("recovery ", recovery);
    params = params.append("dateFrom", dateFrom);
    params = params.append("dateTo", dateTo);
    return super.getCustomApiPaging("GetListRequestShipmentKeeping", cols, params, pageSize, pageNumber);
  }

  async getListRequestShipmentKeepingAsync(userId: number, recovery?: any, dateFrom?: any, dateTo?: any, cols?: string[], pageSize?: number, pageNumber?: number) {
    const res = await this.getListRequestShipmentKeeping(userId, recovery, dateFrom, dateTo, cols, pageSize, pageNumber).toPromise();
    if (res.isSuccess) {
      const data = res.data as RequestShipment[];
      return data;
    } else {
      return null;
    }
  }

  getByListCode(listCode: string[]) {
    return super.postCustomUrlApi(environment.apiPostUrl, "getByListCode", listCode);
  }

  async getByListCodeAsync(listCode: string[]): Promise<RequestShipment[]> {
    const res = await this.getByListCode(listCode).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as RequestShipment[];
    return data;
  }

  getByParentRequestShipmentId(requestShipmentId: number, cols?: string[]) {
    let params = new HttpParams();
    params = params.append("requestShipmentId", requestShipmentId + "");
    return super.getCustomApiPaging("getByParentRequestShipmentId", cols, params);
  }

  async getByParentRequestShipmentIdAsync(requestShipmentId: number, cols?: string[]): Promise<any> {
    const res = await this.getByParentRequestShipmentId(requestShipmentId, cols).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as any;
    return data;
  }

  postByTypeByProc(model: RequestShipmentFilterViewModel): Observable<ResponseOfRequestShipment> {
    if (model.isEnabled == null) {
      model.isEnabled = true; // mặc định isEnabled = true
    }
    if (model.isSortDescending == null) {
      model.isSortDescending = true; // mặc định sắp xếp id giảm dần
    }
    return super.postCustomApi("postByTypeByProc", model) as Observable<ResponseOfRequestShipment>;
  }

  async postByTypeByProcAsync(model: RequestShipmentFilterViewModel): Promise<ResponseOfRequestShipment> {
    let res = await this.postByTypeByProc(model).toPromise();
    return res;
  }
}
