import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AppRouter } from "../src/app/routes/AppRouter";

describe("AppRouter", () => {
  it("在根路径渲染 StartPage", () => {
    render(
      <MemoryRouter
        initialEntries={["/"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <AppRouter />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "过拟合恋人" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "开始聊天" })).toBeInTheDocument();
  });

  it("在未知路径回退到根路径", () => {
    render(
      <MemoryRouter
        initialEntries={["/missing"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <AppRouter />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "过拟合恋人" })).toBeInTheDocument();
  });
});
