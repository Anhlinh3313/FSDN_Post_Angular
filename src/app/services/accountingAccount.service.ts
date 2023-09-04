import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { GeneralService } from './general.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { SelectModel } from '../models/select.model';
import { ListReceiptMoney, AccountingAccount } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AccountingAccountService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "AccountingAccount");
  }

  async getSelectModelAsync(): Promise<SelectModel[]> {
    const res = await this.getCustomApi("GetAll", null).toPromise();
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

  async getSelectModelByTypeAsync(model: ListReceiptMoney): Promise<SelectModel[]> {
    const res = await super.postCustomApi("GetAccountingByType", model).toPromise();
    if (!this.isValidResponse(res)) return;
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
