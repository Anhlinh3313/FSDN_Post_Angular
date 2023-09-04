import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { MessageService } from 'primeng/components/common/messageservice';
import { ShipmentStatus } from '../models/shipmentStatus.model';
import { SelectItem } from 'primeng/primeng';

@Injectable()
export class ShipmentStatusService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "shipmentStatus");
  }

  getByIds(ids: number[]) {
    return super.postCustomApi("getByIds", ids);
  }

  async getByIdsAsync(ids: number[]): Promise<ShipmentStatus[]> {
    const res = await this.getByIds(ids).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as ShipmentStatus[];
    return data;
  }

  async getAllSelectModelAsync(): Promise<SelectItem[]> {
    const res = await this.getAll().toPromise();
    if (res.isSuccess) {
      const data = res.data as ShipmentStatus[];
      if (data) {
        const province: SelectItem[] = [];
        province.push({ label: `-- Chọn tất cả --`, value: null });
        data.forEach(element => {
          province.push({
            label: `${element.name}`,
            value: element.id
          });
        });
        return province;
      }
    } else {
      return null;
    }
  }

  getAllSelectModelByType(type: string) {
    let params = new HttpParams();
    params = params.append("type", type);
    return super.getCustomApi("GetByType", params);
  }

  async getAllSelectModelByTypeAsync(type: string): Promise<SelectItem[]> {
    const res = await this.getAllSelectModelByType(type).toPromise();
    if (res.isSuccess) {
      const data = res.data as ShipmentStatus[];
      if (data) {
        const province: SelectItem[] = [];
        province.push({ label: `-- Chọn tất cả --`, value: null });
        data.forEach(element => {
          province.push({
            label: `${element.name}`,
            value: element.id
          });
        });
        return province;
      }
    } else {
      return null;
    }
  }

  async getAllSelectModelMultiSelectAsync(): Promise<SelectItem[]> {
    const res = await this.getAll().toPromise();
    if (res.isSuccess) {
      const data = res.data as ShipmentStatus[];
      if (data) {
        const province: SelectItem[] = [];
        data.forEach(element => {
          province.push({
            label: `${element.name}`,
            value: element.id
          });
        });
        return province;
      }
    } else {
      return null;
    }
  }
}