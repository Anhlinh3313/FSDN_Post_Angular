import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { MessageService } from 'primeng/components/common/messageservice';
import { SelectItem } from 'primeng/primeng';
import { ListGoodsStatus } from '../models/listGoodsStatus.model';

@Injectable()
export class ListGoodsStatusService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "listGoodsStatus");
  }

  async getAllSelectModelAsync(): Promise<SelectItem[]> {
    const res = await this.getAll().toPromise();
    if (res.isSuccess) {
      const data = res.data as ListGoodsStatus[];
      if (data) {
        const status: SelectItem[] = [];
        status.push({ label: `-- Chọn tất cả --`, value: null });
        data.forEach(element => {
          status.push({
            label: `${element.code} - ${element.name}`,
            value: element.id
          });
        });
        return status;
      }
    } else {
      return null;
    }
  }
}
