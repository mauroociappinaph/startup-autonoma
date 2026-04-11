import { Annotation, MessagesAnnotation } from "@langchain/langgraph";

/**
 * El AgentState es la "memoria compartida" de nuestra startup. 
 * Usamos Annotation.Root para definir un estado tipado y reactivo.
 */
export const AgentState = Annotation.Root({
  ...MessagesAnnotation.spec,
  plan: Annotation<string[]>({
    reducer: (oldState, newState) => newState,
    default: () => [],
  }),
  next: Annotation<string>({
    reducer: (oldState, newState) => newState,
    default: () => "CEO",
  }),
  retryCount: Annotation<number>({
    reducer: (old, val) => old + val,
    default: () => 0,
  }),
  executiveSummary: Annotation<string>({
    reducer: (old, val) => val,
    default: () => "",
  })
});

