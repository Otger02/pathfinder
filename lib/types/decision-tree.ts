export interface DecisionNode {
  id: string;
  type: "q" | "result" | "block" | "sos1" | "sos2" | "sos3";
  text: string;
  note: string;
  opts: Array<{
    text: string;
    s: "r" | "s" | "b" | "";
    next: string | null;
  }>;
  slugs?: string[];
  x?: number;
  y?: number;
}

export interface DecisionTree {
  version: string;
  branches: {
    b1: DecisionNode[];
    b2: DecisionNode[];
    b3: DecisionNode[];
    b4: DecisionNode[];
  };
}
