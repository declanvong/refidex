import classNames from 'classnames';
import { Status } from 'model/model';
import React from 'react';
import { statusStyleMap } from 'refidex/node';
import styles from './view.css';

export class LineView extends React.Component<{ status?: Status, x1: number, y1: number, x2: number, y2: number }> {
  render() {
    const { status, x1, y1, x2, y2 } = this.props;

    const t = Math.min(y1, y2);
    const l = Math.min(x1, x2);
    const b = Math.max(y1, y2);
    const r = Math.max(x1, x2);
    const height = b - t;
    const width = r - l;

    return (
        <div
            className={styles.line}
            style={{
              top: `${t}px`,
              left: `${l}px`,
              width: `${width}px`,
              height: `${height}px`,
              minWidth: '2px',
              minHeight: '2px',
            }}
        >
          <svg className={styles.lineSvg} viewBox={`-1 -1 ${Math.max(width, 2)} ${Math.max(height, 2)}`}>
            <line
                vectorEffect="non-scaling-stroke"
                className={classNames(styles.lineSvgContent, statusStyleMap[status || Status.DONE])}
                x1={x1 - l}
                y1={y1 - t}
                x2={x2 - l}
                y2={y2 - t}
            />
          </svg>
        </div>
    )
  }
}
