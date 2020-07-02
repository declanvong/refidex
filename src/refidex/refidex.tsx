import { action, computed, observable } from 'mobx';
import { observer } from 'mobx-react';
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

class Camera {
  // The camera bounds, in world space coordinates.
  @observable.ref
  private top = 0;
  @observable.ref
  private left = 0;
  @observable.ref
  // The camera zoom level.
  private zoom = 1;

  // Mouse down coordinates, in screen space
  private mouseDownState?: { cameraTop: number, cameraLeft: number, mouseX: number, mouseY: number };
  private readonly onMouseUp = () => this.mouseDownState = undefined;
  private readonly onMouseDown = (e: MouseEvent) => {
    this.mouseDownState = {
      cameraTop: this.top,
      cameraLeft: this.left,
      mouseX: e.clientX,
      mouseY: e.clientY,
    };
  };

  @computed
  get transformString() {
    return `translate(${this.left}px, ${this.top}px) scale(${this.zoom})`;
  }

  @action.bound
  private onMouseMove(e: MouseEvent) {
    if (!this.mouseDownState) {
      return;
    }
    this.top = this.mouseDownState.cameraTop + (e.clientY - this.mouseDownState.mouseY);
    this.left = this.mouseDownState.cameraLeft + (e.clientX - this.mouseDownState.mouseX);
  }

  @action.bound
  private onWheel(e: WheelEvent) {
    const delta = e.deltaY * -0.002 * this.zoom;
    if ((delta > 0 && this.zoom >= 5) || (delta < 0 && this.zoom <= 0.1)) {
      return;
    }
    // Adjust top + left to scale around the mouse position as origin
    this.top -= (e.clientY - this.top) * delta / this.zoom;
    this.left -= (e.clientX - this.left) * delta / this.zoom;

    this.zoom += delta;
  }

  setPosition(top: number, left: number) {
    this.top = top;
    this.left = left;
  }

  bindEvents() {
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('wheel', this.onWheel);
  }
  unbindEvents() {
    window.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('wheel', this.onWheel);
  }
}

const SPACING_Y = 100;
const SPACING_X = 150;
const halfBubble = parseInt(styles.bubbleSize, 10) / 2;

@observer
export class Refidex extends React.Component<{ store: RefidexStore }> {
  private camera = new Camera();

  componentDidMount() {
    this.camera.bindEvents();
    this.camera.setPosition((window.innerHeight / 4) - halfBubble, (window.innerWidth / 2) - halfBubble);
  }
  componentWillUnmount() {
    this.camera.unbindEvents();
  }

  render() {
    const { nodes, lines } = this.props.store;
    return (
      <div
          className={styles.refidex}
          style={{ transform: this.camera.transformString }}
      >
        {borderSvg}
        {lines.map((line, i) => (
          <LineView
              key={i}
              status={line.status}
              x1={line.start.column * SPACING_X + halfBubble}
              y1={line.start.row * SPACING_Y + halfBubble}
              x2={line.end.column * SPACING_X + halfBubble}
              y2={line.end.row * SPACING_Y + halfBubble}
          />
        ))}
        {nodes.map((node, i) => (
          <NodeView key={i} node={node} top={node.row * SPACING_Y} left={node.column * SPACING_X} />
        ))}
      </div>
    )
  }
}
