import { describe, it, expect } from "@jest/globals";

// Reducer original (actualmente inline en state.ts)
const originalReducer = (prev: any, next: any) => next ?? prev;

// Reducer deseado
const targetReducer = (prev: any, next: any) => next;

describe("State Reducers Logic", () => {
  describe("Current Nullish Reducer (Buggy for clearing)", () => {
    it("should NOT clear the value when next is undefined (FAIL CASE)", () => {
      const prev = "software_chief";
      const next = undefined;
      // El comportamiento actual mantiene el previo
      expect(originalReducer(prev, next)).toBe("software_chief");
    });
  });

  describe("New Direct Reducer (Fix for clearing)", () => {
    it("should clear the value when next is undefined", () => {
      const prev = "software_chief";
      const next = undefined;
      // El nuevo comportamiento debe permitir undefined
      expect(targetReducer(prev, next)).toBe(undefined);
    });

    it("should update the value when next is a new string", () => {
      const prev = "software_chief";
      const next = "business_chief";
      expect(targetReducer(prev, next)).toBe("business_chief");
    });
  });

  describe("Domain Reducer (Deep Merge Level 1)", () => {
    const domainReducer = <T extends object>(prev: T | undefined, next: Partial<T> | undefined): T | undefined => {
      if (!next) return prev;
      return {
        ...(prev || {}),
        ...next
      } as T;
    };

    it("should perform shallow merge of domain objects", () => {
      interface TestDomain { niche: string; limit: number; location?: string };
      const prev: TestDomain = { niche: "AI", limit: 10 };
      const next: Partial<TestDomain> = { location: "USA" };
      const result = domainReducer(prev, next);
      
      expect(result).toEqual({
        niche: "AI",
        limit: 10,
        location: "USA"
      });
    });

    it("should overwrite existing keys in domain objects", () => {
      const prev = { niche: "AI", limit: 10 };
      const next = { limit: 20 };
      const result = domainReducer(prev, next);
      
      expect(result).toEqual({
        niche: "AI",
        limit: 20
      });
    });

    it("should return prev if next is undefined", () => {
      const prev = { niche: "AI" };
      const next = undefined;
      expect(domainReducer(prev, next)).toEqual(prev);
    });
  });
});
