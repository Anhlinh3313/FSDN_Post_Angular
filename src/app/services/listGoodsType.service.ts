import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";

import { ResponseModel } from '../models/response.model';
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { IdViewModel } from '../view-model';
import { MessageService } from 'primeng/components/common/messageservice';
import { SelectItem } from 'primeng/primeng';
import { ListGoodsType } from '../models/listGoodsType.model';

@Injectable()
export class ListGoodsTypeService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "listGoodsType");
  }

  getByIds(ids: number[], arrCols?: string[]): Observable<ResponseModel> {
    let obj = new IdViewModel();
    obj.ids = ids;
    obj.cols = arrCols.join(",");
    return super.postCustomApi("getByIds", obj);
  }

  async getSelectItemByIdsAsync(ids: number[], arrCols?: string[]): Promise<SelectItem[]> {
    const res = await this.getByIds(ids, arrCols).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as ListGoodsType[];
    const listGoodsTypes: SelectItem[] = [];
    // listGoodsTypes.push({ label: "-- Chọn dữ liệu --", value: null });
    data.forEach(element => {
      if (element) {
        listGoodsTypes.push({
          label: `${element.name}`,
          value: element.id
        });
      }
    });
    return listGoodsTypes;
  }
}
