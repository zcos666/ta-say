import type { LoveTranslateRequest, LoveTranslationReport } from "../../types/api";
import { request } from "./httpClient";

export async function requestLoveTranslate(payload: LoveTranslateRequest) {
  return request<LoveTranslationReport>("/api/love-translate", {
    method: "POST",
    json: payload,
  });
}
