export interface NexusNode {
  id: string;
  name: string;
  gstin: string;
  isBuyer: boolean;
  isSeller: boolean;
  isSelected: boolean;
}

export interface HsnDetail {
  code: string;
  chemicalName: string | null;
}

export interface NexusLink {
  source: string;
  target: string;
  hsnDetails: HsnDetail[];
}

export interface NexusGraphResponse {
  nodes: NexusNode[];
  links: NexusLink[];
}

export interface Entity {
  id: string;
  name: string;
  gstin: string;
}

export interface HsnCode {
  code: string;
}

export interface NexusFilterOptionsResponse {
  entities: Entity[];
  hsnCodes: HsnCode[];
}

export interface NexusQueryState {
  entities: string[];
  hsnCodes: string[];
  fromDate: string | null;
  toDate: string | null;
}
