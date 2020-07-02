import classNames from 'classnames';
import { RefidexNode, Status } from 'model/model';
import React from 'react';
import { borderStyleId } from 'refidex/refidex';
import styles from './view.css';

export const statusStyleMap: Record<Status, string | undefined> = {
  [Status.PLANNED]: styles.statusPlanned,
  [Status.SOON]: styles.statusSoon,
  [Status.IN_PROGRESS]: styles.statusInProgress,
  // Done is the default, and requires no style override.
  [Status.DONE]: undefined,
};

export class NodeView extends React.Component<{
  top: number,
  left: number,
  node: RefidexNode,
}> {
  render() {
    const { top, left, node } = this.props;
    return (
      <div className={styles.node} style={{ top: `${top}px`, left: `${left}px` }}>
        <div className={classNames(styles.bubble, statusStyleMap[node.status || Status.DONE])}>
          <div style={{ filter: `url(#${borderStyleId})`}}>
            {node.icon}
          </div>
        </div>
        <div className={styles.title}>
          <span>{node.title}</span>
        </div>
      </div>
    )
  }
}
