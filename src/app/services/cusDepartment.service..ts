import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";

import { Department } from '../models/department.model';
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { MessageService } from 'primeng/components/common/messageservice';
import { SelectItem } from 'primeng/primeng';
import { CusDepartment } from '../models/cusDepartment.model';
import { SelectModel } from '../models/select.model';

@Injectable()
export class CusDepartmentService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiCRMUrl, "CusDepartment");
  }

  getByCustomerId(customerId: any) {
    let params = new HttpParams();
    params = params.append("customerId", customerId);
    return super.getCustomApi("getByCustomerId", params);
  }

  async getByCustomerIdAsync(customerId: any): Promise<Department[]> {
    const res = await this.getByCustomerId(customerId).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Department[];
    return data;
  }

  async getSelectModelByCustomerIdAsync(customerId: any): Promise<SelectModel[]> {
    const res = await this.getByCustomerIdAsync(customerId);
    const cusDepartments: SelectModel[] = [];
    cusDepartments.push({ label: `-- Chọn phòng ban --`, value: null });
    if (res) {
      res.forEach(element => {
        cusDepartments.push({
          label: `${element.code} - ${element.name}`,
          value: element.id,
          data: element
        });
      });
      return cusDepartments;
    } else {
      return null;
    }
  }

  async getAsync(id: number): Promise<any> {
    const res = await this.get(id).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as CusDepartment;
    return data;
  }
}