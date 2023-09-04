export interface SumOfReport{
    sumOfTotalPriceByReportListGoodsPriceCustomer?: number; // tổng cước trong báo cáo bảng kê cước chi tiết theo khách hàng
    //
    sumOfTotalBeforeByReportDebtPriceDetailCustomer?: number; // tổng dư nợ đầu kỳ trong báo cáo công nợ cước chi tiết theo khách hàng
    sumOfTotalPriceByReportDebtPriceDetailCustomer?: number; // tổng cước phát sinh trong kỳ trong báo cáo công nợ cước chi tiết theo khách hàng
    sumOfTotalPricePaidByReportDebtPriceDetailCustomer?: number; // tổng cước thanh toán trong kỳ trong báo cáo công nợ cước chi tiết theo khách hàng
    sumOfTotalAfterPaidByReportDebtPriceDetailCustomer?: number; // tổng dư có cuối kỳ trong báo cáo công nợ cước chi tiết theo khách hàng
    //
    sumOfTotalBeforeByReportDebtPriceDetailCustomerDetail?: number; // tổng dư nợ đầu kỳ trong báo cáo công nợ cước chi tiết theo khách hàng - xem chi tiết bill
    sumOfTotalCreditBalanceBeforeByReportDebtPriceDetailCustomerDetail?: number; // tổng dư có đầu kỳ trong báo cáo công nợ cước chi tiết theo khách hàng - xem chi tiết bill
    sumOfTotalPriceByReportDebtPriceDetailCustomerDetail?: number; // tổng cước phát sinh trong kỳ trong báo cáo công nợ cước chi tiết theo khách hàng - xem chi tiết bill
    sumOfTotalPricePaidByReportDebtPriceDetailCustomerDetail?: number; // tổng thanh toán trong báo cáo công nợ cước chi tiết theo khách hàng - xem chi tiết bill
    //
    sumOfTotalCODByReportDebtCODDetailCustomer?: number; // tổng COD trong báo cáo công nợ COD chi tiết theo khách hàng
    sumOfTotalCODReturnByReportDebtCODDetailCustomer?: number; // tổng COD hoàn trong báo cáo công nợ COD chi tiết theo khách hàng
    sumOfTotalCODChargedByReportDebtCODDetailCustomer?: number; // tổng đã thu COD trong kỳ trong báo cáo công nợ COD chi tiết theo khách hàng
    sumOfTotalCODNotChargedByReportDebtCODDetailCustomer?: number; // tổng đã chưa thu COD trong báo cáo công nợ COD chi tiết theo khách hàng
    sumOfTotalCODPaidByReportDebtCODDetailCustomer?: number; // tổng đã thanh toán COD trong báo cáo công nợ COD chi tiết theo khách hàng
    sumOfTotalCODNotPaidByReportDebtCODDetailCustomer?: number; // tổng chưa thanh toán COD trong báo cáo công nợ COD chi tiết theo khách hàng
    sumOfTotalPriceByReportDebtCODDetailCustomer?: number; // tổng cước trong báo cáo công nợ COD chi tiết theo khách hàng
    sumOfTotalPricePaidByReportDebtCODDetailCustomer?: number; // tổng đã thanh toán cước trong báo cáo công nợ COD chi tiết theo khách hàng
    sumOfTotalPriceNotPaidByReportDebtCODDetailCustomer?: number; // tổng chưa thanh toán cước trong báo cáo công nợ COD chi tiết theo khách hàng
    //
    sumOfTotalCODByReportDebtCODDetailCustomerDetail?: number; // tổng COD trong báo cáo công nợ COD chi tiết theo khách hàng - xem chi tiết bill
    sumOfTotalCODReturnByReportDebtCODDetailCustomerDetail?: number; // tổng COD hoàn trong báo cáo công nợ COD chi tiết theo khách hàng - xem chi tiết bill
    sumOfTotalCODChargedByReportDebtCODDetailCustomerDetail?: number; // tổng đã thu COD trong kỳ trong báo cáo công nợ COD chi tiết theo khách hàng - xem chi tiết bill
    sumOfTotalCODNotChargedByReportDebtCODDetailCustomerDetail?: number; // tổng đã chưa thu COD trong báo cáo công nợ COD chi tiết theo khách hàng - xem chi tiết bill
    sumOfTotalCODPaidByReportDebtCODDetailCustomerDetail?: number; // tổng đã thanh toán COD trong báo cáo công nợ COD chi tiết theo khách hàng - xem chi tiết bill
    sumOfTotalCODNotPaidByReportDebtCODDetailCustomerDetail?: number; // tổng chưa thanh toán COD trong báo cáo công nợ COD chi tiết theo khách hàng - xem chi tiết bill
    sumOfTotalPriceByReportDebtCODDetailCustomerDetail?: number; // tổng cước trong báo cáo công nợ COD chi tiết theo khách hàng - xem chi tiết bill
    sumOfTotalPricePaidByReportDebtCODDetailCustomerDetail?: number; // tổng đã thanh toán cước trong báo cáo công nợ COD chi tiết theo khách hàng - xem chi tiết bill
    sumOfTotalPriceNotPaidByReportDebtCODDetailCustomerDetail?: number; // tổng chưa thanh toán cước trong báo cáo công nợ COD chi tiết theo khách hàng - xem chi tiết bill    
}
