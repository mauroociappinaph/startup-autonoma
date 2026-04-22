export interface HITLPanelProps {
  onApprove: () => void;
  onReject: (feedback: string) => void;
  onRewind: (checkpointId: string) => void;
}

export interface HistoryItem {
  id: string;
  next: string[];
  values: { executive_summary?: string };
  createdAt?: string;
}
