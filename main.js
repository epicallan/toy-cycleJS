import Rx from 'rxjs/Rx';
// Guiding principles: Push subscribes as far away as we can from our app.
// The subscribes live in the framework.

// Terminology:
// Source: Input (read) effects
// Sink: Output (write) effects

function main(sources) {
  const $clicks = sources.DOM;
  return {
    DOM: $clicks
        .startWith(null)
        .switchMap(() => Rx.Observable.timer(0, 1000)) // flatmap latest
        .map(i => `Seconds elapsed ${i}`),
    Log: Rx.Observable.timer(0, 2000).map(i => `seconds logged ${i}`)
  };
}

// DOM Drivers
function DOMDrivers(text$) {
  text$.subscribe(text => {
    const container = document.querySelector('#app');
    container.textContent = text;
  });
  // add an output from the driver (reading from the DOM)
  const DOMSource = Rx.Observable.fromEvent(document, 'click');
  return DOMSource;
}


function consoleLogDriver(msg$) {
  msg$.subscribe(msg => console.Log(msg));
}

// This down here is only meant to make the app run.
// So we will extract it into a function called run.

// Also, we will make the ability to specify the Drivers we want
// to run against our main function by creating drivers.

// Run becomes very generic.
// We don't need to hardcode anything inside run.
const effects = {
  DOM: DOMDrivers,
  Log: consoleLogDriver,
};

function run(mainFn, drivers) {
  // need to create a proxyDOMSource
  const proxySources = {};
  Object.keys(drivers).forEach(key => {
    proxySources[key] = new Rx.Subject();
  });
  const sinks = main(proxySources);
  // const sinks = main();
  Object.keys(drivers).forEach(key => {
    const source = drivers[key](sinks[key]);
    source.subscribe(click => proxySources[key].onNext(click));
  });
}

run(main, effects);
