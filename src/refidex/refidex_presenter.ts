import { checkExists, checkState } from 'base/preconditions';
import { computed } from 'mobx';
import { RefidexDomain, RefidexModel, RefidexNode, Status } from 'model/model';

type RefidexPosition = {
  row: number;
  column: number;
};

type RefidexViewDomain = {
  data: RefidexDomain;
  pos: RefidexPosition;
}

type RefidexViewNode = {
  data: RefidexNode;
  pos: RefidexPosition;
}

type RefidexViewLine = {
  start: RefidexPosition;
  end: RefidexPosition;
  status?: Status;
}

type LinkedListNode<T> = {
  prev?: LinkedListNode<T>;
  next?: LinkedListNode<T>;
  value?: T;
}

function movePos(pos: RefidexPosition, dx: number, dy: number): RefidexPosition {
  return {
    row: pos.row + dy,
    column: pos.column + dx,
  };
}

function moveTo<T>(root: LinkedListNode<T>, index: number, createPath: boolean) {
  let currentNode = root;

  const getNext = (node: LinkedListNode<T>) => index >= 0 ? node.next : node.prev;
  const createNext = (node: LinkedListNode<T>) => {
    if (index >= 0) {
      node.next = { prev: node };
      return node.next;
    } else {
      node.prev = { next: node };
      return node.prev;
    }
  };

  for (let i = 0; i < Math.abs(index); i++) {
    let next = getNext(currentNode);
    if (!next) {
      if (!createPath) {
        return undefined;
      }
      next = createNext(currentNode);
    }
    currentNode = next;
  }
  return currentNode;
}

// A two dimensional collection, consisting of a linked list of rows, and each row being a linked list of cells.
class RefidexMap<T> {
  private root?: LinkedListNode<LinkedListNode<T>>;

  private getNode(pos: RefidexPosition, createPath: boolean): LinkedListNode<T> | undefined {
    if (!this.root) {
      throw new Error(`could not find position ${pos.column},${pos.row}`);
    }
    const row = moveTo(this.root, pos.row, createPath);
    if (!row) {
      return undefined;
    }
    if (!row.value) {
      if (createPath) {
        row.value = {};
      } else {
        return undefined;
      }
    }
    const cell = moveTo(row.value, pos.column, createPath);

    return cell;
  }

  has(pos: RefidexPosition) {
    return this.get(pos) != undefined;
  }

  get(pos: RefidexPosition) {
    const node = this.getNode(pos, false);
    if (!node) {
      return undefined;
    }
    return node.value;
  }

  set(pos: RefidexPosition, item: T) {
    if (pos.column === 0 && pos.row === 0 && !this.root) {
      this.root = { value: { value: item } };
      return;
    }
    const node = this.getNode(pos, true);
    checkState(node != null);
    node.value = item;
  }

  toList() {
    const items: (T & { row: number, column: number })[] = [];
    let row = this.root;

    const collectRow = (row: LinkedListNode<LinkedListNode<T>>, rowIndex: number) => {
      let cell = row.value;
      // Collect all positive cells
      for (let columnIndex = 0; cell != null; columnIndex++) {
        const item = cell.value;
        if (item != null) {
          items.push({ ...item, row: rowIndex, column: columnIndex });
        }
        cell = cell.next;
      }
      // Collect all negative cells
      cell = row.value?.prev;
      for (let columnIndex = -1; cell != null; columnIndex--) {
        const item = cell.value;
        if (item != null) {
          items.push({ ...item, row: rowIndex, column: columnIndex });
        }
        cell = cell.prev;
      }
    };

    // Collect all positive rows
    for (let rowIndex = 0; row != null; rowIndex++) {
      collectRow(row, rowIndex);
      row = row.next;
    }
    // Collect all negative rows
    row = this.root?.prev;
    for (let rowIndex = -1; row != null; rowIndex--) {
      collectRow(row, rowIndex);
      row = row.prev;
    }

    return items;
  }
}

export class RefidexStore {
  constructor(private readonly model: RefidexModel) { }

  domains: RefidexViewDomain[] = [];

  @computed
  get nodes() {
    return this.graph.nodes;
  }

  @computed
  get lines() {
    return this.graph.lines;
  }

  @computed
  private get graph() {
    const done = new Map<string, RefidexViewNode>();
    const map = new RefidexMap<RefidexNode>();
    const backlog: RefidexNode[] = [];
    const lines: RefidexViewLine[] = [];

    const createAtPos = (node: RefidexNode, pos: RefidexPosition) => {
      const viewNode = {
        data: node,
        pos,
      }
      done.set(node.id, viewNode);
      map.set(viewNode.pos, viewNode.data);
    };

    const performWork = (sourceNodes: RefidexNode[]) => {
      for (const node of sourceNodes) {
        if (node.dependencies && node.dependencies.length > 0) {
          // Find the positions of all dependencies
          const dependencies = [];
          for (const dependency of node.dependencies) {
            const dependencyViewNode = done.get(dependency);
            if (!dependencyViewNode) {
              backlog.push(node);
              continue;
            }
            dependencies.push(dependencyViewNode);
          }
          // TODO(declan): support multiple dependency positions

          const dependencyPos = dependencies[0].pos;

          let foundPosition = false;
          for (const offset of [
            // Try place the node below the dependent node.
            [0, 2],
            // Otherwise, try the bottom right
            [1, 1],
            // Otherwise, try the bottom left
            [-1, 1],
          ]) {
            const trialPosition = movePos(dependencyPos, offset[0], offset[1]);
            if (!map.has(trialPosition)) {
              createAtPos(node, trialPosition);
              lines.push({
                start: dependencyPos,
                end: trialPosition,
                status: node.status,
              });
              foundPosition = true;
              break;
            }
          }
          if (foundPosition) {
            continue;
          }

          throw new Error('could not place node');
        } else {
          // Must be the root node. Unconnected nodes are not permitted.
          checkState(done.size === 0);
          createAtPos(node, { row: 0, column: 0 });
        }
      }
    };

    performWork(this.model.nodes);

    let count = 0;
    while (backlog.length > 0) {
      performWork(backlog);
      if (count++ > 50) {
        throw new Error('iteration cycle count exceeded 50');
      }
    }

    return {
      nodes: map.toList(),
      lines,
    };
  }
}

export class RefidexPresenter {

}
