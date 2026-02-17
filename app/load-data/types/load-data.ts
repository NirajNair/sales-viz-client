export interface ExcelColumn {
  index: number;
  header: string;
  sampleValue: string;
}

export interface LlmSuggestion {
  shouldSplit: boolean;
  delimiter: string | null;
  mapTo: string | null;
  parts: MappingPart[];
}

export interface LlmSuggestionResponse {
  header: string;
  suggestion: LlmSuggestion;
}

export interface GetMappingsResponse {
  columns: ExcelColumn[];
  llmSuggestions: LlmSuggestionResponse[];
}

export interface MappingPart {
  index: number;
  name: string;
  mapTo: string;
  dateFormat?: string | null;
}

export interface ColumnMapping {
  excelColumnIndex: number;
  excelHeader: string;
  sampleValue: string;
  shouldSplit: boolean;
  delimiter: string | null;
  mappedTo: string | null;
  dateFormat: string | null;
  parts: MappingPart[];
}

export interface LoadDataResponse {
  recordsStoredCount: number;
}