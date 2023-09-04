import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { GeneralService } from './general.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { SelectModel } from '../models/select.model';

@Injectable({
  providedIn: 'root'
})
export class AccountBankService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "AccountBank");
  }

  async getBankSelectModel(): Promise<SelectModel[]> {
    const res = await this.getCustomApi("GetBankAll", null).toPromise();
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

  async getBranchByBankIdSelectModel(bankId): Promise<SelectModel[]> {
    let params = new HttpParams();
    params = params.append("bankId", bankId);

  const res = await this.getCustomApi("GetBranchBy", params).toPromise();
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
