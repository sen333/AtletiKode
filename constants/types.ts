export type RootStackParamList = {
    list: undefined;
    addVoucher: undefined;
    generateVoucher: { generatedData: any };
    editVoucher: { id: number };
};
export type Customer = {
    id: number;
    FirstName: string;
    LastName: string;
    Email: string;
    ContactNumber: string;
};

export type Voucher = {
    id: number;
    Discount: number;
    Status: string;
};

export type ReleasedVoucher = {
    id: number;
    VoucherID: number;
    CustomerID: number;
    EventID?: string;
    Customers: Customer[];  
    Vouchers: Voucher[];  
};

