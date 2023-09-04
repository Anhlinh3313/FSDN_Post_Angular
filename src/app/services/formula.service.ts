import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { MessageService } from 'primeng/components/common/messageservice';
import { SelectItem } from 'primeng/primeng';

@Injectable()
export class FormulaService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "formula");
  }

  async getSelectItemAsync(): Promise<SelectItem[]> {
    const res = await this.getAllAsync();
    if(!this.isValidResponse(res)) return;
    const data = res.data;
    let allFormula: SelectItem[] = [];
    allFormula.push({ label: `-- Chọn công thức --`, value: null });
    data.forEach(element => {
      allFormula.push({
        label: element.name,
        value: element.id
      });
    });
    return allFormula;
  }
}