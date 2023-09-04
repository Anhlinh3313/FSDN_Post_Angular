import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
//
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { TPL } from '../models';
import { SelectItem } from 'primeng/primeng';
import { MessageService } from 'primeng/components/common/messageservice';

@Injectable()
export class TPLService extends GeneralService {
  partners: SelectItem[];
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "TPL");
  }

  getAllTPL() {
    return this.getAll().map(x => {
      let data = x.data as TPL[];
      this.partners = [];
      this.partners.push({ label: "--Chọn đối tác--", value: null });
      if (data) {
          data.forEach(element => {
              this.partners.push({ label: element.name, value: element.id });
          });
      }
      return this.partners;
    });
  }

  async getAllSelectItemTPLAsync (): Promise<SelectItem[]> {
    const res = await this.getAll().toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as TPL[];
    let tpls: SelectItem[] = [];
    data.forEach(element => {
      tpls.push({ label: element.code, value: element.id });
    });
    return tpls;
  }
}
