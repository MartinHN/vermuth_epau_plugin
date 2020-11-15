import {OSCServerModule} from './OSCServerModule'
import {doTimer, stopTimer} from './TimeUtils'

const defaultRes = 10
const defaultRampUp = 3000
class Chase {
  private timeSteps = new Array<number>();
  
  private stepIdx = -1;
  private length = 0;
  private rampUp = 0;
  constructor(public name, public fnames: string[],private cb: any,private fixtureVals: {[id:string]:number} ) {}
  start(length: number|number[], rampUp: number,fixtureVals:{[id:string]:number}) {
    this.stop();
    this.length = 0;
    this.rampUp = rampUp;
    this.timeSteps = new Array<number>();
    this.fixtureVals = fixtureVals;
    if(Array.isArray(length)){
      this.timeSteps = length.slice();
      var totalLength=0;
       length.forEach(e => {
        totalLength+=e
      });
      length = totalLength;
    }
    else{
      this.timeSteps = this.fnames.map(f=>(length as number)/this.fnames.length); 
    }
    this.length = length + rampUp
    this.isRunning = true;

    doTimer(this.name, this.length, this.deltaT, this.doStep.bind(this), () => {
      this.isRunning = false;
    })
  }

  stop() {
    this.length = 0;
    this.stepIdx = -1;
    stopTimer(this.name);
  }

  doStep(steps, count) {
    const pct = count / steps
    const time = pct*this.length;
    let running = 0;
    let curIdx = -1
    for( const t of this.timeSteps){
      if(time>running){
        curIdx++;
      }
      else{
        break
      }
      running+=t;
    }

    for(let i = this.stepIdx+1 ; i <= curIdx ; i++){
      const fname = this.fnames[i]
      const fStart = this.fixtureVals[fname] ||0;
      doTimer(this.fnames[i],this.rampUp,this.deltaT,(steps,count)=>{
        const w = count/steps;
        if( w <= 1){
        this.cb(fname,fStart + (1-fStart)*w);
        }
      });
    }
    this.stepIdx = curIdx;
    // for( const i in this.timeSteps){
    //  const  ts = this.timeSteps[i];
    //  const fStart = this.fromVal[i];
    //  const fname = this.fnames[i]
    //  if(time > running){
    //    const w = (time - running)/this.rampUp;
    //    if( w <= 1){
    //    this.cb(fname,fStart + (1-fStart)*w);
    //    }
    //  }
    //   running+=ts;
    // }
  }

  distClampedRight(a, b) {
    return Math.max(0, (b - a));
  }

  distLinear(a, b) {
    return Math.sqrt((a - b) * (a - b));
  }

  timeout: any;
  public deltaT = defaultRes;
  public spread = 1;
  public fpos = new Array<number>();
  public flength = 0;
  public isRunning = false;
}


export class VermuthAdapter {
  private oscSender: any = new OSCServerModule();

  private chases = new Map<string, Chase>();
  public fixturesVals:{[id:string] : number} = {};

  init() {
    this.oscSender.connect('localhost', 11000)
  }



  valToDim(v: number){
    return v**3
  }
  setFixtureVal(n: string, v: number) {
    // console.log('fixture', n, v);
    this.fixturesVals[n] = v;
    
    this.oscSender.send('/fixture', [''+n, this.valToDim(v)]);
  }



  startChase(name: string, l = 4000, rampUp = defaultRampUp) {
    const ch = this.chases[name];
    if (ch) {
      if (ch.isRunning) {
        console.warn('restarting chase')
      }
      console.log('starting chase')
      // for(const f of ch.fnames){
      //   stopTimer(f);
      // }
      ch.start(l, rampUp,this.fixturesVals);
    } else {
      console.error('no chase named')
    }
  }

  isChaseRunning(name: string) {
    return this.chases[name]?.isRunning;
  }

  fadeFixturesTo(fs: string[], v: number, time: number) {
    // fs.map(f=>Object.values(this.chases).map(ch=>{
    //   if(ch.isRunning && Object.values(ch.fnames).includes(f)){
    //     ch.stop();
    //     console.log('deactivating running chase : ', ch.name)
    //   }
    // }))
    for(const f of Object.values(fs)){
      const origV = this.fixturesVals[f] || 0;
      const diff = v-origV;
      // console.log('start manual fade for ',f,origV,diff)
      doTimer(f,time,defaultRes,(steps,count)=>{
        const fadeV = origV + diff*count/steps
        this.setFixtureVal(f,fadeV);
      })
    }

  }

  addNamedChase(name: string, fs: string[],times?:Array<number>) {
    this.chases[name] = new Chase(name, fs,this.setFixtureVal.bind(this),this.fixturesVals)
  }
}
