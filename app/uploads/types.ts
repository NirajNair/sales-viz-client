export interface Upload {
  uploadId: string;
  fileName: string;
  fileSize: number;
  reverted: boolean;
  createdAt: string;
}

export interface GetUploadsResponse {
  uploads: Upload[];
}

export interface RevertUploadResponse {
  deletedRecordsCount: number;
}

export type FilterStatus = "all" | "reverted" | "non-reverted";
