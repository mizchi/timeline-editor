import React from "react";

type InlineInputProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  value: string;
  onChange: (ev: any) => void;
};

export class InlineInput extends React.Component<
  InlineInputProps,
  {
    value: string;
  }
> {
  constructor(props: InlineInputProps) {
    super(props);
    this.state = {
      value: this.props.value
    };
  }
  render() {
    return (
      <foreignObject
        x={this.props.x}
        y={this.props.y}
        width={this.props.width}
        height={this.props.height}
      >
        <input
          style={{
            padding: 0,
            margin: 0,
            width: this.props.width,
            height: this.props.height,
            outline: "none",
            boxSizing: "border-box",
            background: "rgba(255, 255, 255, 0.5)",
            textAlign: "center"
          }}
          value={this.state.value}
          onChange={ev => {
            this.props.onChange(ev);
            this.setState({ value: ev.target.value });
          }}
        />
      </foreignObject>
    );
  }
}
