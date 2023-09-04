import { Customer } from "../models";
import { ShipmentCalculateViewModel } from "../view-model";

export class ServiceHelper {
    static checkParams(customer: Customer, fromDistrictId: number, fromWardId: number, toDistrictId: number, chargeWeight: number) {
        let model: ShipmentCalculateViewModel = new ShipmentCalculateViewModel();
        if ((fromDistrictId || fromWardId) &&
          toDistrictId &&
          chargeWeight > 0
        ) {
          if (customer) {
            model.senderId = customer.id;
          }
          model.fromDistrictId = fromDistrictId;
          model.fromWardId = fromWardId;
          model.toDistrictId = toDistrictId;
          model.weight = chargeWeight;
          return model;
        } else {
            return model;
        }
    }
}