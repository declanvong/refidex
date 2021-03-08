import { Button } from 'base/ui/button';
import { action, makeAutoObservable, makeObservable, observable } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { LineView } from 'refidex/line';
import { NodeView } from 'refidex/node';
import { RefidexStore } from 'refidex/refidex_presenter';
import styles from './view.css';

export const borderStyleId = 'border';
// An SVG filter to add a stroke border to any text / HTML element.
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
  private top = 0;
  private left = 0;
  // The camera zoom level.
  private zoom = 1;

  constructor() {
    makeAutoObservable(this);
  }

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

  get transformString() {
    return `translate(${this.left}px, ${this.top}px) scale(${this.zoom})`;
  }

  private onMouseMove = (e: MouseEvent) => {
    if (!this.mouseDownState) {
      return;
    }
    this.top = this.mouseDownState.cameraTop + (e.clientY - this.mouseDownState.mouseY);
    this.left = this.mouseDownState.cameraLeft + (e.clientX - this.mouseDownState.mouseX);
  }

  private onWheel = (e: WheelEvent) => {
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

const SPACING_X = parseInt(styles.spacingX, 10);
const SPACING_Y = parseInt(styles.spacingY, 10);
const halfBubble = parseInt(styles.bubbleSize, 10) / 2;

type RefidexProps = { store: RefidexStore, onOpen(file: any): void };

@observer
export class Refidex extends React.Component<RefidexProps> {
  private currentDetailsId: string | undefined = undefined;
  private camera = new Camera();
  private uploadFileRef = React.createRef<HTMLInputElement>();

  constructor(props: RefidexProps) {
    super(props);
    makeObservable<Refidex, 'currentDetailsId' | 'onNodeClick' | 'onBackgroundClick' | 'onUpload'>(this, {
      currentDetailsId: observable,
      onNodeClick: action.bound,
      onBackgroundClick: action.bound,
      onUpload: action.bound,
    })
  }

  componentDidMount() {
    this.camera.bindEvents();
    this.camera.setPosition((window.innerHeight / 4) - halfBubble, (window.innerWidth / 2) - halfBubble);
  }
  componentWillUnmount() {
    this.camera.unbindEvents();
  }

  private onNodeClick(e: React.MouseEvent, id: string) {
    if (this.currentDetailsId === id) {
      this.currentDetailsId = undefined;
    } else {
      this.currentDetailsId = id;
    }
    e.stopPropagation();
  }

  private onBackgroundClick() {
    this.currentDetailsId = undefined;
  }

  private onOpenClick = () => {
    if (this.uploadFileRef.current) {
      this.uploadFileRef.current.click();
    }
  }

  private async onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const input = this.uploadFileRef.current;
    if (!input || !input.files || input.files.length !== 1) {
      return;
    }
    const file = input.files[0];
    const json = JSON.parse(await file.text());
    this.props.onOpen(json);
  }

  render() {
    const { nodes, lines } = this.props.store;
    return (
      <div className={styles.background} onClick={this.onBackgroundClick}>
        <input type="file" style={{ display: 'none' }} ref={this.uploadFileRef} onChange={this.onUpload}/>
        <Button onClick={this.onOpenClick}>Open</Button>
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
            <NodeView
                key={node.id}
                node={node}
                top={node.row * SPACING_Y}
                left={node.column * SPACING_X}
                showDetails={this.currentDetailsId === node.id}
                onClick={this.onNodeClick}
            />
          ))}
        </div>
      </div>
    )
  }
}
