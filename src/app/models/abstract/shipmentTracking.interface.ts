import { Shipment } from "..";

export class ShipmentTracking extends Shipment {
      fromHubName?: string;
      fromHubRoutingName?: string;
      fromWardName?: string;
      toHubName?: string;
      toHubRoutingName?: string;
      toWardName?: string;
      serviceName?: string;
      paymentTypeName?: string;
      shipmentStatusName?: string;
      fromDistrictName?: string;
      fromProvinceName?: string;
      toDistrictName?: string;
      toProvinceName?: string;
      requestShipmentNumber?: string;
      listGoodsName?: string;
      parrentShipmentNumber: string;
      childShipmentNumbers: string;
      shipmentTypeName: string;
      senderCode: string;
      structureName: string;
      serviceDVGTCodes: string;
      tplName: string;
      paymentCODCode: string;
}