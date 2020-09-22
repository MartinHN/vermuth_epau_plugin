import {OSCServerModule} from './OSCServerModule'
import {doTimer, stopTimer} from './TimeUtils'


class Chase {
  constructor(public name, public fnames: string[], private cb: any) {}
  start(length: number, spread: number) {
    this.stop();
    this.spread = spread;
    this.fpos = [];
    let pos = spread;
    this.flength = 2 * spread + (this.fnames.length - 1);
    this.isRunning = true;
    for (let i = 0; i < this.fnames.length; i++) {
      this.fpos.push(pos);
      pos += 1;
    }
    doTimer(this.name, length, this.deltaT, this.doStep.bind(this), () => {
      this.isRunning = false;
    })
  }

  stop() {
    stopTimer(this.name);
  }

  doStep(steps, count) {
    // console.log(steps, count)
    const pct = count / steps
    const pctF = pct * this.flength;
    for (let i = 0; i < this.fnames.length; i++) {
      const n = this.fnames[i];
      const p = this.fpos[i];
      let d = this.distClampedRight(pctF, p);
      const w = Math.max(0, 1 - (d / this.spread));
      // console.log(w);
      this.cb(n, w);
    }
  }

  distClampedRight(a, b) {
    return Math.max(0, (b - a));
  }

  distLinear(a, b) {
    return Math.sqrt((a - b) * (a - b));
  }

  timeout: any;
  public deltaT = 10;
  public spread = 1;
  public fpos = new Array<number>();
  public flength = 0;
  public isRunning = false;
}


export class VermuthAdapter {
  private oscSender: any = new OSCServerModule();

  private chases = new Map<string, Chase>()
  init() {
    this.oscSender.connect('localhost', 11000)
  }

  setFixture(val: number) {
    // this.oscSender.send('/fixture', ['test', val])
    this.oscSender.send(
        '/sequencePlayer/goToSequenceNamed', !val ? 'Left' : 'Right')
  }

  setFixtureVal(n: string, v: number) {
    // console.log('fixture', n, v);
    this.oscSender.send('/fixture', [n, v]);
  }

  startChase(name: string, l = 4000, s = 4) {
    const ch = this.chases[name];
    if (ch) {
      if (ch.isRunning) {
        console.warn('restarting chase')
      }
      console.log('starting chase')
      ch.start(l, s);
    } else {
      console.error('no chase named')
    }
  }

  isChaseRunning(name: string) {
    return this.chases[name]?.isRunning;
  }

  fadeFixturesTo(fs: string[], v: number, time: number) {}

  addNamedChase(name: string, fs: string[]) {
    this.chases[name] = new Chase(name, fs, this.setFixtureVal.bind(this))
  }
}