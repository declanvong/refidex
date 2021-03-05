import { RefidexModel, RefidexNode, Status } from 'model/model';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createRefidex } from 'refidex/create';

const n = (
  id: string,
  title: string,
  dependencies?: string[],
  status?: Status,
  options?: {
    icon?: React.ReactNode,
    details?: string,
    progress?: number,
  },
): RefidexNode => ({
  id,
  title,
  details: options?.details,
  dependencies,
  status,
  icon: options?.icon,
  progress: options?.progress,
});

const nodes: RefidexNode[] = [
  n('a', 'Basic tech tree viewing', [], Status.DONE, { icon: '🌭', details: 'Enable viewing of basic tech trees.'}),
  n('b', 'Multiple dependencies', ['a'], Status.DONE, { details: 'Allow a single node to have multiple dependencies.' }),
  n('c', 'Groups', ['b'], Status.PLANNED, { details: 'Visually group nodes together, as well as allow dependencies on entire groups.' }),
  n('d', 'File format', ['a'], Status.PLANNED, { details: 'Read models from a persistent on-disk file format' }),
  n('e', 'Refactoring', ['a'], Status.IN_PROGRESS, { progress: 0.6, details: 'Clean up stuff' }),
  n('f', 'Canvas panning', ['a'], Status.DONE, { details: 'Basic camera functionality, such as panning and zooming' }),
  n('g', 'Cross-group dependencies', ['c'], Status.PLANNED, { details: 'Allow nodes to have dependencies on other groups, or other nodes inside another group' }),
  n('h', 'Node descriptions', ['a'], Status.DONE, { details: 'Give nodes descriptions and a details view that shows it' }),
  n('i', 'Node progress rings', ['a'], Status.DONE, { details: 'Give nodes progression, and display it as a ring on the node bubble' }),
  n('j', 'Graph optimization and pruning', ['b'], Status.PLANNED, { details: 'Trim unnecessary lines by doing graph pre-optimization before rendering' }),
  n('k', 'Edit mode', ['d'], Status.PLANNED, { details: 'Allow direct editing of the model by manipulating nodes and dependencies' }),
];

const model: RefidexModel = {
  domains: [],
  nodes,
};
const Graph = createRefidex(model);

ReactDOM.render(<Graph/>, document.getElementById('app'));
