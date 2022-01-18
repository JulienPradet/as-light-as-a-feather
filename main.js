import { canvasJp } from "canvas-jp";
import {
  white,
} from "canvas-jp/Color";

const width = 600;
const height = 600;
const frames = 100;

canvasJp(
  document.querySelector("#container"),
  async function (t, frame) {
    return {
      background: white,
      elements: [],
    };
  },
  {
    width: width,
    height: height,
    resolution: 1,
    title: "ProjectName",
    animation: false,
    numberOfFrames: frames,
    loop: false,
  }
);
