import { DbFields } from "@/app/enums/db-fields.enum";

export type FieldGroup = {
  name: string;
  fields: string[];
};

export const FIELD_POOL: FieldGroup[] = [
  {
    name: "Seller Entity",
    fields: [
      DbFields.SELLER_NAME,
      DbFields.SELLER_GSTIN,
      DbFields.SELLER_PLACE,
      DbFields.SELLER_PIN,
    ],
  },
  {
    name: "Buyer Entity",
    fields: [
      DbFields.BUYER_NAME,
      DbFields.BUYER_GSTIN,
      DbFields.BUYER_PLACE,
      DbFields.BUYER_PIN,
    ],
  },
  {
    name: "Purchase Records",
    fields: [
      DbFields.PURCHASE_INVOICE_NO,
      DbFields.PURCHASE_INVOICE_DATE,
      DbFields.PURCHASE_STATE,
      DbFields.PURCHASE_EWB_NO,
      DbFields.PURCHASE_EWB_DATE,
      DbFields.PURCHASE_ASSESS_VAL,
      DbFields.PURCHASE_TAX_VAL,
    ],
  },
  {
    name: "HSN Codes",
    fields: [DbFields.HSN_CODE, DbFields.HSN_CHEMICAL_NAME],
  },
];

export const MANDATORY_FIELDS = [
  DbFields.SELLER_NAME,
  DbFields.SELLER_GSTIN,
  DbFields.BUYER_NAME,
  DbFields.BUYER_GSTIN,
  DbFields.PURCHASE_ASSESS_VAL,
  DbFields.HSN_CODE,
] as const;
