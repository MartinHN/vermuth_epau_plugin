
import {OSCServerModule} from './OSCServerModule'
import {SensorStates} from './SensorStates'
import {VermuthAdapter} from './VermuthAdapter'
import {activateZone, setZoneChangeCB, zonesMap} from './zones';

const fadeoutTime = 5000

export const sensorServer = new OSCServerModule(processMsg);
export const vermuthSender = new VermuthAdapter();
const sStates = new SensorStates(sensorActivity, passCB)

for (const [k, v] of Object.entries(zonesMap)) {
  const fs = v.fixtures.slice()
  if (k == 'entreeHaut_0') {
    fs.push('22');
  }
  vermuthSender.addNamedChase(k, fs)
}

setZoneChangeCB((name, z) => {
  if (z.activity == 0) {
    vermuthSender.fadeFixturesTo(z.fixtures, 0, fadeoutTime);
  }
})
function sensorActivity(name: string, hasChange: boolean, v) {
  console.log(hasChange ? 'change' : 'update', name);

  if (v.state) {
    playSound(name.endsWith('0'));
    activateZone(name);
  }
}

function passCB(name: string, num: number, oldNum: number) {
  console.log('pass', name, num, oldNum);
  const fullName = name + '_' + num;
  const z = zonesMap[fullName];
  if (!z) {
    console.warn('unknown zone');
  }
  console.log(z.activity);
  if (z && z.activity <= 0) {
    vermuthSender.startChase(fullName);
  }
  // vermuthSender.setFixture(num)
}

function updateLight() {}

export function init() {
  sensorServer.connect(OSCServerModule.getMulticastIp(), 4000);
  vermuthSender.init()
  console.log('module initialized !!!!!!!!!!!!!!!!!!')
}



export function processMsg(msg: any, time: any, info: any) {
  if (msg.address.startsWith('/sense') && msg.args.length > 2) {
    console.log('sense', msg.args)
    sStates.addIfInExistent(msg.args[0], '' + msg.args[1], msg.args[2])
  } else if (msg.address.startsWith('/ping') && msg.args.length >= 2) {
    sStates.keepAlive(msg.args[0])
  } else {
    console.warn('module recieved ', msg, info)
  }
}



///////////////////////
// debug
var player = require('play-sound')({})
function playSound(state: boolean) {
  const soundName = (state ? 'snareCut' : 'snareCutHigh')
  console.log('play sound', soundName)

  player.play(
      '/home/tinmar/Documents/Sounds/' + soundName + '.wav', function(err) {
        if (err) console.error('sound error', err)
      })
}