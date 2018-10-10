import "web-animations-js/web-animations-next.min.js";

import eachCons from "each-cons";

import React from "react";
import uuid from "uuid";
import uniq from "lodash/uniq";

import { Node, Text } from "./SVGHelpers";
import { AnimationPlayer } from "./AnimationPlayer";

const GRID_SIZE = 32;

type Anchor = {
  id: string;
  at: number;
  value: number;
};

type Property = {
  id: string;
  propertyName: string;
  anchorIds: string[];
};

type State = {
  cameraWidth: number;
  scale: number;
  selectedAnchorIds: string[];
  properties: Property[];
  anchorMap: { [id: string]: Anchor };
};

function createAnchor(at: number, value: number): Anchor {
  return {
    id: uuid(),
    at,
    value
  };
}

const MIN_DISPLAY_SIZE = 50;
const MAX_DISPLAY_SIZE = GRID_SIZE * 32;
const INITIAL_DISPLAY_SIZE = GRID_SIZE * 26;
const MAX_DISPLAY_HEIGHT = GRID_SIZE * 80;

const actions = {
  changeCameraWidth: (value: number) => (state: State): State => {
    const cameraWidth = Math.min(
      Math.max(Math.floor(state.cameraWidth + value), MIN_DISPLAY_SIZE),
      MAX_DISPLAY_SIZE
    );
    return {
      ...state,
      cameraWidth,
      scale: cameraWidth / MAX_DISPLAY_SIZE
    };
  },
  addSelectedAnchors: (anchorIds: string[]) => (state: State): State => {
    return {
      ...state,
      selectedAnchorIds: uniq([...state.selectedAnchorIds, ...anchorIds])
    };
  },
  setSelectedAnchors: (anchorIds: string[]) => (state: State): State => {
    return {
      ...state,
      selectedAnchorIds: anchorIds
    };
  },

  clearSelectedAnchors: (state: State): State => {
    return { ...state, selectedAnchorIds: [] };
  },
  modifyAnchors: (
    anchorIds: string[],
    modifier: (anchor: Anchor) => Anchor
  ) => (state: State): State => {
    const newAnchorMap = anchorIds.reduce((acc, id) => {
      const anchor = state.anchorMap[id];
      const newAnchor = modifier(anchor);
      return { ...acc, [id]: newAnchor };
    }, state.anchorMap);
    return { ...state, anchorMap: newAnchorMap };
  },
  deleteAnchor: (anchorId: string) => (state: State): State => {
    const { anchorId: _, ...deletedAnchorMap } = state.anchorMap;
    const newProperties = state.properties.map(prop => {
      const newAnchorIds = prop.anchorIds.filter(aid => aid != anchorId);
      return {
        ...prop,
        anchorIds: newAnchorIds
      };
    });
    return {
      ...state,
      anchorMap: deletedAnchorMap,
      properties: newProperties
    };
  },
  insertNewAnchor: (anchor: Anchor, propertyId: string) => (
    state: State
  ): State => {
    const prop = state.properties.find(p => p.id === propertyId);
    if (prop != null) {
      const anchors = prop.anchorIds.map(aid => state.anchorMap[aid]);
      const newAnchorIds = [
        ...anchors.filter(a => a.at < anchor.at).map(a => a.id),
        anchor.id,
        ...anchors.filter(a => anchor.at < a.at).map(a => a.id)
      ];
      const newProp: Property = { ...prop, anchorIds: newAnchorIds };
      return {
        ...state,
        anchorMap: { ...state.anchorMap, [anchor.id]: anchor },
        properties: state.properties.map(p => {
          if (p.id === newProp.id) {
            return newProp;
          } else {
            return p;
          }
        })
      };
    }
    return state;
  }
};

const a0 = createAnchor(0, 250);
const a1 = createAnchor(200, 50);
const a2 = createAnchor(600, 600);
const a3 = createAnchor(1000, 350);

const initialState: State = {
  cameraWidth: INITIAL_DISPLAY_SIZE,
  scale: INITIAL_DISPLAY_SIZE / MAX_DISPLAY_SIZE,
  selectedAnchorIds: [],
  properties: [
    {
      id: uuid(),
      propertyName: "width",
      anchorIds: [a0.id, a1.id, a2.id, a3.id]
    }
  ],
  anchorMap: {
    [a0.id]: a0,
    [a1.id]: a1,
    [a2.id]: a2,
    [a3.id]: a3
  }
};

function stateToTimelines(state: State) {
  const timelines = state.properties.map(prop => {
    const duration = 1000;
    const keyframes = prop.anchorIds.map(anchorId => {
      const anchor = state.anchorMap[anchorId];
      return {
        [prop.propertyName]: anchor.value + "px",
        offset: anchor.at / duration
      };
    });

    return {
      duration,
      keyframes
    };
  });
  return timelines;
}

export class SVGField extends React.Component<{}, State> {
  state = initialState;

  componentDidMount() {
    window.addEventListener("keydown", ev => {
      console.log("key", ev.key);
      if (ev.key === "Escape") {
        this.setState(actions.clearSelectedAnchors);
      }

      const shiftKey = ev.shiftKey;

      if (ev.key === "Backspace") {
        if (this.state.selectedAnchorIds.length > 0) {
          ev.preventDefault();
          for (const aid of this.state.selectedAnchorIds) {
            this.setState(actions.deleteAnchor(aid));
          }
        }
      }

      if (ev.key === "ArrowRight") {
        if (this.state.selectedAnchorIds.length > 0) {
          ev.preventDefault();
          this.setState(
            actions.modifyAnchors(this.state.selectedAnchorIds, anchor => {
              if (anchor.value === 0 || anchor.value === 1000) {
                return anchor;
              }
              return { ...anchor, at: anchor.at + (shiftKey ? 10 : 1) };
            })
          );
        }
      }

      if (ev.key === "ArrowLeft") {
        if (this.state.selectedAnchorIds.length > 0) {
          ev.preventDefault();
          this.setState(
            actions.modifyAnchors(this.state.selectedAnchorIds, anchor => {
              if (anchor.value === 0 || anchor.value === 1000) {
                return anchor;
              }

              return { ...anchor, at: anchor.at - (shiftKey ? 10 : 1) };
            })
          );
        }
      }

      if (ev.key === "ArrowUp") {
        if (this.state.selectedAnchorIds.length > 0) {
          ev.preventDefault();
          this.setState(
            actions.modifyAnchors(this.state.selectedAnchorIds, anchor => {
              return { ...anchor, value: anchor.value + (shiftKey ? 10 : 1) };
            })
          );
        }
      }

      if (ev.key === "ArrowDown") {
        if (this.state.selectedAnchorIds.length > 0) {
          ev.preventDefault();

          this.setState(
            actions.modifyAnchors(this.state.selectedAnchorIds, anchor => {
              return { ...anchor, value: anchor.value - (shiftKey ? 10 : 1) };
            })
          );
        }
      }
    });
  }
  render() {
    const { scale } = this.state;
    const timelines = stateToTimelines(this.state);
    return (
      // Wrapper
      <div
        style={{ width: MAX_DISPLAY_SIZE + GRID_SIZE * 2, overflow: "auto" }}
      >
        <pre>
          <code>{JSON.stringify(timelines)}</code>
        </pre>
        {/* <AnimationPlayer key={JSON.stringify(timelines)} timelines={timelines}> */}
        <AnimationPlayer timelines={timelines}>
          <div style={{ background: "green", width: 250, height: 100 }} />
        </AnimationPlayer>
        <div>scale: {this.state.scale}</div>
        {/* <div>selectedIds: {this.state.selectedAnchorIds.join(", ")}</div> */}

        <svg
          width={MAX_DISPLAY_SIZE + GRID_SIZE * 2}
          height={GRID_SIZE * 2 * 6 + GRID_SIZE / 2}
          onWheel={ev => {
            ev.preventDefault();
            this.setState(actions.changeCameraWidth(ev.deltaY));
          }}
          style={{
            userSelect: "none"
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
          {/* <rect
            x={0}
            y={0}
            width={MAX_DISPLAY_SIZE}
            height={400}
            fill="transparent"
            stroke="black"
          /> */}

          <Text x={GRID_SIZE / 2 + 50} y={GRID_SIZE + 50}>
            width
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
              <Node x={0} y={GRID_SIZE}>
                {this.state.properties.map(prop => {
                  return (
                    <React.Fragment key={prop.id}>
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
                          const at = Math.floor(px / scale);
                          const anchors = prop.anchorIds.map(
                            id => this.state.anchorMap[id]
                          );
                          const lastAnchor = anchors.find((cur, idx) => {
                            const next = anchors[idx + 1];
                            if (cur.at < at && next == null) {
                              return true;
                            }
                            if (next) {
                              return cur.at < at && at < next.at;
                            }
                            return false;
                          });

                          const value = lastAnchor ? lastAnchor.value : 0;

                          const anchor = createAnchor(at, value);
                          this.setState(
                            actions.insertNewAnchor(anchor, prop.id)
                          );
                          this.setState(
                            actions.setSelectedAnchors([anchor.id])
                          );
                        }}
                      />

                      {/* Anchors */}
                      {prop.anchorIds.map(anchorId => {
                        const anchor = this.state.anchorMap[anchorId];
                        const x = anchor.at * scale;
                        return (
                          <React.Fragment key={anchor.id}>
                            <circle
                              cx={x}
                              cy={0}
                              r={GRID_SIZE / 4}
                              stroke="black"
                              fill={
                                this.state.selectedAnchorIds.includes(anchorId)
                                  ? "yellow"
                                  : "red"
                              }
                              onMouseDown={ev => {
                                console.log("mousedown on anchor", anchor.id);
                                this.setState(
                                  ev.shiftKey
                                    ? actions.addSelectedAnchors([anchor.id])
                                    : actions.setSelectedAnchors([anchor.id])
                                );
                              }}
                            />
                            <Text x={x} y={20}>
                              {anchor.value}
                            </Text>
                            />
                          </React.Fragment>
                        );
                      })}

                      {/* Easings */}
                      {eachCons(prop.anchorIds, 2).map(
                        ([fromId, toId]: [string, string]) => {
                          const from = this.state.anchorMap[fromId];
                          const to = this.state.anchorMap[toId];
                          const storke =
                            from.value === to.value
                              ? "gray"
                              : from.value < to.value
                                ? "red"
                                : "blue";

                          return (
                            <React.Fragment key={from.id + "-" + to.id}>
                              <line
                                x1={from.at * scale}
                                y1={0}
                                x2={to.at * scale}
                                y2={0}
                                stroke={storke}
                              />
                              <text
                                x={((from.at + to.at) / 2) * scale}
                                y={0}
                                dominantBaseline="middle"
                                textAnchor="middle"
                                fontSize="0.8em"
                                style={{ pointerEvents: "none" }}
                              >
                                linear
                              </text>
                            </React.Fragment>
                          );
                        }
                      )}
                    </React.Fragment>
                  );
                })}
                )}
              </Node>
            </Node>
          </Node>
        </svg>
        <div>
          <h3>How to use</h3>
          <dl>
            <dt>Mouse:Click to Anchor</dt>
            <dd>Select anchor</dd>

            <dt>Mouse:Sfift+Click to Anchor</dt>
            <dd>Select multiple anchors</dd>

            <dt>Mouse:Wheel Up/Down</dt>
            <dd>Change timeline scale</dd>

            <dt>Mouse:Sfift+Click to baseline</dt>
            <dd>Insert new anchor</dd>

            <dt>Key:Right</dt>
            <dd>Move selected anchors to Right</dd>

            <dt>Key:Left (+Shift by 10)</dt>
            <dd>Move selected anchors to Left</dd>

            <dt>Key:Up (+Shift by 10)</dt>
            <dd>Increase selected anchors' value</dd>

            <dt>Key:Down (+Shift by 10)</dt>
            <dd>Decrease selected anchors' value</dd>

            <dt>Key:Delete (+Shift by 10)</dt>
            <dd>Delete selected anchors</dd>
          </dl>
        </div>
      </div>
    );
  }
}
