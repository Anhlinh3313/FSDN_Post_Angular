export class ShipmentVersionHelper {
  static getDiff(defaultObject: any, changedObject: any): string {
    const diff: any = Object.keys(changedObject).reduce((diff, key) => {
      if (defaultObject[key] == changedObject[key]) return diff;

      // map các cột thay đổi dữ liệu sang tiếng việt
      if (key === "orderDate") {
        key = "Ngày gửi";
      } else if (key === "expectedDeliveryTime") {
        key = "TG dự kiến GH";
      } else if (key === "priceListId") {
        key = "Bảng giá";
      } else if (key === "senderId") {
        key = "KH gửi";
      } else if (key === "companyFrom") {
        key = "Cty gửi";
      } else if (key === "cusDepartmentId") {
        key = "Phòng Ban";
      } else if (key === "senderPhone") {
        key = "Sđt gửi";
      } else if (key === "senderName") {
        key = "Tên người gửi";
      } else if (key === "addressNoteFrom") {
        key = "Địa chỉ gửi chi tiết";
      } else if (key === "pickUserId") {
        key = "NV lấy hàng";
      } else if (key === "pickingAddress") {
        key = "Địa chỉ gửi";
      } else if (key === "fromHubId") {
        key = "Hub gửi";
      } else if (key === "receiverPhone") {
        key = "Sđt nhận";
      } else if (key === "receiverName") {
        key = "Tên người nhận";
      } else if (key === "addressNoteTo") {
        key = "Địa chỉ nhận chi tiết";
      } else if (key === "shippingAddress") {
        key = "Địa chỉ nhận chỉ";
      } else if (key === "toHubId") {
        key = "Hub nhận";
      } else if (key === "structureId") {
        key = "Loại HH";
      } else if (key === "weight") {
        key = "Trọng lượng";
      } else if (key === "totalBox") {
        key = "Số kiện";
      } else if (key === "calWeight") {
        key = "TL QĐ";
      } else if (key === "cod") {
        key = "COD";
      } else if (key === "insured") {
        key = "Khai giá";
      } else if (key === "totalItem") {
        key = "Số lượng";
      } else if (key === "content") {
        key = "Nội dung HH";
      } else if (key === "cusNote") {
        key = "Ghi chú";
      } else if (key === "paymentTypeId") {
        key = "HTTT";
      } else if (key === "serviceId") {
        key = "DV";
      } else if (key === "serviceDVGTIds") {
        key = "DVGT";
      } else if (key === "defaultPrice") {
        key = "Cước chính";
      } else if (key === "remoteAreasPrice") {
        key = "VSVX";
      } else if (key === "fuelPrice") {
        key = "PXD";
      } else if (key === "totalDVGT") {
        key = "Tổng phí DVGT";
      } else if (key === "otherPrice") {
        key = "Phụ phí khác";
      } else if (key === "vatPrice") {
        key = "VAT";
      } else if (key === "totalPrice") {
        key = "Tổng cước";
      } else if (key === "isAgreementPrice") {
        key = "Giá thỏa thuận";
      }

      return {
        ...diff,
        [key]: key
      };
    }, {});

    const arrKeys: string[] = Object.keys(diff);
    // console.log(arrKeys);
    // loại những cột không cần check thay đổi
    let listDuplicate: string[] = [
      "expectedDeliveryTimeSystem",
      "startPickTime",
      "serviceDVGTs",
      "shipmentServiceDVGTs",
      "priceDVGTs",
      "fromProvinceId",
      "fromDistrictId",
      "fromWardId",
      "fromHubRoutingId",
      "toProvinceId",
      "toDistrictId",
      "toWardId",
      "toHubRoutingId",
      "keepingTotalPriceEmpId",
      "keepingTotalPriceHubId",
      "keepingCODEmpId",
      "keepingCODHubId",
      "boxes",
      "isCreateMissingInfo"
    ];

    if (!defaultObject.serviceDVGTIds) {
      listDuplicate.push("DVGT");
    }
    const arrDiff: string[] = arrKeys.filter(x => !listDuplicate.includes(x));
    let stringDiff: string = arrDiff.join(", ");
    return stringDiff.trim();
  }
}
