import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Service } from '../models/service.model';
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { HttpParams } from '@angular/common/http';
import { SelectItem } from 'primeng/components/common/selectitem';
import { MessageService } from 'primeng/components/common/messageservice';
import { SelectModel } from '../models/select.model';

@Injectable()
export class ServiceService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "service");
  }

  public getByCode(userName: string) {
    let params = new HttpParams();
    params = params.append("code", userName);
    return super.getCustomApi("GetByCode", params);
  }

  public GetListService() {
    let params = new HttpParams();
    return super.getCustomApi("GetListService", params);
  }

  async GetListServiceAsync(): Promise<Service[]> {
    const res = await this.GetListService().toPromise();
    if(!this.isValidResponse(res)) return;
    const data = res.data as Service[];
    return data;
  }

  async getAllAsync(): Promise<any> {
    const res = await this.getAll().toPromise();
    if(!this.isValidResponse(res)) return;
    const data = res.data as Service[];
    return data;
  }

  async getAllServiceSelectModelAsync(): Promise<SelectItem[]> {
    const res = await this.getAll().toPromise();
    if (res.isSuccess) { 
      const data = res.data as Service[];
      if (data) {
        const allService: SelectModel[] = [];
        allService.push({ label: `-- Chọn dịch vụ --`, value: null, data: null });
        data.forEach(element => {
          allService.push({
            label: `${element.code} - ${element.name}`,
            value: element.id,
            data: element
          });
        });
        return allService;
      }
    } else {
      return null;
    }
  }

  async getAllSelectModelAsync(): Promise<SelectItem[]> {
    const res = await this.GetListService().toPromise();
    if (res.isSuccess) { 
      const data = res.data as Service[];
      if (data) {
        const allService: SelectModel[] = [];
        allService.push({ label: `-- Chọn dịch vụ --`, value: null, data: null });
        data.forEach(element => {
          allService.push({
            label: `${element.code} - ${element.name}`,
            value: element.id,
            data: element
          });
        });
        return allService;
      }
    } else {
      return null;
    }
  }

  public GetListServiceSub() {
    let params = new HttpParams();
    return super.getCustomApi("GetListServiceSub", params);
  }

  async GetListServiceSubAsync(): Promise<Service[]> {
    const res = await this.GetListServiceSub().toPromise();
    if(!this.isValidResponse(res)) return;
    const data = res.data as Service[];
    return data;
  }

  async getServiceSubSelectModelAsync(): Promise<SelectItem[]> {
    const res = await this.GetListServiceSub().toPromise();
    if (res.isSuccess) { 
      const data = res.data as Service[];
      if (data) {
        const allService: SelectModel[] = [];
        allService.push({ label: `-- Chọn dịch vụ --`, value: null, data: null });
        data.forEach(element => {
          allService.push({
            label: `${element.code} - ${element.name}`,
            value: element.id,
            data: element
          });
        });
        return allService;
      }
    } else {
      return null;
    }
  }
}