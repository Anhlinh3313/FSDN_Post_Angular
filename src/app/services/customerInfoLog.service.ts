import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";

import { ResponseModel } from '../models/response.model';
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { HttpParams } from '@angular/common/http';
import { CustomerInfoLog } from '../models/customerInfoLog.model';
import { MessageService } from 'primeng/components/common/messageservice';

@Injectable()
export class CustomerInfoLogService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiCRMUrl, "customerInfoLog");
  }

  createOrUpdate(model: CustomerInfoLog): Observable<ResponseModel> {
    return super.postCustomApi("createOrUpdate", model);
  }

  async createOrUpdateAsync(model: CustomerInfoLog): Promise<any> {
    const res = await this.createOrUpdate(model).toPromise();
    if (res.isSuccess) {
      const data = res.data as CustomerInfoLog;
      return data;
    } else {
      return null;
    }
  }

  search(text: any, senderId: any): Observable<ResponseModel> {
    let params = new HttpParams();
    params = params.append("text", text);
    params = params.append("senderId", senderId);
    return super.getCustomApi("search", params);
  }

  async searchAsync(text: any, senderId: any): Promise<CustomerInfoLog[]> {
    const res = await this.search(text, senderId).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as CustomerInfoLog[];
    return data;
  }

  async getAllAsync(): Promise<any> {
    const res = await this.getAll().toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as CustomerInfoLog[];
    return data;
  }

  async getInfoLogByAsync(senderId: any, code: any): Promise<CustomerInfoLog> {
    let params = new HttpParams();
    params = params.append("senderId", senderId);
    params = params.append("code", code);
    const res = await super.getCustomApi("GetInfoLogBy", params).toPromise();
    if (!this.isValidResponse(res)) return;
    return res.data as CustomerInfoLog;
  }
}