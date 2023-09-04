import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { GeneralService } from './general.service';
import { HttpParams } from '@angular/common/http';
import { Boxes } from '../models';
import { MessageService } from 'primeng/components/common/messageservice';
import { IdViewModel } from '../view-model';

@Injectable()
export class BoxService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "box");
  }

  getByShipmentId(id: any) {
    let params = new HttpParams();
    params = params.append("id", id);
    return super.getCustomApi("getByShipmentId", params);
  }

  async getByShipmentIdAsync(id: any): Promise<Boxes[]> {
    const res = await this.getByShipmentId(id).toPromise();
    if (res.isSuccess) {
      const data = res.data as Boxes[];
      return data;
    } else {
      return null;
    }
  }

  getListByShipmentIds(model: IdViewModel) {
    return super.postCustomApi("GetListByShipmentIds", model);
  }

  async getListByShipmentIdsAsync(model: IdViewModel): Promise<any[]> {
    const res = await this.getListByShipmentIds(model).toPromise();
    if (res.isSuccess) {
      const data = res.data as any[];
      return data;
    } else {
      return null;
    }
  }

  async createAsync(model: Boxes): Promise<any> {
    const res = await this.create(model).toPromise();
    if (res.isSuccess) {
      const data = res.data as Boxes;
      return data;
    } else {
      return null;
    }
  }

  async deleteAsync(model: any): Promise<any> {
    const res = await this.delete(model).toPromise();
    if (res.isSuccess) {
      const data = res.data as Boxes;
      return data;
    } else {
      return null;
    }
  }
}