import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { GeneralService } from './general.service';
import { environment } from '../../environments/environment';
import { PersistenceService } from 'angular-persistence';
import { GeneralInfoModel } from '../models/generalInfo.model';
import { MessageService } from 'primeng/components/common/messageservice';

@Injectable()
export class GeneralInfoService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiGeneralUrl, "generalInfo");
  }

  get() {
    return super.getCustomApiPaging("get");
  }

  async getAsync(): Promise<any> {
    const res = await this.get().toPromise();
    if(!this.isValidResponse(res)) return;
    const data = res.data as GeneralInfoModel;
    return data;
  }

  getGenerlInfo() {
    return this.get().map(x => {
      let general = x.data as GeneralInfoModel;
      let model: any = [];
      model.companyName = general.companyName.toLocaleUpperCase();
      model.logoUrl = general.logoUrl;
      model.hotLine = general.hotLine;
      model.centerHubAddress = general.addressMain;
      return model;
    });
  }
}