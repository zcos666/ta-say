import type { ShareLineRequest, ShareLineResponse } from "../../types/api";
import { request } from "./httpClient";

export async function requestShareLine(payload: ShareLineRequest) {
  return request<ShareLineResponse>("/api/share-line", {
    method: "POST",
    json: payload,
  });
}
