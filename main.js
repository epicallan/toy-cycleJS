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
        .map(i => (
          {
            tagName: 'H1',
            children: [
              {
                tagName: 'span',
                children: [
                  `Seconds elapsed ${i}`
                ]
              }
            ]
          }
        )),
    Log: Rx.Observable.timer(0, 2000).map(i => `seconds logged ${i}`)
  };
}

// Effects (imperative)

// Change DOMDriver to create HTML elements.

function DOMDrivers(obj$) {
  function createElement(obj) {
    const element = document.createElement(obj.tagName);
    obj.children
     .filter(c => typeof c === 'object')
     .map(createElement)
     .forEach(c => element.appendChild(c));

    obj.children
     .filter(c => typeof c === 'string')
     .forEach(c => element.innerHTML += c);
    return element;
  }

  obj$.subscribe(obj => {
    const container = document.querySelector('#app');
    container.innerHTML = '';
    const element = createElement(obj);
    container.appendChild(element);
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
