import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { GeneralService } from './general.service';
import { environment } from '../../environments/environment';
import { PersistenceService } from 'angular-persistence';
import { MessageService } from 'primeng/components/common/messageservice';
import { SelectModel } from '../models/select.model';

@Injectable()
export class ChangeCODTypeService extends GeneralService {
    constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
        super(messageService, httpClient, persistenceService, environment.apiPostUrl, "changeCODType");
    }
    async getChangeCODTypeSelectModel(): Promise<SelectModel[]> {
        const res = await this.getAll().toPromise();
        if (res.isSuccess) {
          const selectModel = [];
          const datas = res.data as any[];
    
          selectModel.push({ label: "-- Chọn dữ liệu --", data: null, value: null });
          datas.forEach(element => {
            selectModel.push({
              label: `${element.code} - ${element.name}`,
              data: element,
              value: element.id
            });
          });
          return selectModel;
        }
      }
    
}
