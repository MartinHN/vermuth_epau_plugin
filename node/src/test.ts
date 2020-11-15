import * as mod from './index';

mod.init()

mod.sensorServer.disconnect();


const timeL = 4000
let v = 0;
function test() {
  // mod.vermuthSender.startChase('entreeHaut_0', timeL - 10, 1);
  // mod.vermuthSender.startChase('entreeHaut_1', timeL - 10, 1);
  setSensor('entreeHaut', 0, v);
  v = v ? 0 : 1;
  setSensor('entreeHaut', 1, v);

  // entreeHaut_0
}


function setSensor(name: string, subSensor: number, value: number) {
  mod.processMsg(
      {address: '/sense', args: [name, subSensor, value]}, null, null)
}


// mod.vermuthSender.addNamedChase('test', ['1'])
test()
setInterval(test, timeL);
