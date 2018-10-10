import React from "react";
import ReactDOM from "react-dom";

export class AnimationPlayer extends React.Component<{
  timelines: Array<any>;
}> {
  _animations: any = [];
  _buildAndPlay() {
    const el = ReactDOM.findDOMNode(this);
    const { timelines } = this.props;

    this._animations = timelines.map(tl => {
      const { keyframes, ...others } = tl;
      return (el as any).animate(keyframes, {
        ...others,
        iterations: Infinity
      });
    });
  }
  componentDidMount() {
    this._buildAndPlay();
  }

  componentDidUpdate() {
    this._animations.forEach((a: any) => a.cancel());
    const currentTime = Math.max(
      ...this._animations.map((a: any) => a.currentTime)
    );

    this._buildAndPlay();

    this._animations.forEach((a: any) => {
      a.currentTime = currentTime;
    });
  }

  render() {
    return this.props.children;
  }
}
