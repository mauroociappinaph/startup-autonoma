import React from "react";

export interface MetricProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  unit: string;
}
