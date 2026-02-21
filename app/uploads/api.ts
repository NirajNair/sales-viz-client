import { GetUploadsResponse, RevertUploadResponse } from "@/app/uploads/types";
import { config } from "@/lib/config";

export async function getUploads(): Promise<GetUploadsResponse> {
  const response = await fetch(`${config.apiBaseUrl}/api/uploads`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch uploads");
  }

  return response.json();
}

export async function revertUpload(
  uploadId: string,
): Promise<RevertUploadResponse> {
  const response = await fetch(
    `${config.apiBaseUrl}/api/uploads/${uploadId}/revert`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to revert upload");
  }

  return response.json();
}
