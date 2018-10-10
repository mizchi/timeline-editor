import React from "react";
export const Node = (props: {
  x: number;
  y: number;
  children: React.ReactNode;
  onClick?: any;
}) => (
  <g transform={`translate(${props.x},${props.y})`} onClick={props.onClick}>
    {props.children}
  </g>
);

export const Text = (props: {
  x: number;
  y: number;
  children: React.ReactNode;
  opts?: any;
}) => {
  return (
    <text
      x={props.x}
      y={props.y}
      textAnchor="middle"
      dominantBaseline="middle"
      {...props.opts || {}}
    >
      {props.children}
    </text>
  );
};
