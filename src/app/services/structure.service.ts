import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Structure } from '../models/structure.model';
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { HttpParams } from '@angular/common/http';
import { SelectModel } from '../models/select.model';
import { MessageService } from 'primeng/components/common/messageservice';

@Injectable()
export class StructureService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "structure");
  }

  public getByCode(userName: string){
    let params = new HttpParams();
    params = params.append("code", userName);
    return super.getCustomApi("GetByCode", params);
  }

  async getSelectModelStructuresAsync(): Promise<SelectModel[]> {
    const res = await this.getAll().toPromise();
    if (res.isSuccess) {
      const data = res.data as Structure[];
      let structures: SelectModel[] = [];
      structures.push({ label: "-- Chọn dữ liệu --", title: null, value: null });
      data.forEach(element => {
        structures.push({
          label: `${element.code} - ${element.name}`,
          title: element.name,
          value: element.id
        });
      });
      return structures;
    } else {
      return null;
    }
  }
}