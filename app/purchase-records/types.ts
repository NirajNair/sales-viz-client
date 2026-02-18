// Entity with name + GSTIN
export interface Entity {
  id: string;
  name: string;
  gstin: string;
}

// HSN Code
export interface HsnCode {
  code: string;
}

// Chemical name mapping
export interface HsnChemicalMapping {
  hsnCode: string;
  chemicalName: string;
}

// Purchase record - 8 columns only
export interface PurchaseRecord {
  id: string;
  sellerName: string;
  sellerGstin: string;
  buyerName: string;
  buyerGstin: string;
  assessValue: number;
  invoiceDate: string; // UTC ISO from API
  hsnCode: string;
  chemicalName: string;
}

// API response
export interface GetPurchaseRecordsResponse {
  records: PurchaseRecord[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// Filter options
export interface FilterOptionsResponse {
  sellers: Entity[];
  buyers: Entity[];
  hsnCodes: HsnCode[];
  hsnChemicalMappings: HsnChemicalMapping[];
}

// Query params for URL state
export interface PurchaseRecordsQueryState {
  sellers: string[]; // Entity IDs
  buyers: string[]; // Entity IDs
  hsnCodes: string[]; // HSN IDs
  chemicalNames: string[]; // Chemical name strings
  fromDate: string | null; // UTC ISO
  toDate: string | null; // UTC ISO
  page: number;
  pageSize: number;
  sortField: string;
  sortOrder: "asc" | "desc";
}
