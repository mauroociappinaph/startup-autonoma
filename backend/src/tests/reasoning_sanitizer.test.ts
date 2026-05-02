import { ReasoningSanitizer } from "../helpers/reasoningSanitizer.js";

describe("ReasoningSanitizer", () => {
  it("debe retornar los tags vacíos si el input es nulo o vacío", () => {
    const result = ReasoningSanitizer.sanitize(null);
    expect(result).toContain("<thought></thought>");
    expect(result).toContain("<plan></plan>");
    expect(result).toContain("<action></action>");
  });

  it("debe retornar el input intacto si ya tiene todos los tags", () => {
    const input = "<thought>Pensando...</thought>\n<plan>Plan</plan>\n<action>Accion</action>";
    const result = ReasoningSanitizer.sanitize(input);
    expect(result).toBe(input);
  });

  it("debe envolver el texto en <thought> si no hay tags", () => {
    const input = "Este es un texto libre del LLM sin formato XML.";
    const result = ReasoningSanitizer.sanitize(input);
    expect(result).toContain(`<thought>\n${input}\n</thought>`);
    expect(result).toContain("<plan></plan>");
    expect(result).toContain("<action></action>");
  });

  it("debe agregar los tags faltantes al final si hay al menos uno pero faltan otros", () => {
    const input = "<thought>Solo tengo un thought</thought>";
    const result = ReasoningSanitizer.sanitize(input);
    expect(result).toContain(input);
    expect(result).toContain("<plan></plan>");
    expect(result).toContain("<action></action>");
  });

  it("debe inyectar <thought> vacío si solo viene <plan> o <action>", () => {
    const input = "<action>Haciendo algo directo</action>";
    const result = ReasoningSanitizer.sanitize(input);
    expect(result).toContain("<thought></thought>");
    expect(result).toContain("<plan></plan>");
    expect(result).toContain(input);
  });
});
