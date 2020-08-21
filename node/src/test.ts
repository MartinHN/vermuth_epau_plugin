import * as mod from './index';

mod.init()


const timeL = 1000

function test() {
  mod.vermuthSender.startChase('test', timeL - 10, 1);
}



mod.vermuthSender.addNamedChase('test', ['1'])
test()
setInterval(test, timeL);