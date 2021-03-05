import classNames from 'classnames';
import { observer } from 'mobx-react';
import { RefidexNode, Status } from 'model/model';
import React from 'react';
import { borderStyleId } from 'refidex/refidex';
import styles from './view.css';

const bubbleSize = parseInt(styles.bubbleSize, 10)
const halfBubble = bubbleSize / 2;
const svgStrokeWidth = parseInt(styles.strokeWidth, 10) - 1;
const svgStrokeWidthPx = `${svgStrokeWidth}px`;
const radius = halfBubble - (svgStrokeWidth / 2);
const circumference = 2 * Math.PI * radius;

const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

export const statusStyleMap: Record<Status, string | undefined> = {
  [Status.PLANNED]: styles.statusPlanned,
  [Status.SOON]: styles.statusSoon,
  [Status.IN_PROGRESS]: styles.statusInProgress,
  // Done is the default, and requires no style override.
  [Status.DONE]: undefined,
};

type NodeViewProps = {
  top: number,
  left: number,
  node: RefidexNode,
  showDetails: boolean,
  onClick?(e: React.MouseEvent, id: string): void,
};

@observer
export class NodeView extends React.Component<NodeViewProps> {
  private stopEvent(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
  }

  private onClick = (e: React.MouseEvent) => {
    this.props.onClick?.(e, this.props.node.id);
  }

  render() {
    const { top, left, node, showDetails } = this.props;
    const strokeDashProgress = node.status === Status.IN_PROGRESS && node.progress
        ? `${circumference * node.progress} ${circumference}`
        : undefined;
    return (
      <div
          className={classNames(styles.node, showDetails && styles.showingDetails)}
          style={{ top: `${top}px`, left: `${left}px` }}
      >
        <div
            className={classNames(
                styles.bubble,
                statusStyleMap[node.status || Status.DONE],
                node.status === Status.IN_PROGRESS && node.progress && styles.percentage,
                node.details && node.details.trim().length && styles.hasDetails,
            )}
            onClick={this.onClick}
        >
          {/* Add an svg filter stroke around the icon */}
          <div style={{ filter: `url(#${borderStyleId})`}}>
            {node.icon}
          </div>
        </div>
        {strokeDashProgress && (
          <svg viewBox={`0 0 ${bubbleSize} ${bubbleSize}`} className={styles.bubbleSvg}>
            <circle
                cx={halfBubble}
                cy={halfBubble}
                r={`${radius}px`}
                fill="none"
                stroke={styles.plannedColor}
                strokeWidth={svgStrokeWidthPx}
            />
            <circle
                cx={halfBubble}
                cy={halfBubble}
                r={`${radius}px`}
                fill="none"
                stroke={styles.doneColor}
                strokeLinecap="round"
                strokeWidth={svgStrokeWidthPx}
                strokeDasharray={strokeDashProgress}
                transform={`rotate(-90 ${halfBubble} ${halfBubble})`}
                className={styles.bubbleProgress}
            />
          </svg>
        )}
        <div className={styles.title} onMouseDown={this.stopEvent} onMouseUp={this.stopEvent} onMouseMove={this.stopEvent}>
          <span>{node.title}</span>
        </div>
        {showDetails && node.details && node.details.trim().length && (
          <div className={styles.details} onClick={stopPropagation}>
            {node.details}
          </div>
        )}
      </div>
    )
  }
}
