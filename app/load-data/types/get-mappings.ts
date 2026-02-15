import { FIELD_POOL } from "@/lib/constants";

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
}

export interface ColumnMapping {
  excelColumnIndex: number;
  excelHeader: string;
  sampleValue: string;
  shouldSplit: boolean;
  delimiter: string | null;
  mappedTo: string | null;
  parts: MappingPart[];
}

export interface SaveMappingsRequest {
  file: File;
  mappings: ColumnMapping[];
}

export function getAllFields(): string[] {
  return FIELD_POOL.flatMap((group) => group.fields);
}

export function getFieldGroup(field: string): string | null {
  for (const group of FIELD_POOL) {
    if (group.fields.includes(field)) {
      return group.name;
    }
  }
  return null;
}
