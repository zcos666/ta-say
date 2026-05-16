import { act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAppStore } from "../src/app/store/useAppStore";
import { createEmptySession } from "../src/types/session";

describe("rollback limit", () => {
  it("第三次回退后不能再次回退", () => {
    act(() => {
      useAppStore.setState({
        hydrated: true,
        isReplying: false,
        session: {
          ...createEmptySession(),
          loadCount: 3
        }
      });
    });

    expect(() => useAppStore.getState().rollbackToMessage("any-message-id")).toThrow(
      "第三次回退后不能再次回退。"
    );
  });
});
