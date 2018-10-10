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

class App extends React.Component<{}, State> {
  render() {
    return (
      <>
        <h1>Timeline Editor</h1>
        <SVGField />
      </>
    );
  }
}

ReactDOM.render(<App />, document.querySelector("#root"));
