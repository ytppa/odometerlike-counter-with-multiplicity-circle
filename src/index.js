import "./styles.css";

import Odometer from "odometer";
import "odometer/themes/odometer-theme-default.css";

// (function() {

class CounterCircle {
  constructor(props) {
    this.state = {
      radius: 100,
      strokeWidth: props.strokeWidth || 10,
      quantity: props.quantity || 5,
      value: props.value || 0,
      element: null,
      sections: []
    };

    // this.state.radius = (this.state.radius - this.state.strokeWidth) / 2;

    this.init(props.container);
  }

  init(aContainer) {
    const { radius, strokeWidth, quantity } = this.state,
      container = document.querySelector(aContainer);

    if (!container) return false;

    const pathLength = Math.PI * 90,
      sectionLength = pathLength / quantity,
      sectionOffset = 0.1 * sectionLength,
      dasharray = `${sectionLength - sectionOffset}, ${pathLength}`,
      sections = [];

    const el = document.createElement("div");
    el.classList.add("yt-circle");

    let svg = SVG()
      .addClass("yt-circle__svg")
      .viewbox("0 0 100 100")
      .fill("none")
      .addTo(el);

    // Circles
    for (let i = 0; i < quantity; i++) {
      const c = svg
        .circle(radius - strokeWidth)
        .addClass("yt-circle__arc")
        .move(strokeWidth / 2, strokeWidth / 2)
        .stroke({
          width: strokeWidth,
          linecap: "butt",
          dashoffset: -sectionLength * i,
          dasharray: dasharray
        });

      sections.push(c);
    }

    this.state.sections = sections;
    this.updateActive();

    container.appendChild(el);
  }

  setValue(aValue) {
    if (aValue !== undefined && Number.isInteger(aValue)) {
      this.state.value = aValue;
    }

    this.updateActive();
  }

  updateActive() {
    const { value, sections } = this.state;

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];

      if (value >= i + 1) {
        section.addClass("yt-circle__arc_active");
      } else {
        section.removeClass("yt-circle__arc_active");
      }
    }
  }
}

class CounterNumber {
  constructor(props) {
    const p = props || {};

    this.state = {
      value: p.value || 0,
      multiplicity: p.multiplicity || 50,
      step: p.multiplicity % p.step === 0 ? p.step : 10,
      circle: null,
      odometerContainer: null,
      odometer: null,
      containerSelector: p.containerSelector || "#app"
    };

    this.init();
  }

  init() {
    const { value, multiplicity, step, containerSelector } = this.state;

    this.state.circle = new CounterCircle({
      container: containerSelector,
      quantity: multiplicity / step,
      value: value / step
    });

    const odContainer = document.createElement("div"),
      odNumber = document.createElement("div");

    odNumber.classList.add("yt-digit__number");
    odContainer.appendChild(odNumber);
    odContainer.classList.add("yt-digit");

    this.state.odometer = new Odometer({
      el: odNumber,
      value: value,
      format: "( ddd)"
      // theme: "digital"
    });

    document.querySelector(containerSelector).appendChild(odContainer);
    this.state.odometerContainer = odContainer;

    this.render();
  }

  setValue(x) {
    const { step } = this.state;

    if (x % step !== 0) {
      throw new Error("Multiplicity validation failed");
    }

    if (x < 0) {
      throw new Error("Negative number");
    }

    this.state.value = x;
    this.render();
    return true;
  }

  set value(x) {
    try {
      this.setValue(x);
    } catch (e) {
      console.error(e.message);
    }
  }

  get value() {
    return this.state.value;
  }

  add(x) {
    return (this.value += x);
  }

  remove(x) {
    return (this.value -= x);
  }

  render() {
    const {
        circle,
        step,
        multiplicity,
        odometerContainer,
        odometer
      } = this.state,
      value = this.value;

    odometer.update(value);
    if (value % multiplicity === 0) {
      odometerContainer.classList.remove("yt-digit_invalid");
      odometerContainer.classList.add("yt-digit_valid");
    } else {
      odometerContainer.classList.remove("yt-digit_valid");
      odometerContainer.classList.add("yt-digit_invalid");
    }

    let v = (value % multiplicity) / step;
    v = v === 0 ? (value === 0 ? v : multiplicity / step) : v;
    circle.setValue(v);
  }
}

/**
 * Init
 */

const multiplicity = 50,
  step = 10;

let coNum = new CounterNumber({
  multiplicity: multiplicity,
  step: step,
  value: 150,
  containerSelector: "#app"
});

// ==================================================================

debug();
function debug() {
  const container = document.createElement("div");
  container.classList.add("debug");

  createBtn(`+50`, () => coNum.add(50));
  createBtn(`+20`, () => coNum.add(20));
  createBtn(`+10`, () => coNum.add(10));
  createBtn(`-10`, () => coNum.remove(10));
  createBtn(`-20`, () => coNum.remove(20));
  createBtn(`-50`, () => coNum.remove(50));
  createSplitter();
  createBtn(`Set 1240`, () => (coNum.value = 1240));
  createBtn(`Set 40`, () => (coNum.value = 40));
  createSplitter();
  createBtn(`+5`, () => coNum.add(5));
  createBtn(`Set 15`, () => coNum.add(15));

  function createSplitter() {
    const d = document.createElement("div");
    d.classList.add("debug__splitter");
    container.appendChild(d);
  }

  function createBtn(t, h) {
    const btn = document.createElement("button");
    btn.innerHTML = t;
    btn.addEventListener("click", h);
    container.appendChild(btn);
  }

  document.body.appendChild(container);
}
// })();
