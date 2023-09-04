import { Shipment } from "./shipment.model";


export class PrintModel extends Shipment {
    createdHub: string;
    type: string;
    fromAirport: string;
    createdBy: string;
    createdPhone: string;
    receiverBy: string;
    receiverPhone: string;
    listShipment: {
        shipmentNumber: string,
        senderName: string,
        receiverName: string,
        fromWard: string,
        toWard: string,
        service: string,
        shippingAddress: string,
        totalBox: number,
        weight: number,
        sender: string,
        numPick: number,
        deliveryupAppointmentTime: string,
        totalPrice: number,
        cod: number,
        toHubRouting: string,
        cusNote: string,
        deliveryNote: string,
        shipmentStatus: string,
        package: string,
    };
    getFullYear: number;
    printTime: Date;
    // print multi code
    generatorBoxBarcode: string;
    // print serviceDVGTs
    serviceDVGTIdsName: string;
}