import { describe, expect, it } from "vitest";

import { translateLoveLanguage } from "./translatorService";

describe("translatorService", () => {
  it("短输入不再走映射表捷径，而是直接提示补全句子", async () => {
    await expect(translateLoveLanguage("你忙吧")).rejects.toThrow("输入太短");
  });
});
