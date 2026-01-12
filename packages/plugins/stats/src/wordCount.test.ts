import { describe, it, expect } from "vitest";
import { countWords, countChars } from "./wordCount";

describe("wordCount", () => {
  it("counts words by whitespace", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("   ")).toBe(0);
    expect(countWords("hello")).toBe(1);
    expect(countWords("hello world")).toBe(2);
    expect(countWords("hello   world\nagain")).toBe(3);
  });

  it("counts chars including whitespace", () => {
    expect(countChars("a")).toBe(1);
    expect(countChars("a ")).toBe(2);
  });
});
