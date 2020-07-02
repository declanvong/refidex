import React from 'react';
import { LineView } from 'refidex/line';
import { NodeView } from 'refidex/node';
import { RefidexStore } from 'refidex/refidex_presenter';
import styles from './view.css';

export const borderStyleId = 'border';
const borderSvg = (
  <svg width="100%" height="100%" style={{ display: 'none' }}>
    <defs>
      <filter id={borderStyleId} >
        <feMorphology operator="dilate" in="SourceAlpha" radius="2" />
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0"/>
          <feFuncG type="table" tableValues="0.76"/>
          <feFuncB type="table" tableValues="0.8"/>
        </feComponentTransfer>
        <feComposite in="SourceGraphic" operator="over" />
      </filter>
    </defs>
  </svg>
);

const spacing = 150;

export class Refidex extends React.Component<{ store: RefidexStore }> {
  render() {
    const { nodes, lines } = this.props.store;
    return (
      <div className={styles.refidex}>
        {borderSvg}
        {lines.map((line, i) => (
          <LineView
              key={i}
              status={line.status}
              x1={line.start.column * spacing + 30}
              y1={line.start.row * spacing + 30}
              x2={line.end.column * spacing + 30}
              y2={line.end.row * spacing + 30}
          />
        ))}
        {nodes.map((node, i) => (
          <NodeView key={i} node={node} top={node.row * spacing} left={node.column * spacing} />
        ))}
      </div>
    )
  }
}
