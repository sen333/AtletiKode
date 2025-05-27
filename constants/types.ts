export type RootStackParamList = {
    addVoucher: undefined;
    generateVoucher: { generatedData: any };
  // add other screens and their params as needed
};
export type ReleasedVoucher = {
    id: string;
    voucherCode: string;
    discount: number;
    email: string;
    claimed: boolean;
};
