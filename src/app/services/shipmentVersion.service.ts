import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";
import { ResponseModel } from '../models/response.model';
import { GeneralService } from './general.service';
import { HttpParams } from '@angular/common/http';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { IdViewModel } from '../view-model/index';
import { ShipmentVersion, Shipment } from '../models';
import { MessageService } from 'primeng/components/common/messageservice';


@Injectable()
export class ShipmentVersionService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "shipmentVersion");
  }

  getByShipmentId(id: any, cols: any) {
    let params = new HttpParams();
    params = params.append("id", id);
    params = params.append("cols", "CreatedByUser");
    return super.getCustomApi("getByShipmentId", params);
  }

  async getByShipmentIdAsync(id: any, cols: any): Promise<ShipmentVersion[]> {
    const res = await this.getByShipmentId(id, cols).toPromise();
    if (res.isSuccess) {
      const data = res.data as ShipmentVersion[];
      return data;
    } else {
      return null;
    }
  }

  async createAsync(model: Object): Promise<any> {
    const res = await this.create(model).toPromise();
    if(!this.isValidResponse(res)) return;
    const data = res.data as ShipmentVersion;
    return data;
  }  

  async getAsync(id: any, arrCols?: string[]): Promise<any> {
    const res = await this.get(id, arrCols).toPromise();
    if (res.isSuccess) {
      const data = res.data as Shipment;
      return data;
    } else {
      return null;
    }
  }

  async getAllAsync(arrCols?: string[]): Promise<any> {
    const res = await this.getAll(arrCols).toPromise();
    if (res.isSuccess) {
      const data = res.data as ShipmentVersion[];
      return data;
    } else {
      return null;
    }
  }

  getByListShipmentId(
    ids: number[],
    arrCols: string[] = []
  ): Observable<ResponseModel> {
    let obj = new IdViewModel();
    obj.ids = ids;
    obj.cols = arrCols.join(",");
    return super.postCustomApi("getByListShipmentId", obj);
  }

  async getGetByListShipmentIdAsync(ids: number[], arrCols?: string[]): Promise<ShipmentVersion[]> {
    const res = await this.getByListShipmentId(ids, arrCols).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as ShipmentVersion[];
    return data;
  }
}
