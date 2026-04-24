export interface NodeMetadata {
  nodeName: string;
  usage: { prompt: number; completion: number; total: number };
  latency: number;
  model: string;
  cost: number;
  decision?: string;
  reasoning?: string;
}
