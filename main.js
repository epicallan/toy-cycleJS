import Rx from 'rxjs/Rx';

// logic
function main() {
  return Rx.Observable.timer(0, 1000)
    .map(i => `seconds elapsed ${i}`);
}

// Dom effects
function DomEffects(text$) {
  text$.subscribe(text => {
    const container = document.querySelector('#app');
    container.textContent = text;
  });
}


function consoleLogEffecr(msg$) {
  msg$.subscribe(msg => console.log(msg));
}

const sinks = main(); // inputs

DomEffects(sinks);
consoleLogEffecr(sinks);
