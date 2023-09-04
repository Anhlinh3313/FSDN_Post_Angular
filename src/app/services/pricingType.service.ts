import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Structure } from '../models/structure.model';
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { SelectModel } from '../models/select.model';
import { MessageService } from 'primeng/components/common/messageservice';

@Injectable()
export class PricingTypeService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "PricingType");
  }

  async getSelectModelPricingTypeAsync(): Promise<SelectModel[]> {
    const res = await this.getAll().toPromise();
    if (res.isSuccess) {
      const data = res.data as Structure[];
      let pricingType: SelectModel[] = [];
      pricingType.push({ label: "- Chọn dữ liệu -", title: null, value: null });
      data.forEach(element => {
        pricingType.push({
          label: `${element.code} - ${element.name}`,
          title: element.name,
          value: element.id
        });
      });
      return pricingType;
    } else {
      return null;
    }
  }
}