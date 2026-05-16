import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AppRouter } from "../src/app/routes/AppRouter";

describe("AppRouter", () => {
  it("在根路径渲染 StartPage 占位页", () => {
    render(
      <MemoryRouter
        initialEntries={["/"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <AppRouter />
      </MemoryRouter>,
    );

    expect(screen.getByText("《ta说》主流程入口待接入")).toBeInTheDocument();
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

    expect(screen.getByText("《ta说》主流程入口待接入")).toBeInTheDocument();
  });
});
