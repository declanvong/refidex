export type RefidexDomain = {
  // A globally unique identifier for this Domain, to be used as a reference in Nodes and other Domains.
  id: string;
  parent?: string;
};

export enum Status {
  PLANNED = 1,
  SOON,
  IN_PROGRESS,
  DONE,
};

export type RefidexNode = {
  // A globally unique identifier for this Node, to be used as a reference in other Nodes.
  id: string;
  title: string;
  details?: string;
  icon?: React.ReactNode;
  // A list of Node IDs that this Node depends on. Cycles are not allowed.
  dependencies?: string[];
  parentDomain?: string;
} & ({
  status?: Exclude<Status, Status.IN_PROGRESS>,
} | {
  status: Status.IN_PROGRESS,
  // Percent, from 0 - 1
  progress?: number,
});

export type RefidexModel = {
  domains: RefidexDomain[],
  // A list of Nodes in this model. The first node will be considered the root node.
  nodes: RefidexNode[],
};
