import { describe, expect, it } from "vitest";
import { createVoiceInputService } from "../src/services/voice/voiceInputService";

describe("voiceInputService", () => {
  it("在浏览器不支持时返回预设降级结果", async () => {
    const service = createVoiceInputService({
      createRecognition: () => null,
    });

    const result = await service.startListening();

    expect(result.kind).toBe("fallback");
    expect(service.getState().status).toBe("unsupported");
    expect(service.getPresetOptions().length).toBeGreaterThan(0);
  });

  it("支持从预设文本回填结果", () => {
    const service = createVoiceInputService({
      createRecognition: () => null,
    });

    const preset = service.getPresetOptions()[0];
    const result = service.usePreset(preset!);

    expect(result.kind).toBe("success");
    expect(result.source).toBe("preset");
    expect(service.getState().transcript).toBe(preset?.text);
  });
});
