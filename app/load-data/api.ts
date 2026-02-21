import {
  ColumnMapping,
  GetMappingsResponse,
  LoadDataResponse,
  MappingPart,
} from "@/app/load-data/types/load-data";
import { config } from "@/lib/config";

export async function getMappings(file: File): Promise<GetMappingsResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${config.apiBaseUrl}/api/load-data/get-mappings`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.message || "Failed to get mappings");
  }

  return response.json();
}

export async function loadData(
  file: File,
  mappings: ColumnMapping[],
): Promise<LoadDataResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("mappings", JSON.stringify(mappings));

  const response = await fetch(`${config.apiBaseUrl}/api/load-data`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.message || "Failed to load data");
  }

  return response.json();
}

export function createMappingsFromResponse(
  response: GetMappingsResponse,
): ColumnMapping[] {
  return response.columns.map((column) => {
    const suggestion = response.llmSuggestions.find(
      (s) => s.header === column.header,
    );

    if (suggestion) {
      const shouldSplit = suggestion.suggestion.shouldSplit;
      const delimiter = suggestion.suggestion.delimiter;
      const originalParts = suggestion.suggestion.parts;

      // Auto-generate part names from sample value when shouldSplit is true
      let parts: MappingPart[] = originalParts;
      if (shouldSplit && delimiter && column.sampleValue) {
        const splitValues = column.sampleValue.split(delimiter);
        parts = splitValues.map((value, idx) => ({
          index: idx,
          name: value.trim(),
          mapTo: originalParts[idx]?.mapTo || "",
        }));
      }

      return {
        excelColumnIndex: column.index,
        excelHeader: column.header,
        sampleValue: column.sampleValue,
        shouldSplit: shouldSplit,
        delimiter: delimiter,
        mappedTo: suggestion.suggestion.mapTo,
        dateFormat: null,
        parts: parts,
      };
    }

    return {
      excelColumnIndex: column.index,
      excelHeader: column.header,
      sampleValue: column.sampleValue,
      shouldSplit: false,
      delimiter: null,
      mappedTo: null,
      dateFormat: null,
      parts: [],
    };
  });
}
