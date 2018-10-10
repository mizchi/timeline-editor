import "web-animations-js";

import * as React from "react";
import * as ReactDOM from "react-dom";
import styled from "styled-components";
import { InlineInput } from "./components/InlineInput";
import { Node } from "./components/SVGHelpers";
import { runInThisContext } from "vm";
import { SVGField } from "./components/SVGField";

type State = {
  timelines: Keyframe[];
};

const WIDTH = 800;
const GRID_SIZE = 32;

const KeyframeAnchor = (props: { x: number; y: number; value: string }) => {
  return (
    <Node x={props.x} y={props.y}>
      <rect x={0} y={0} width={GRID_SIZE} height={GRID_SIZE * 2} fill="#aaa" />
      <InlineInput
        x={0}
        y={24}
        width={GRID_SIZE}
        height={GRID_SIZE}
        value={props.value}
        onChange={() => {
          console.log("xxx");
        }}
      />
    </Node>
  );
};

const PropertyLine = (props: {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
}) => {
  return (
    <Node x={props.x} y={props.y}>
      <InlineInput
        x={0}
        y={0}
        width={100}
        height={GRID_SIZE * 2}
        value={props.name}
        onChange={ev => {
          console.log("xxx");
        }}
      />
      <Node x={100} y={0}>
        {/* Timeline Bar */}
        <rect
          x={0}
          y={0}
          width={props.width}
          height={props.height}
          fill="transparent"
          stroke="black"
        />
        <KeyframeAnchor x={0} y={0} value={"0"} />
        <KeyframeAnchor x={props.width - GRID_SIZE} y={0} value={"1"} />

        <rect
          x={0}
          y={0}
          width={props.width}
          height={GRID_SIZE}
          stroke="#eee"
          fill="#888"
        />

        <line
          x1={GRID_SIZE / 2}
          y1={GRID_SIZE / 2}
          x2={props.width - GRID_SIZE / 2}
          y2={GRID_SIZE / 2}
          stroke="black"
        />
        <circle
          cx={GRID_SIZE / 2}
          cy={GRID_SIZE / 2}
          r={6}
          fill="red"
          stroke="black"
        />
        <circle
          cx={props.width - GRID_SIZE / 2}
          cy={GRID_SIZE / 2}
          r={6}
          fill="red"
          stroke="black"
        />
      </Node>
    </Node>
  );
};

class App extends React.Component<{}, State> {
  render() {
    return (
      <>
        <h1>Timeline Editor</h1>
        {/* <div style={{ width: 800, height: 600 }}>Player...</div> */}
        {/* <hr /> */}
        <div>
          element: <input defaultValue=".root" />
        </div>
        <SVGField />
      </>
    );
  }
}

ReactDOM.render(<App />, document.querySelector("#root"));
