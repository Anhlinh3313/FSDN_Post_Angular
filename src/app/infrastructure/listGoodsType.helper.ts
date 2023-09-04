export class ListGoodsTypeHelper {
    static customerPaymentTotalPrice = 1;
    static printCustomerPaymentTotalPrice: string = "print-customer-payment-totalPrice";
    static customerPaymentTotalPriceTypeName: string = "BK thanh toán cước";
    static receiptPickup = 2;
    static detailDelivery = 3;
    static printDetailDelivery: string = "print-detail-delivery";
    static detailDeliveryTypeName: string = "BK chi tiết giao hàng";
    static receiptDelivery = 7;
    static detailTranfer = 8;
    static printDetailTranfer: string = "print-detail-transfer";
    static detailTranferTypeName: string = "BK chi tiết trung chuyển";
    static receiptTranfer = 9;
    static printReceiptTranfer: string = "print-receipt-transfer"; 
    static receiptTranferTypeName: string = "BK nhập kho trung chuyển";
    static detailReturn = 10;
    static printDetailReturn: string = "print-detail-return";
    static detailReturnTypeName: string = "BK chi tiết trả hàng";
    static receivedErrorTransfer = 12;
    static printReceivedErrorTransfer: string = "print-receivedError-transfer";
    static detailReceivedErrorTransfer: string = "BK nhập kho trung chuyển nhận bill lỗi";
    static detailIssueAll = 100;

    static printListGoodType(listGoodsTypeId: number): string {
        let id: string = "";
        switch (listGoodsTypeId) {
            case 1:
                id =  ListGoodsTypeHelper.printCustomerPaymentTotalPrice;
                break;
            case 3:
                id =  ListGoodsTypeHelper.printDetailDelivery;
                break;
            case 8:
                id =  ListGoodsTypeHelper.printDetailTranfer;
                break;
            case 9:
                id =  ListGoodsTypeHelper.printReceiptTranfer;
                break;
            case 10:
                id =  ListGoodsTypeHelper.printDetailReturn;
                break;

            default:
                break;
        }
        return id;
    }

    static ListGoodTypeName(listGoodsTypeId: number): string {
        let typeName: string = "";
        switch (listGoodsTypeId) {
            case 1:
            typeName =  ListGoodsTypeHelper.customerPaymentTotalPriceTypeName;
                break;
            case 3:
            typeName =  ListGoodsTypeHelper.detailDeliveryTypeName;
                break;
            case 8:
            typeName =  ListGoodsTypeHelper.detailTranferTypeName;
                break;
            case 9:
            typeName =  ListGoodsTypeHelper.receiptTranferTypeName;
                break;
            case 10:
            typeName =  ListGoodsTypeHelper.detailReturnTypeName;
                break;
            default:
                break;
        }
        return typeName;
    }
}