import React from "react";
import { Node, Text } from "./SVGHelpers";

const GRID_SIZE = 32;
type Property = {
  ranges: [number, number][];
};

type State = {
  cameraWidth: number;
  scale: number;
  properties: Property[];
};

const MIN_DISPLAY_SIZE = 50;
const MAX_DISPLAY_SIZE = GRID_SIZE * 32;
const INITIAL_DISPLAY_SIZE = GRID_SIZE * 16;
const MAX_DISPLAY_HEIGHT = GRID_SIZE * 80;

const actions = {
  changeCameraWidth: (value: number) => (state: State) => {
    const cameraWidth = Math.min(
      Math.max(Math.floor(state.cameraWidth + value), MIN_DISPLAY_SIZE),
      MAX_DISPLAY_SIZE
    );
    return {
      ...state,
      cameraWidth,
      scale: cameraWidth / MAX_DISPLAY_SIZE
    };
  }
};

export class SVGField extends React.Component<{}, State> {
  state = {
    cameraWidth: INITIAL_DISPLAY_SIZE,
    scale: INITIAL_DISPLAY_SIZE / MAX_DISPLAY_SIZE,
    properties: [
      {
        name: "opacity",
        ranges: [
          [0, 50] as [number, number],
          [300, 800] as [number, number],
          [900, 1000] as [number, number]
        ]
      }
    ]
  };
  render() {
    const { scale } = this.state;
    return (
      // Wrapper
      <div
        style={{ width: MAX_DISPLAY_SIZE + GRID_SIZE * 2, overflow: "auto" }}
      >
        <div>cameraX: {this.state.cameraWidth}</div>
        <svg
          width={MAX_DISPLAY_SIZE + GRID_SIZE * 2}
          height={GRID_SIZE * 2 * 2 + GRID_SIZE / 2}
          onWheel={ev => {
            ev.preventDefault();
            this.setState(actions.changeCameraWidth(ev.deltaY));
          }}
        >
          {/* Whole range */}
          <rect
            x={0}
            y={10}
            width={this.state.cameraWidth}
            height={MAX_DISPLAY_SIZE}
            fill="transparent"
          />

          {/* Padding */}
          <rect
            x={0}
            y={0}
            width={MAX_DISPLAY_SIZE}
            height={400}
            fill="transparent"
            stroke="black"
          />

          <Text x={GRID_SIZE / 2 + 50} y={GRID_SIZE + 50}>
            opacity
          </Text>

          <Node x={GRID_SIZE / 2 + 100} y={GRID_SIZE / 2}>
            {/* Ranges */}
            <Node x={0} y={GRID_SIZE}>
              {/* Grid */}
              {new Array(Math.floor(MAX_DISPLAY_SIZE / GRID_SIZE))
                .fill(0)
                .map((_, i) => {
                  const x = 50 * i * scale;
                  return (
                    <React.Fragment key={i}>
                      {i % 5 === 0 && (
                        <Text x={50 * i * scale} y={0}>
                          {50 * i}
                        </Text>
                      )}
                      <line
                        x1={x}
                        y1={0}
                        x2={x}
                        y2={MAX_DISPLAY_HEIGHT}
                        stroke="black"
                        strokeDasharray="3 3 3 3"
                      />
                    </React.Fragment>
                  );
                })}
              {/* Preperties */}
              <Node x={0} y={GRID_SIZE}>
                {this.state.properties.map((p, pi) => {
                  return p.ranges.map(([start, end], index) => {
                    const from = start * scale;
                    const to = (end - start) * scale;
                    return (
                      <React.Fragment key={index}>
                        <line
                          x1={from}
                          y1={0}
                          x2={from + to}
                          y2={0}
                          fill="red"
                          stroke="red"
                        />
                        <circle
                          cx={from}
                          cy={0}
                          r={GRID_SIZE / 8}
                          stroke="black"
                          fill="red"
                        />
                        <circle
                          cx={from + to}
                          cy={0}
                          r={GRID_SIZE / 8}
                          stroke="black"
                          fill="red"
                        />

                        {/* <rect
                          key={index}
                          x={from}
                          y={0}
                          width={to}
                          height={10}
                          fill="red"
                        /> */}
                        {/* <Text x={from} y={0}>
                        {start}
                      </Text>
                      <Text x={from + to} y={0}>
                        {end}
                      </Text> */}
                      </React.Fragment>
                    );
                  });
                })}
                {/* Hitmap */}
                <rect
                  x={0}
                  y={-GRID_SIZE / 2}
                  width={MAX_DISPLAY_SIZE * 2}
                  height={GRID_SIZE}
                  fill="rgba(255, 0, 0, 0.1)"
                  onClick={ev => {
                    const rect = (ev.target as any).getBoundingClientRect();
                    const px = ev.pageX - rect.left;
                    const py = ev.pageY - rect.top;

                    console.log("hitmap", px, py);
                  }}
                />
              </Node>
            </Node>
          </Node>
        </svg>
      </div>
    );
  }
}
