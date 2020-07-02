import { RefidexModel, RefidexNode, Status } from 'model/model';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createRefidex } from 'refidex/create';

const n = (id: string, title: string, dependencies?: string[], icon?: React.ReactNode, status?: Status): RefidexNode => ({
  id,
  title,
  dependencies,
  icon,
  status,
});

const nodes: RefidexNode[] = [
  n('a', 'Basic tech tree viewing', [], '🌭', Status.IN_PROGRESS),
  n('b', 'Multiple dependencies', ['a'], undefined, Status.PLANNED),
  n('c', 'Domains', ['b'], undefined, Status.PLANNED),
  n('d', 'Mainline detection', ['c'], undefined, Status.PLANNED),
  n('e', 'Refactoring', ['a'], undefined, Status.PLANNED),
  n('f', 'Canvas panning', ['a'], undefined, Status.IN_PROGRESS),
  n('g', 'Cross-domain dependencies', ['c'], undefined, Status.PLANNED),
];

const model: RefidexModel = {
  domains: [],
  nodes,
};
const Graph = createRefidex(model);

ReactDOM.render(<Graph/>, document.getElementById('app'));
