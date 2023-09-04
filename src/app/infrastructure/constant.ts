import { environment } from "../../environments/environment";

export const Constant = {
    messageStatus: {
        success: "success",
        info: "info",
        warn: "warn",
        error: "warn",
    },
    response: {
        isSuccess: "isSuccess",
        message: "message",
        data: "data",
        exception: "exception",
    },
    auths: {
        isLoginIn: 'crm-loggedIn',
        token: 'crm-token',
        userId: 'crm-userId',
        userName: 'crm-userName',
        currentUser: 'crm-currentUser',
        fullName: 'crm-fullName',
        tokenFirebase: 'crm-tokenFirebase',
        datetimeLogin: 'crm-datetimeLogin',
    },
    classes: {
        includes: {
            province: {
                country: "Country",
            },
            district: {
                province: "Province",
            },
            ward: {
                district: "District",
            },
            hub: {
                district: "District",
                ward: "Ward",
                centerHub: "CenterHub",
                poHub: "PoHub",
            },
            user: {
                department: "Department",
                role: "Role",
                hub: "Hub",
            },
            shipment: {
                cusDepartment: "CusDepartment",
                sender: "Sender",
                service: "Service",
                fromHub: "FromHub",
                toHub: "ToHub",
                fromHubRouting: "FromHubRouting",
                toHubRouting: "ToHubRouting",
                fromWard: "FromWard",
                fromDistrict: "FromWard.District",
                fromProvince: "FromWard.District.Province",
                toWard: "ToWard",
                toDistrict: "ToDistrict",
                toProvince: "ToProvince",
                shipmentStatus: "ShipmentStatus",
                package: "Package",
                pickUser: "PickUser",
                deliverUser: "DeliverUser",
                transferUser: "TransferUser",
                returnUser: "ReturnUser",
                transferReturnUser: "TransferReturnUser",
                receiveHub: "ReceiveHub",
                currentHub: "CurrentHub",
                currentEmp: "CurrentEmp",
                paymentType: "PaymentType",
                serviceDVGT: "ServiceDVGT",
                weight: "Weight",
                totalBox: "TotalBox",
                structure: "Structure",
                companyFrom: "CompanyFrom",
                companyTo: "CompanyTo",
                shipmentServiceDVGTs: "ShipmentServiceDVGTs",
                serviceDVGTIds: "ServiceDVGTIds",
                boxes: "Boxes",
                tpl: "TPL",
                listGoods: "ListGoods",
                requestShipment: "RequestShipment",
                paymentCODType: "PaymentTypeCOD",
                businessUser: "BusinessUser",
                receiver: "Receiver",
                parrentShipment: "ParrentShipment"
            },
            customer: {
                province: "Province",
                district: "District",
                ward: "Ward",
                paymentType: "PaymentType",
            },
            serviceDVGTPrice: {
                formula: "Formula",
                serviceDVGT: "ServiceDVGT",
                priceListDVGT: "PriceListDVGT",
                calculateBy: "CalculateBy"
            },
            priceServiceDetail: {
                priceService: "PriceService",
                area: "Area",
                weight: "Weight",
            },
            priceService: {
                priceList: "PriceList",
                service: "Service",
                areaGroup: "AreaGroup",
                weightGroup: "WeightGroup",
            },
            priceList: {
                hub: "Hub",
                priceListDVGT: "PriceListDVGT"
            },
            packagePriceList: {
                packType: "PackType",
                formula: "Formula",
            },
            weight: {
                formula: "Formula",
                weightGroup: "WeightGroup",
                structure: "Structure",
            },
            areaGroup: {
                hub: "Hub",
            },
            area: {
                areaGroup: "AreaGroup",
                province: "Province",
                district: "District",
            },
            listGoods: {
                createdByHub: "CreatedByHub",
                listGoodsTypeId: "ListGoodsTypeId",
                listGoodsType: "ListGoodsType",
                numPrint: "NumPrint",
                createdHub: "CreatedHub",
                createdWhen: "CreatedWhen",
                tpl: "TPL",
                listGoodsStatus: "ListGoodsStatus",
                fromHub: "FromHub",
                toHub: "ToHub",
                transportType: "TransportType",
                emp: "Emp",
            },
            listReceiptMoney: {
                fromHub: "FromHub",
                toHub: "ToHub",
                paidByEmp: "PaidByEmp",
                userCreated: "UserCreated",
                userModified: "UserModified",
                listReceiptMoneyStatus: "ListReceiptMoneyStatus",
                listReceiptMoneyType: "ListReceiptMoneyType",
                accountingAccount: "AccountingAccount"
            },
            listCustomerPayment: {
                hubCreated: "HubCreated",
                customer: "Customer",
                userCreated: "UserCreated",
                userModified: "UserModified",
                listCustomerPaymentType: "ListCustomerPaymentType"
            },
            transportType: {
                tplTransportTypes: "TPLTransportTypes.TPL",
            },
            provinceCode: {
                customer: "Customer",
                hub: "Hub",
                user: "User",
                provideCodeStatus: "ProvideCodeStatus"
            },
            truckSchedule: {
                fromHub: "FromHub",
                toHub: "ToHub",
                truckScheduleStatus: "TruckScheduleStatus",
                truck: "Truck"
            },
            truckScheduleDetail: {
                hub: "Hub",
                truckScheduleStatus: "TruckScheduleStatus"
            },
            uploadExcelHistory: {
                user: "User"
            }
        },
    },
    pages: {
        login: {
            name: 'Đăng nhập',
            alias: 'dang-nhap',
            hidden: true,
        },
        page404: {
            name: 'Không tìm thấy trang',
            alias: '404',
        },
        page403: {
            name: 'Không có quyền truy cập',
            alias: '403',
        },
        changePassWord: {
            name: 'Thay đổi mật khẩu',
            alias: 'thay-doi-mat-khau',
            loadChildren: './change-password/change-password.module#ChangePasswordModule',
            children: {
                changePassWord: {
                    name: 'Đổi mật khẩu',
                    alias: '',
                }
            }
        },
        gpsLocation: {
            name: 'Định vị GPS',
            alias: 'dinh-vi-gps',
            loadChildren: './gps-location/gps-location.module#GpsLocationModule',
            children: {
                gpsLocation: {
                    name: 'Định vị GPS',
                    alias: '',
                }
            }
        },
        request: {
            name: 'Quản lý yêu cầu',
            alias: 'quan-ly-yeu-cau',
            loadChildren: './request-management/request-management.module#RequestManagementModule',
            children: {
                listRequest: {
                    name: 'Danh sách yêu cầu',
                    alias: 'quan-ly-yeu-cau',
                }
            }
        },
        shipment: {
            name: 'Quản lý vận đơn',
            alias: 'quan-ly-van-don',
            loadChildren: './shipment-management/shipment-management.module#ShipmentManagementModule',
            children: {
                createShipment: {
                    name: 'Tạo vận đơn',
                    alias: 'tao-van-don',
                },
                createShipmentFast: {
                    name: 'Tạo bill nhanh',
                    alias: 'tao-bill-nhanh',
                },
                createShipmentRequest: {
                    name: 'Nhập bill tổng',
                    alias: 'nhap-bill-tong',
                },
                createShipmentExcel: {
                    name: 'Tạo vận đơn Excel',
                    alias: 'tao-van-don-excel',
                },
                createShipmentExcelBeta: {
                    name: 'Tạo vận đơn Excel Beta',
                    alias: 'tao-van-don-excel-beta',
                },
                listShipment: {
                    name: 'Danh sách vận đơn',
                    alias: 'danh-sach-van-don',
                },
                completeShipment: {
                    name: 'Hoàn thiện vận đơn',
                    alias: 'hoan-thien-van-don',
                },
                entryShipmentDetail: {
                    name: 'Nhập chi tiết',
                    alias: 'nhap-chi-tiet',
                },
                createShipmentSupport: {
                    name: 'Tạo vận đơn hỗ trợ',
                    alias: 'tao-van-don-ho-tro',
                },
                cancleShipment: {
                    name: 'Vận đơn đã hủy',
                    alias: 'van-don-da-huy',
                },
                incidentManagement: {
                    name: 'Vận đơn sự cố',
                    alias: 'van-don-su-co',
                },
                shipmentAwaiting: {
                    name: 'Vận đơn chờ xử lý',
                    alias: 'van-don-cho-xu-ly',
                },
                shipmentComplain: {
                    name: 'Yêu cầu khiếu nại',
                    alias: 'van-don-khieu-nai',
                },
                shipmentPrioritize: {
                    name: 'Báo vận đơn ưu tiên',
                    alias: 'bao-van-don-uu-tien',
                },
                managementCompensation: {
                    name: 'Danh sách đền bù',
                    alias: 'danh-sach-den-bu',
                },
                managementDelay: {
                    name: 'Danh sách delay',
                    alias: 'danh-sach-delay',
                },
                managementEditCOD: {
                    name: 'Điều chỉnh COD',
                    alias: 'dieu-chinh-cod',
                },
            }
        },
        pickup: {
            name: 'Quản lý lấy hàng',
            alias: 'quan-ly-lay-hang',
            loadChildren: './pickup-management/pickup-management.module#PickupManagementModule',
            children: {
                pickup: {
                    name: 'Chờ lấy hàng',
                    alias: 'cho-lay-hang',
                },
                updatePickupStatus: {
                    name: 'Cập nhật Tình trạng lấy hàng',
                    alias: 'cap-nhat-trang-thai-lay-hang',
                },
                historyPickup: {
                    name: 'Lịch sử lấy hàng',
                    alias: 'lich-su-lay-hang',
                },
            }
        }, warehouse: {
            name: 'Quản lý kho',
            alias: 'quan-ly-kho',
            loadChildren: './warehouse-management/warehouse-management.module#WarehouseManagementModule',
            children: {
                inventory: {
                    name: 'Hàng tồn kho',
                    alias: 'hang-ton-kho',
                },
                warehousing: {
                    name: 'Nhập kho',
                    alias: 'nhap-kho',
                }, wareHousingCheck: {
                    name: 'Nhập kho kiểm soát',
                    alias: 'nhap-kho-kiem-soat',
                },
                warehousingRequest: {
                    name: 'Nhập kho bill tổng',
                    alias: 'nhap-kho-bill-tong',
                },
                issueHistory: {
                    name: 'Lịch sử xuất kho',
                    alias: 'lich-su-xuat-kho',
                },
                wareHousingHistory: {
                    name: 'Lịch sử nhập kho',
                    alias: 'lich-su-nhap-kho',
                }
            }
        },
        delivery: {
            name: 'Quản lý giao hàng',
            alias: 'quan-ly-giao-hang',
            loadChildren: './delivery-management/delivery-management.module#DeliveryManagementModule',
            children: {
                delivery: {
                    name: 'Chờ giao hàng',
                    alias: 'cho-giao-hang',
                },
                updateDeliveryStatus: {
                    name: 'Cập nhật Tình trạng giao hàng',
                    alias: 'cap-nhat-trang-thai-giao-hang',
                },
                deliveryHistory: {
                    name: 'Lịch sử giao hàng',
                    alias: 'lich-su-giao-hang',
                },
            }
        },
        return: {
            name: 'Quản lý chuyển hoàn',
            alias: 'quan-ly-tra-hang',
            loadChildren: './return-management/return-management.module#ReturnManagementModule',
            children: {
                acceptReturn: {
                    name: 'Xác nhận chuyển hoàn',
                    alias: 'xac-nhan-tra-hang',
                },
                return: {
                    name: 'Chờ chuyển hoàn',
                    alias: 'cho-tra-hang',
                },
                updateReturnStatus: {
                    name: 'Cập nhật Tình trạng chuyển hoàn',
                    alias: 'cap-nhat-trang-thai-tra-hang',
                },
                cancelreturn: {
                    name: 'Chờ tạo chuyển hoàn',
                    alias: 'huy-tra-hang',
                },
                returnhistory: {
                    name: 'Lịch sử chuyển hoàn',
                    alias: 'lich-su-tra-hang',
                },
                waitReturn: {
                    name: 'Chờ duyệt chuyển hoàn',
                    alias: 'cho-duyet-chuyen-hoan',
                },
            }
        },
        transfer: {
            name: 'Quản lý trung chuyển',
            alias: 'quan-ly-trung-chuyen',
            loadChildren: './transfer-management/transfer-management.module#TransferManagementModule',
            children: {
                transferIssue: {
                    name: 'Xuất kho trung chuyển',
                    alias: 'xuat-kho-trung-chuyen',
                },
                transfer: {
                    name: 'Chờ trung chuyển',
                    alias: 'cho-trung-chuyen',
                },
                transferList: {
                    name: 'Đang trung chuyển',
                    alias: 'dang-trung-chuyen',
                },
                transferReceive: {
                    name: 'Nhận hàng trung chuyển',
                    alias: 'nhan-hang-trung-chuyen',
                },
                transferReship: {
                    name: 'Hàng chờ bổ sung',
                    alias: 'hang-cho-bo-sung',
                },
                listProcessError: {
                    name: 'Vận đơn sai quy trình',
                    alias: 'van-don-sai-quy-trinh',
                },
                listReceivedError: {
                    name: 'BK có Bill lỗi',
                    alias: 'bk-co-bill-loi',
                },
                transferHistory: {
                    name: 'Lịch sử',
                    alias: 'lich-su',
                },
            }
        },
        pack: {
            name: 'Quản lý đóng ' + environment.pack + '',
            alias: 'quan-ly-dong-goi',
            loadChildren: './pack-management/pack-management.module#PackManagementModule',
            children: {
                package: {
                    name: 'Đóng ' + environment.pack + '',
                    alias: 'dong-goi',
                },
                openPack: {
                    name: "Kiểm " + environment.pack + "",
                    alias: 'mo-goi',
                },
                listPackage: {
                    name: "Danh sách " + environment.pack + "",
                    alias: 'ds-goi',
                },
                historyPack: {
                    name: 'Lịch sử',
                    alias: 'lich-su',
                },
            }
        },
        general: {
            name: 'Quản lý chung',
            alias: 'quan-ly-chung',
            loadChildren: './general-management/general-management.module#GeneralManagementModule',
            children: {
                service: {
                    name: 'Dịch vụ',
                    alias: 'dich-vu',
                },
                paymentType: {
                    name: 'Hình thức thanh toán',
                    alias: 'hinh-thuc-thanh-toan',
                },
                structure: {
                    name: 'Loại hàng hoá',
                    alias: 'loai-hang-hoa',
                },
                packType: {
                    name: 'Loại gói',
                    alias: 'loai-goi',
                },
                serviceDVGT: {
                    name: 'Dịch vụ gia tăng',
                    alias: 'dich-vu-gia-tang',
                },
                reason: {
                    name: 'Lý do',
                    alias: 'ly-do',
                },
                reasonComplain: {
                    name: 'Lý do khiếu nại',
                    alias: 'ly-do-khieu-nai',
                },
                size: {
                    name: 'Kích thước',
                    alias: 'kich-thuoc',
                },
                transportType: {
                    name: 'Đi qua đối tác',
                    alias: 'di-qua-doi-tac',
                },
                PrintBillManagement: {
                    name: 'Quản lý mẫu in bill',
                    alias: 'quan-ly-mau-in-bill',
                },
                Holiday: {
                    name: 'Quản lý ngày lễ',
                    alias: 'quan-ly-ngay-le',
                },
                AccountingAccount: {
                    name: 'Tài khoản kế toán',
                    alias: 'tai-khoan-ke-toan',
                },
                AccountBank: {
                    name: 'Tài khoản ngân hàng',
                    alias: 'tai-khoan-ngan-hang',
                },
                changeCodType: {
                    name: 'Loại điều chỉnh COD',
                    alias: 'loai-dieu-chinh-cod',
                },
                cashFlow: {
                    name: 'Quản lý nguồn tiền',
                    alias: 'quan-ly-nguon-tien',
                }
            }
        },
        codManagement:{
            name: 'Quản lý điều chỉnh COD',
            alias: 'quan-ly-dieu-chinh-cod',
            loadChildren: '',
            children: {
                editCOD: {
                    name: 'Điều chỉnh COD',
                    alias: 'dieu-chinh-cod'
                }
            }
        }
        ,
        price: {
            name: 'Quản lý giá cước',
            alias: 'quan-ly-gia-cuoc',
            loadChildren: './price-management/price-management.module#PriceManagementModule',
            children: {
                areaGroup: {
                    name: 'Nhóm khu vực',
                    alias: 'nhom-khu-vuc',
                },
                area: {
                    name: 'Khu vực tính giá',
                    alias: 'khu-vuc-tinh-gia',
                },
                weightGroup: {
                    name: 'Nhóm mức cân',
                    alias: 'nhom-muc-can',
                },
                weight: {
                    name: 'Mức cân',
                    alias: 'muc-can',
                },
                formula: {
                    name: 'Công thức',
                    alias: 'cong-thuc',
                },
                priceList: {
                    name: 'Bảng giá',
                    alias: 'bang-gia',
                },
                priceService: {
                    name: 'Bảng giá dịch vụ',
                    alias: 'bang-gia-dich-vu',
                },
                priceServiceDetail: {
                    name: 'Bảng giá DV chi tiết',
                    alias: 'bang-gia-dich-vu-chi-tiet',
                },
                priceServiceDetailExcel: {
                    name: 'Nhập giá bằng Excel',
                    alias: 'nhap-gia-excel',
                },
                serviceDVGTPrice: {
                    name: 'Bảng giá Dịch Vụ Gia Tăng',
                    alias: 'bang-gia-dvgt',
                },
                serviceDVGTPriceDetail: {
                    name: 'Bảng giá Dịch Vụ Gia Tăng Chi Tiết',
                    alias: 'bang-gia-dvgt-chi-tiet',
                },
                packagePrice: {
                    name: 'Bảng giá đóng gói',
                    alias: 'bang-gia-dong-goi',
                },
                chargedCOD: {
                    name: 'Khu vực tính phí COD',
                    alias: 'khu-vuc-tinh-phi-cod',
                },
                chargedRemote: {
                    name: 'Khu vực tính phí VSVX',
                    alias: 'khu-vuc-tinh-phi-vsvx',
                },
                checkPrice: {
                    name: 'Uớc tính giá',
                    alias: 'uoc-tinh-gia',
                }
            }
        },
        report: {
            name: 'Báo cáo',
            alias: 'bao-cao',
            loadChildren: './report/report-management.module#ReportManagementModule',
            children: {
                kpi: {
                    name: 'Chỉ số KPI',
                    alias: 'chi-so-kpi',
                },
                reportCod: {
                    name: 'Báo cáo COD',
                    alias: 'bao-cao-cod',
                },
                listUnfinish: {
                    name: 'Danh sách hàng chưa hoàn tất',
                    alias: 'hang-chua-hoan-tat',
                },
                ladingSchedule: {
                    name: 'Báo cáo hành trình',
                    alias: 'hanh-trinh',
                },
                reportSumary: {
                    name: 'Báo cáo tổng hợp',
                    alias: 'bao-cao-tong-hop',
                },
                reportSumaryShipment: {
                    name: 'Báo cáo tổng hợp ĐH',
                    alias: 'bao-cao-tong-hop-dh',
                },
                reportDeliveryDetail: {
                    name: 'Báo cáo chi tiết GN',
                    alias: 'bao-cao-chi-tiet-gn',
                },
                reportCustomer: {
                    name: 'Báo cáo tổng hợp khách hàng',
                    alias: 'bao-cao-tong-hop-khach-hang',
                },
                reportPickupDeliver: {
                    name: 'Báo cáo tổng hợp giao nhận',
                    alias: 'bao-cao-tong-hop-giao-nhan',
                },
                reportPayablesAndReceivablesByCustomer: {
                    name: 'Báo cáo công nợ khách hàng',
                    alias: 'bao-cao-cong-no-khach-hang',
                },
                reportTransfer: {
                    name: 'Báo cáo trung chuyển',
                    alias: 'bao-cao-trung-chuyen',
                },
                reportDelivery: {
                    name: 'Báo cáo giao hàng theo BK',
                    alias: 'bao-cao-phat-hang-theo-bk',
                },
                reportCODReceivables: {
                    name: 'Báo cáo COD phải nộp',
                    alias: 'bao-cao-cod-phai-thu',
                },
                reportCODPayable: {
                    name: 'Báo cáo COD phải trả',
                    alias: 'bao-cao-cod-phai-tra',
                },
                reportCODConfirm: {
                    name: 'Báo cáo COD đã xác nhận (KT)',
                    alias: 'bao-cao-cod-da-xac-nhan',
                },
                priceReadyPayment: {
                    name: 'Báo cáo cước phải thu',
                    alias: 'bao-cao-cuoc-phai-thu',
                },
                cancelShipment: {
                    name: 'Báo cáo hủy vận đơn',
                    alias: 'bao-cao-huy-van-don',
                },
                ReportCODByCustomer: {
                    name: 'Báo cáo công nợ COD',
                    alias: 'bao-cao-cong-no-cod',
                },
                ReportPostAgeByCustomer: {
                    name: 'Báo cáo công nợ cước',
                    alias: 'bao-cao-cong-no-cuoc',
                },
                reportDebtPriceDetailByCustomer: {
                    name: 'Báo cáo công nợ cước chi tiết theo KH',
                    alias: 'bao-cao-cong-no-cuoc-chi-tiet-theo-khach-hang',
                },
                reportDebtCODDetailByCustomer: {
                    name: 'Báo cáo công nợ COD chi tiết theo KH',
                    alias: 'bao-cao-cong-no-cod-chi-tiet-theo-khach-hang',
                },
                reportListGoodsPriceDetailCustomer: {
                    name: 'Báo cáo bảng kê cước chi tiết theo KH',
                    alias: 'bao-cao-bang-ke-cuoc-chi-tiet-theo-khach-hang',
                },
                reportResultBusiness: {
                    name: 'Báo cáo kết quả nhân viên kinh doanh',
                    alias: 'bao-cao-ket-qua-nhan-vien-kinh-doanh',
                },
                reportKPIBusiness: {
                    name: 'Báo cáo KPI nhân viên kinh doanh',
                    alias: 'bao-cao-kpi-nhan-vien-kinh-doanh',
                },
                reportKPICustomer: {
                    name: 'Báo cáo KPI khách hàng',
                    alias: 'bao-cao-kpi-khach-hang',
                },
                reportShipmentQuantity: {
                    name: 'Báo cáo sản lượng',
                    alias: 'bao-cao-san-luong',
                },
                reportDiscountCustomer: {
                    name: 'Báo cáo quản lý giảm giá khách hàng',
                    alias: 'bao-cao-quan-ly-giam-gia-khach-hang',
                },
                reportComplain: {
                    name: 'Báo cáo khiếu nại',
                    alias: 'bao-cao-khieu-nai',
                },
                reportPaymentPickupUser: {
                    name: 'Báo cáo thu tiền',
                    alias: 'bao-cao-thu-tien',
                },
                reportShipmentCOD: {
                    name: 'Báo cáo thu tiền/trả tiền thu hộ',
                    alias: 'bao-cao-thu-tien-tra-tien-thu-ho',
                },
                reportDeadline: {
                    name: 'Báo cáo trễ deadline',
                    alias: 'bao-cao-tre-deadline',
                },
                reportPrioritize: {
                    name: 'Báo cáo ưu tiên',
                    alias: 'bao-cao-uu-tien',
                },
                reportLadingSchedule: {
                    name: 'Báo cáo hành trình',
                    alias: 'bao-cao-hanh-trinh',
                },
                reportTruckTransfer: {
                    name: 'Báo cáo doanh thu sản lượng xe',
                    alias: 'bao-cao-doanh-thu-san-luong-xe',
                },
                reportEmpReceiptIssue: {
                    name: 'Báo cáo hiệu suất nhân viên kho',
                    alias: 'bao-cao-hieu-suat-nhan-vien-kho',
                },
                reportIncidents: {
                    name: 'Báo cáo sự cố',
                    alias: 'bao-cao-su-co',
                },
                reportDeliveryImage: {
                    name: 'Báo cáo xem ảnh giao hàng',
                    alias: 'bao-cao-xem-anh-phat-hang',
                },
                //
                reportReturn: {
                    name: 'Báo cáo hàng hoàn',
                    alias: 'bao-cao-hang-hoan',
                },
                reportCustomerRevenue: {
                    name: 'Báo cáo doanh thu khách hàng',
                    alias: 'bao-cao-doanh-thu-khach-hang',
                },
                reportBusinessAnalysis: {
                    name: 'Báo cáo phân tích kinh doanh',
                    alias: 'bao-cao-phan-tich-kinh-doanh',
                },
                reportMonthlyRevenue: {
                    name: 'Báo cáo doanh thu tháng',
                    alias: 'bao-cao-doanh-thu-thang',
                },
                reportYearRevenue: {
                    name: 'Báo cáo doanh thu năm',
                    alias: 'bao-cao-doanh-thu-nam',
                },
                reportHandleEmployee: {
                    name: 'Báo cáo kiểm soát NV',
                    alias: 'bao-cao-kiem-soat-nhan-vien',
                },
                reportUpdateReceivedInfo: {
                    name: 'BC cập nhật thông tin nhận',
                    alias: 'bao-cao-cap-nhat-thong-tin-nhan',
                },
                reportEditShipment: {
                    name: 'BC chỉnh sửa vận đơn',
                    alias: 'bao-cao-chinh-sua-van-don',
                },
                reportCosts: {
                    name: 'Báo cáo chi phí',
                    alias: 'bao-cao-chi-phi',
                }
            }
        },
        receiptMoney: {
            name: 'Quản lý thu tiền',
            alias: 'quan-ly-thu-tien',
            loadChildren: './receive-money-management/receive-money-management.module#ReceiveMoneyManagementModule',
            children: {
                comfirmTransfer: {
                    name: 'Quản lý chuyển khoản',
                    alias: 'xac-nhan-chuyen-khoan',
                },
                comfirmMoneyFromHubOther: {
                    name: 'Xác nhận tiền từ các trung tâm',
                    alias: 'xac-nhan-tien-tu-trung-tam-khac',
                },
                comfirmMoneyFromHub: {
                    name: 'Kế toán xác nhận tiền từ ' + environment.poHubSortName + '/' + environment.stationHubSortName + '',
                    alias: 'xac-nhan-tien-tu-ttcnt',
                },
                comfirmMoneyFromEmp: {
                    name: 'Xác nhận nhận tiền' ,
                    alias: 'xac-nhan-nhan-tien',
                },
                comfirmMoneyFromAccountant: {
                    name: 'Thủ quỹ xác nhận tiền',
                    alias: 'thu-quy-xac-nhan-tien',
                },
                receiveMoneyFromHubOther: {
                    name: 'Nộp tiền về các trung tâm khác',
                    alias: 'nop-tien-ve-trung-tam-khac',
                },
                receiveMoneyFromAccountant: {
                    name: 'Nộp tiền về thủ quỹ',
                    alias: 'nop-tien-ve-thu-quy',
                },
                receiveMoneyFromHub: {
                    name: 'Nộp tiền về ' + environment.centerHubSortName + '/' + environment.poHubSortName + '/' + environment.stationHubSortName + '',
                    alias: 'nop-tien-ve-ttcnt',
                },
                receiveMoneyFromRider: {
                    name: 'Xác nhận tiền từ nhân viên',
                    alias: 'xac-nhan-tien-tu-nhan-vien',
                },
            }
        },
        permission: {
            name: 'Phân quyền',
            alias: 'phan-quyen',
        },
        customerPayment: {
            name: 'Quản lý công nợ',
            alias: 'quan-ly-cong-no',
            loadChildren: './customer-payment-management/customer-payment-management.module#CustomerPaymentManagementModule',
            children: {
                customerPaymentTotalPrice: {
                    name: 'thanh toán cước phí',
                    alias: 'thanh-toan-cuoc-phi',
                },
                customerPaymentCOD: {
                    name: 'thanh toán thu hộ (COD)',
                    alias: 'thanh-toan-thu-ho',
                },
            }
        },
        tpl: {
            name: "Đối tác",
            alias: 'doi-tac',
            loadChildren: './tpl-management/tpl-management.module#TPLManagementModule',
            children: {
                tplManagement: {
                    name: 'quản lý đối tác',
                    alias: 'quan-ly-doi-tac',
                },
                shipmentAssignToTPL: {
                    name: 'Tạo vận đơn đối tác',
                    alias: 'tao-van-don-doi-tac',
                },
                shipmentTPL: {
                    name: 'Vận đơn đối tác',
                    alias: 'van-don-doi-tac',
                },
                updateSchedule: {
                    name: 'Cập nhật trạng thái',
                    alias: 'cap-nhat-trang-thai',
                }
            }
        }, deadline: {
            name: "Deadline",
            alias: 'quan-ly-deadline',
            loadChildren: './deadline-management/deadline-management.module#DeadlineManagementModule',
            children: {
                deadlineManagement: {
                    name: 'quản lý deadline',
                    alias: 'quan-ly-deadline',
                },
                deadlineUploadExcelManagement: {
                    name: 'quản lý deadline chi tiết',
                    alias: 'quan-ly-deadline-chi-tiet',
                },
                createDeadlineUploadExcelManagement: {
                    name: 'upload mới deadline chi tiết excel',
                    alias: 'upload-moi-deadline-chi-tiet-excel',
                },
                editDeadlineUploadExcelManagement: {
                    name: 'upload sửa deadline chi tiết excel',
                    alias: 'upload-sua-deadline-chi-tiet-excel',
                }
            }
        },
        dashBoard: {
            name: 'Tổng quan',
            alias: 'dashboard',
            loadChildren: './welcome/welcome.module#WelcomeModule',
            children: {
                dashBoard: {
                    name: 'Tổng quan',
                    alias: '',
                },
            }
        },
        getLatLng: {
            name: 'GetLatLng',
            alias: 'getlatlng',
        },
        pickupManagement: {
            name: 'Quản lý lấy hàng',
            alias: 'quan-ly-lay-hang',
            loadChildren: './new-pickup-management/new-pickup-management.module#NewPickupManagementModule',
            children: {
                createRequest: {
                    name: 'Tạo yêu cầu',
                    alias: 'tao-yeu-cau',
                },
                waitAssignPickup: {
                    name: 'Chờ phân lệnh lấy hàng',
                    alias: 'cho-phan-lenh-lay-hang',
                },
                assignedPickup: {
                    name: 'Đã phân lệnh chưa xác nhận',
                    alias: 'da-phan-lenh-chua-xac-nhan',
                },
                assignedDelivery: {
                    name: 'Đã phân lệnh chưa xác nhận',
                    alias: 'da-phan-lenh-chua-xac-nhan',
                },
                listPicking: {
                    name: 'Đang lấy hàng',
                    alias: 'dang-lay-hang',
                },
                listPickupComplete: {
                    name: 'Đã lấy hàng',
                    alias: 'da-lay-hang',
                },
                listPickupCancel: {
                    name: 'Hủy lấy hàng',
                    alias: 'huy-lay-hang',
                }
            }
        },
        deliveryManagement: {
            name: 'Quản lý giao hàng',
            alias: 'quan-ly-giao-hang',
            loadChildren: './new-delivery-management/new-delivery-management.module#NewDeliveryManagementModule',
            children: {
                waitAssignDelivery: {
                    name: 'Chờ phân lệnh giao hàng',
                    alias: 'cho-phan-lenh-phat-hang',
                },
                assignedDelivery: {
                    name: 'Đã phân lệnh chưa xác nhận',
                    alias: 'da-phan-lenh-chua-xac-nhan',
                },
                updateDeliveryStatus: {
                    name: 'Cập nhật tình trạng giao',
                    alias: 'cap-nhat-tinh-trang-phat',
                },
                deliveryFail: {
                    name: 'Giao hàng không thành công',
                    alias: 'giao-hang-khong-thanh-cong',
                },
                listDeliveryComplete: {
                    name: 'Đã giao hàng',
                    alias: 'da-giao-hang',
                },
                listDeliveryCancel: {
                    name: 'Hủy giao hàng',
                    alias: 'huy-giao-hang',
                },
                deleteDeliveryComplate: {
                    name: 'Xóa giao hàng thành công',
                    alias: 'xoa-giao-hang-thanh-cong',
                },
                editDeliveryComplate: {
                    name: 'Sửa VĐ giao TC',
                    alias: 'sua-vd-phat-tc',
                },
                deliveryIssue: {
                    name: 'Xuất kho giao hàng',
                    alias: 'xuat-kho-phat-hang',
                },
            }
        },
        historyPrint: {
            name: "Lịch sử In",
            alias: "lich-su-in",
            loadChildren: "./history-print/history-print.module#HistoryPrintModule",
            children: {
                printShipments: {
                    name: "DS In VĐ",
                    alias: "ds-in-vd",
                },
                followList: {
                    name: "DS In BK",
                    alias: "ds-in-bk",
                },
            }
        },
        billOfLading: {
            name: "Quản lý cấp vận đơn",
            alias: 'quan-ly-cap-van-don',
            loadChildren: './bill-of-lading/bill-of-lading.module#BillOfLadingModule',
            children: {
                billOfLadingNew: {
                    name: 'Cấp vận đơn mới',
                    alias: 'cap-van-don-moi',
                },
                billOfLadingGranted: {
                    name: 'Danh sách vận đơn đã cấp',
                    alias: 'danh-sach-van-don-da-cap',
                },
                billOfLadingWithdrawal: {
                    name: 'Thu hồi vận đơn',
                    alias: 'thu-hoi-van-don',
                }
            }
        },
        quanLyChuyen_VanChuyen: {
            name: "Quản lý chuyến - vận chuyển",
            alias: 'quan-ly-chuyen-van-chuyen',
            loadChildren: './quan-ly-chuyen-van-chuyen/quan-ly-chuyen-van-chuyen.module#QuanLyChuyenVanChuyenModule',
            children: {
                quanLyChuyenXe: {
                    name: 'Quản lý chuyến xe',
                    alias: 'quan-ly-chuyen-xe',
                },
                dongSeal: {
                    name: 'Đóng seal',
                    alias: 'dong-seal',
                },
                moSeal: {
                    name: 'Mở seal',
                    alias: 'mo-seal',
                },
                traCuuXe: {
                    name: 'Tra cứu xe',
                    alias: 'tra-cuu-xe',
                },
            }
        }
    }
}