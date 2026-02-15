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

export const DATE_FIELDS: string[] = [
  DbFields.PURCHASE_INVOICE_DATE,
  DbFields.PURCHASE_EWB_DATE,
];

export interface DateFormat {
  label: string;
  value: string;
}

// Date-only formats (no time component)
export const DATE_FORMATS: DateFormat[] = [
  // Standard formats with slashes
  { label: "DD/MM/YYYY (e.g. 15/02/2026)", value: "dd/MM/yyyy" },
  { label: "MM/DD/YYYY (e.g. 02/15/2026)", value: "MM/dd/yyyy" },
  { label: "YYYY/MM/DD (e.g. 2026/02/15)", value: "yyyy/MM/dd" },

  // Formats with dashes
  { label: "DD-MM-YYYY (e.g. 15-02-2026)", value: "dd-MM-yyyy" },
  { label: "MM-DD-YYYY (e.g. 02-15-2026)", value: "MM-dd-yyyy" },
  { label: "YYYY-MM-DD (e.g. 2026-02-15)", value: "yyyy-MM-dd" },

  // Formats with dots
  { label: "DD.MM.YYYY (e.g. 15.02.2026)", value: "dd.MM.yyyy" },
  { label: "MM.DD.YYYY (e.g. 02.15.2026)", value: "MM.dd.yyyy" },
  { label: "YYYY.MM.DD (e.g. 2026.02.15)", value: "yyyy.MM.dd" },

  // Two-digit year formats (legacy Excel)
  { label: "DD/MM/YY (e.g. 15/02/26)", value: "dd/MM/yy" },
  { label: "MM/DD/YY (e.g. 02/15/26)", value: "MM/dd/yy" },
  { label: "DD-MM-YY (e.g. 15-02-26)", value: "dd-MM-yy" },
  { label: "MM-DD-YY (e.g. 02-15-26)", value: "MM-dd-yy" },
  { label: "YY/MM/DD (e.g. 26/02/15)", value: "yy/MM/dd" },

  // Compact formats (no separators)
  { label: "YYYYMMDD (e.g. 20260215)", value: "yyyyMMdd" },
  { label: "DDMMYYYY (e.g. 15022026)", value: "ddMMyyyy" },
  { label: "MMDDYYYY (e.g. 02152026)", value: "MMddyyyy" },
  { label: "YYMMDD (e.g. 260215)", value: "yyMMdd" },
  { label: "DDMMYY (e.g. 150226)", value: "ddMMyy" },
];

// DateTime formats (with time component)
export const DATETIME_FORMATS: DateFormat[] = [
  // Date + Time (24-hour)
  {
    label: "DD/MM/YYYY HH:mm (e.g. 15/02/2026 14:30)",
    value: "dd/MM/yyyy HH:mm",
  },
  {
    label: "DD/MM/YYYY HH:mm:ss (e.g. 15/02/2026 14:30:45)",
    value: "dd/MM/yyyy HH:mm:ss",
  },
  {
    label: "MM/DD/YYYY HH:mm (e.g. 02/15/2026 14:30)",
    value: "MM/dd/yyyy HH:mm",
  },
  {
    label: "MM/DD/YYYY HH:mm:ss (e.g. 02/15/2026 14:30:45)",
    value: "MM/dd/yyyy HH:mm:ss",
  },

  // Date + Time with dashes
  {
    label: "YYYY-MM-DD HH:mm:ss (e.g. 2026-02-15 14:30:45)",
    value: "yyyy-MM-dd HH:mm:ss",
  },
  {
    label: "YYYY-MM-DD HH:mm (e.g. 2026-02-15 14:30)",
    value: "yyyy-MM-dd HH:mm",
  },
  {
    label: "DD-MM-YYYY HH:mm (e.g. 15-02-2026 14:30)",
    value: "dd-MM-yyyy HH:mm",
  },
  {
    label: "DD-MM-YYYY HH:mm:ss (e.g. 15-02-2026 14:30:45)",
    value: "dd-MM-yyyy HH:mm:ss",
  },

  // Date + Time (12-hour with AM/PM)
  {
    label: "DD/MM/YYYY hh:mm a (e.g. 15/02/2026 02:30 PM)",
    value: "dd/MM/yyyy hh:mm a",
  },
  {
    label: "MM/DD/YYYY hh:mm a (e.g. 02/15/2026 02:30 PM)",
    value: "MM/dd/yyyy hh:mm a",
  },
  {
    label: "DD/MM/YYYY h:mm a (e.g. 15/02/2026 2:30 PM)",
    value: "dd/MM/yyyy h:mm a",
  },
  {
    label: "DD/MM/YYYY hh:mm:ss a (e.g. 15/02/2026 02:30:45 PM)",
    value: "dd/MM/yyyy hh:mm:ss a",
  },

  // Excel datetime formats with 2-digit year
  { label: "DD/MM/YY HH:mm (e.g. 15/02/26 14:30)", value: "dd/MM/yy HH:mm" },
  {
    label: "DD/MM/YY HH:mm:ss (e.g. 15/02/26 14:30:45)",
    value: "dd/MM/yy HH:mm:ss",
  },

  // ISO 8601 formats
  {
    label: "ISO 8601 (e.g. 2026-02-15T14:30:45)",
    value: "yyyy-MM-dd'T'HH:mm:ss",
  },
  {
    label: "ISO 8601 with Z (e.g. 2026-02-15T14:30:45Z)",
    value: "yyyy-MM-dd'T'HH:mm:ss'Z'",
  },
];

// Month name formats (text-based months)
export const MONTH_NAME_FORMATS: DateFormat[] = [
  { label: "DD MMM YYYY (e.g. 15 Feb 2026)", value: "dd MMM yyyy" },
  { label: "DD MMMM YYYY (e.g. 15 February 2026)", value: "dd MMMM yyyy" },
  { label: "MMM DD, YYYY (e.g. Feb 15, 2026)", value: "MMM dd, yyyy" },
  { label: "MMMM DD, YYYY (e.g. February 15, 2026)", value: "MMMM dd, yyyy" },
  { label: "DD-MMM-YYYY (e.g. 15-Feb-2026)", value: "dd-MMM-yyyy" },
  { label: "DD-MMMM-YYYY (e.g. 15-February-2026)", value: "dd-MMMM-yyyy" },
  { label: "MMM DD YYYY (e.g. Feb 15 2026)", value: "MMM dd yyyy" },
  { label: "MMMM DD YYYY (e.g. February 15 2026)", value: "MMMM dd yyyy" },
];

// Special/Unix formats
export const SPECIAL_FORMATS: DateFormat[] = [
  { label: "Unix Timestamp (seconds)", value: "unix" },
  { label: "Unix Timestamp (milliseconds)", value: "unix_ms" },
  { label: "Excel Serial Date", value: "excel_serial" },
];
