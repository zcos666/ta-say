import type {
  DistillOtherRequest,
  DistillOtherResponse,
  DistillSelfRequest,
  DistillSelfResponse,
} from "../../types/api";
import { request } from "./httpClient";

export async function requestDistillSelf(payload: DistillSelfRequest) {
  return request<DistillSelfResponse>("/api/distill-self", {
    method: "POST",
    json: payload,
  });
}

export async function requestDistillOther(payload: DistillOtherRequest) {
  return request<DistillOtherResponse>("/api/distill-other", {
    method: "POST",
    json: payload,
  });
}
