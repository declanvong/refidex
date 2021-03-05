import classNames from 'classnames';
import { RefidexNode, Status } from 'model/model';
import React from 'react';
import { borderStyleId } from 'refidex/refidex';
import styles from './view.css';

const halfBubble = parseInt(styles.bubbleSize, 10) / 2;
const svgStrokeWidth = parseInt(styles.strokeWidth, 10) - 1;
const svgStrokeWidthPx = `${svgStrokeWidth}px`;
const radius = halfBubble - (svgStrokeWidth / 2);
const circumference = 2 * Math.PI * radius;

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
  private stopEvent(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
  }

  render() {
    const { top, left, node } = this.props;
    const strokeDashProgress = node.status === Status.IN_PROGRESS && node.progress
        ? `${circumference * node.progress} ${circumference}`
        : undefined;
    return (
      <div className={styles.node} style={{ top: `${top}px`, left: `${left}px` }}>
        <div
            className={classNames(
                styles.bubble,
                statusStyleMap[node.status || Status.DONE],
                node.status === Status.IN_PROGRESS && node.progress
                    ? styles.percentage
                    : undefined,
            )}
        >
          {/* Add an svg filter stroke around the icon */}
          <div style={{ filter: `url(#${borderStyleId})`}}>
            {node.icon}
          </div>
        </div>
        {strokeDashProgress && (
          <svg viewBox={`0 0 ${styles.bubbleSize}px ${styles.bubbleSize}px`} className={styles.bubbleSvg}>
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
      </div>
    )
  }
}
