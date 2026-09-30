// @vitest-environment happy-dom
import { expect, test } from "vitest";
import { computeDescription } from "./description.js";

test("aria-describedby", () => {
  const element = document.createElement("div");
  element.setAttribute("aria-description", "test");
  const description = computeDescription(element);
  expect(description).toBe("test");
});
