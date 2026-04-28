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
});
