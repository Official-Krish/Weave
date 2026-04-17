export const SLIDER_STYLE = `
.hls-range {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
  outline: none;
}
.hls-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: #fff;
  margin-top: -5px;
  transition: transform 0.15s;
  box-shadow: 0 0 4px rgba(0,0,0,0.5);
}
.hls-range::-webkit-slider-thumb:hover {
  transform: scale(1.3);
}
.hls-range::-moz-range-thumb {
  width: 13px;
  height: 13px;
  border: none;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 4px rgba(0,0,0,0.5);
}
.hls-range::-webkit-slider-runnable-track {
  height: 3px;
  border-radius: 9999px;
  background: rgba(255,255,255,0.25);
}
.hls-range::-moz-range-track {
  height: 3px;
  border-radius: 9999px;
  background: rgba(255,255,255,0.25);
}

/* Volume range — vertical */
.hls-vol-range {
  -webkit-appearance: none;
  appearance: none;
  writing-mode: vertical-lr;
  direction: rtl;
  background: transparent;
  cursor: pointer;
  outline: none;
  width: 3px;
  height: 80px;
}
.hls-vol-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
  margin-left: -4.5px;
  transition: transform 0.15s;
}
.hls-vol-range::-webkit-slider-thumb:hover {
  transform: scale(1.3);
}
.hls-vol-range::-webkit-slider-runnable-track {
  width: 3px;
  border-radius: 9999px;
  background: rgba(255,255,255,0.25);
}
.hls-vol-range::-moz-range-track {
  width: 3px;
  border-radius: 9999px;
  background: rgba(255,255,255,0.25);
}
`;
