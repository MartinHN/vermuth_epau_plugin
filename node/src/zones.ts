const defaultTimeout = 3000;
const intTime = 1000;


class Zone {
  public activity = 0;
  public activateTime = 0
  constructor(public fixtures: Array<string>, public timeout = defaultTimeout) {
  }
  activate() {
    this.activateTime = new Date().getTime();
    this.activity = 1;
  }

  reversed() {
    const fs = this.fixtures.slice().reverse()
    return new Zone(fs, this.timeout)
  }
};


const zones = {
  upTunnel: new Zone(['9', '16', '15', '13', '14']),
  lowTunnel: new Zone(['9', '12', '11', '10']),
  centre: new Zone(['8', '7', '17']),
  est: new Zone(['17', '18']),
  nordeste: new Zone(['22', '21', '20', '19']),
  entreesud: new Zone(['1', '2', '3']),
  sudsud: new Zone(['3', '4', '5', '6']),
  centresud: new Zone(['6', '7', '17', '8'])
}

export const zonesMap: {[id: string]: Zone} = {
  tunnelWestHaut_0: zones.upTunnel,
  tunnelWestHaut_1: new Zone([]),

  tunnelWestBas_0: new Zone([]),
  tunnelWestBas_1: zones.lowTunnel,

  tunnelCentreHaut_0: zones.upTunnel.reversed(),  // new Zone(['1', '2']),
  tunnelCentreHaut_1: zones.centre,

  tunnelCentreBas_0: zones.centre,
  tunnelCentreBas_1: zones.lowTunnel.reversed(),

  chassisCentreHaut_0: zones.centre,
  chassisCentreHaut_1: zones.est,

  chassisCentreBas_0: zones.centre,
  chassisCentreBas_1: zones.est,

  chassisEstHaut_0: zones.nordeste,
  chassisEstHaut_1: zones.est,

  chassisEstBas_0: zones.est,
  chassisEstBas_1: new Zone([]),

  entreeHaut_0: zones.est,  // add 22 in index
  entreeHaut_1: new Zone([]),

  entreeBas_0: new Zone([]),
  entreeBas_1: zones.entreesud,

  archeSudSud_0: zones.entreesud,
  archeSudSud_1: zones.sudsud,

  archeSudWest_0: zones.sudsud,
  archeSudWest_1: zones.centresud,

  chassisCenterSud_0: zones.sudsud,
  chassisCenterSud_1: zones.centresud,

};



export function getFixturesForZone(name: string) {
  return hasZone(name) ? zonesMap[name].fixtures : []
}

export function activateZone(name: string) {
  const z = zonesMap[name];

  if (z) {
    const shouldNotify = z.activity !== 1;
    z.activate();
    if (shouldNotify) {
      notifyZoneChange(name)
    }
  } else {
    console.error('unknown zone', name)
  }
}


export function getFixtureValues() {
  const fs = {};
  for (const z of Object.values(zonesMap)) {
    for (const f of Object.values(z.fixtures)) {
      if (!(f in fs)) {
        fs[f] = 0;
      }
      fs[f] += z.activity
      fs[f] = Math.max(0, Math.min(1, fs[f]));
    }
  }
  return fs;
}

export function hasZone(name: string) {
  return name in zonesMap
}
export function isZoneInactive(name: string) {
  return (hasZone(name)) ? zonesMap[name].activity == 0 : true;
}


setInterval(() => {
  const now = new Date().getTime()
  for (const [k, v] of Object.entries(zonesMap)) {
    if (v.activity > 0 && ((now - v.activateTime) > v.timeout)) {
      console.log('deactivating zone ', k)
      v.activity = 0
      notifyZoneChange(k)
    }
  };
}, intTime)

let zoneChangeCB: (n: string, z: Zone) => any;

export function setZoneChangeCB(cb: (n: string, z: Zone) => any) {
  zoneChangeCB = cb;
}
function notifyZoneChange(name: string) {
  if (zoneChangeCB) {
    zoneChangeCB(name, zonesMap[name])
  }
}