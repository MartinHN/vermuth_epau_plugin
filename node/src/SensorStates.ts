const maxPassTime = 3000;
class SensorState {
  constructor(public name: string) {};
  public state: boolean|undefined;
  public lastChangeActivity: number = 0;
  public lastActivity: number = 0;
  public lastPing = 0;
  public deltaT = 0;
  public setNewState(state: boolean) {
    if (state === undefined) {
      console.error('undefined state for name', this.name)
    }

    const now = new Date().getTime();
    this.lastPing = now;
    if (state) {
      this.lastActivity = now;
    }
    const hasChange = state != this.state
    if (hasChange) {
      this.deltaT = now - this.lastChangeActivity;
      this.lastChangeActivity = now;
    }
    this.state = state
    return hasChange;
  }
};

export class SensorStates {
  constructor(private sensorActivity: any, private sensorPassCB: any) {
    const pingTime = 3000
    setInterval(() => {
      const now = new Date().getTime();
      this.sensors.forEach((v, k) => {
        const deltaPing = now - v.lastPing;
        if (deltaPing > pingTime) {
          console.warn('sensor', v.name, 'not pinged since', deltaPing);
        }
      })
    }, 1.5 * pingTime);
  }
  public sensors = new Map<string, SensorState>()
  addIfInExistent(boxName: string, subName: string, value = false) {
    const name = boxName + '_' + subName
    const isReg = name in this.sensors;
    if (!isReg) {
      this.sensors[name] = new SensorState(name);
    }
    const sensor = this.sensors[name];
    const hasChange = sensor.setNewState(value);
    const nameSplit = name.split('_');
    if (!(nameSplit.length > 1)) {
      console.warn('name not splitable', name)
    }
    if (value && nameSplit.length > 1) {
      const num = parseInt(nameSplit[1]);
      const boxName = nameSplit[0];
      for (const [k, v] of Object.entries(this.sensors)) {
        if ((v.name !== name) && v.name.startsWith(boxName + '_') &&
            (sensor.lastActivity - v.lastActivity) < maxPassTime) {
          const oldNum = parseInt(v.name.split('_')[1]);
          if (this.sensorPassCB) {
            this.sensorPassCB(boxName, num, oldNum)
          }
        }
      }
    }

    this.updateState(name, hasChange);
  }
  keepAlive(name: string) {
    this.sensors.forEach((v, k) => {
      if (k.startsWith(name + '_')) {
        v.lastPing = new Date().getTime();
      }
    })
  }
  updateState(name: string, hasChange: boolean) {
    if (this.sensorActivity) {
      this.sensorActivity(name, hasChange, this.sensors[name]);
    }
  }
}
