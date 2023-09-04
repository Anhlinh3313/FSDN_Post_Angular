import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { PaymentType } from "../models/paymentType.model";
import { GeneralService } from "./general.service";
import { PersistenceService } from "angular-persistence";
import { environment } from "../../environments/environment";
import { HttpParams } from "@angular/common/http";
import { SelectItem } from "primeng/primeng";
import { ListCustomerTypeIdHelper } from "../infrastructure/listCustomerTypeIdHelper";
import { SelectModel } from "../models/select.model";
import { MessageService } from "primeng/components/common/messageservice";

@Injectable()
export class PaymentTypeService extends GeneralService {
  paymentTypes: SelectItem[];
  constructor(
    protected messageService: MessageService,
    protected httpClient: HttpClient,
    protected persistenceService: PersistenceService,
  ) {
    super(
      messageService,
      httpClient,
      persistenceService,
      environment.apiPostUrl,
      "paymentType"
    );
  }

  getPaymentdByCustomerTypeID(
    customerTypeID: number
  ) {
    return this.getAll().map(x => {
      let data = x.data as PaymentType[];
      this.paymentTypes = [];
      this.paymentTypes.push({ label: "-- Chọn dữ liệu --", title: null, value: null });

      if (customerTypeID === ListCustomerTypeIdHelper.NON_CONTRACT_USER || !customerTypeID) {
        data.splice(1, 1);
        data.forEach(element => {
          this.paymentTypes.push({
            label: `${element.code} - ${element.name}`,
            title: element.name,
            value: element.id
          });
        });
      }

      if (customerTypeID === ListCustomerTypeIdHelper.CONTRACT_USER) {
        data.forEach(element => {
          this.paymentTypes.push({
            label: `${element.code} - ${element.name}`,
            title: element.name,
            value: element.id
          });
        });
      }
      return this.paymentTypes;
    });
  }

  async getSelectModelPaymentdByCustomerTypeIDAsync(customerTypeID: number): Promise<SelectItem[]> {
    const res = await this.getAll().toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as PaymentType[];
    this.paymentTypes = [];
    this.paymentTypes.push({ label: "-- Chọn dữ liệu --", title: null, value: null });
    if (customerTypeID === ListCustomerTypeIdHelper.NON_CONTRACT_USER || !customerTypeID) {
      data.splice(1, 1);
      data.forEach(element => {
        this.paymentTypes.push({
          label: `${element.code} - ${element.name}`,
          title: element.name,
          value: element.id
        });
      });
    }

    if (customerTypeID === ListCustomerTypeIdHelper.CONTRACT_USER) {
      data.forEach(element => {
        this.paymentTypes.push({
          label: `${element.code} - ${element.name}`,
          title: element.name,
          value: element.id
        });
      });
    }
    return this.paymentTypes;
  }

  public getByCode(userName: string) {
    let params = new HttpParams();
    params = params.append("code", userName);
    return super.getCustomApi("GetByCode", params);
  }

  async getAllSelectModelAsync(): Promise<SelectModel[]> {
    const res = await this.getAll().toPromise();
    if (res.isSuccess) {
      const data = res.data as PaymentType[];
      if (data) {
        const paymentType: SelectModel[] = [];
        paymentType.push({ label: `-- Chọn tất cả --`, value: null });
        data.forEach(element => {
          paymentType.push({
            label: `${element.code} - ${element.name}`,
            value: element.id,
            data: element
          });
        });
        return paymentType;
      }
    } else {
      return null;
    }
  }
}
