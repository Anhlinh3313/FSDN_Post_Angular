import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Department } from '../models/department.model';
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { MessageService } from 'primeng/components/common/messageservice';

@Injectable()
export class DepartmentService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiGeneralUrl, "department");
  }

  getDepartment(id: number) {
    return this.get(id).map(x => {
      let data = x.data;
      return data;
    });
  }

  async getDepartmentAsync(id: number): Promise<Department> {
    const res = await this.get(id).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Department;
    return data;
  }

  async getAsync(id: number, arrCols?: string[]): Promise<any> {
    const res = await this.get(id).toPromise();
    if (res.isSuccess) {
      const data = res.data as Department;
      return data;
    } else {
      return null;
    }
  }
}