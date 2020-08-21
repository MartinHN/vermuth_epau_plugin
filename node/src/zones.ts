const defaultTimeout = 0.1;
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

}

export const zonesMap: {[id: string]: Zone} = {
  tunnelWestHaut_0: zones.upTunnel,
  tunnelWestHaut_1: new Zone([]),

  tunnelWestBas_0: new Zone([]),
  tunnelWestBas_1: new Zone(['9', '12', '11', '10']),

  tunnelCentreHaut_0: zones.upTunnel.reversed(),  // new Zone(['1', '2']),
  tunnelCentreHaut_1: new Zone(['3', '4']),

  tunnelCentreBas_0: new Zone(['1', '2']),
  tunnelCentreBas_1: new Zone(['3', '4']),

  chassisCentreHaut_0: new Zone(['1', '2']),
  chassisCentreHaut_1: new Zone(['3', '4']),

  chassisCentreBas_0: new Zone(['1', '2']),
  chassisCentreBas_1: new Zone(['3', '4']),

  chassisEstHaut_0: new Zone(['1', '2']),
  chassisEstHaut_1: new Zone(['3', '4']),

  chassisEstBas_0: new Zone(['1', '2']),
  chassisEstBas_1: new Zone(['3', '4']),

  entreeHaut_0: new Zone(['1', '2']),
  entreeHaut_1: new Zone(['3', '4']),

  entreeBas_0: new Zone(['1', '2']),
  entreeBas_1: new Zone(['3', '4']),

  archeSudSud_0: new Zone(['1', '2']),
  archeSudSud_1: new Zone(['3', '4']),

  archeSudWest_0: new Zone(['1', '2']),
  archeSudWest_1: new Zone(['3', '4']),

  chassisCenterSud_0: new Zone(['1', '2']),
  chassisCenterSud_1: new Zone(['3', '4']),

};



export function getFixturesForZone(name: string) {
  return hasZone(name) ? zonesMap[name].fixtures : []
}

export function activateZone(name: string) {
  const z = zonesMap[name];
  if (z && z.activity !== 1) {
    z.activate();
    notifyZoneChange(name)
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
    if (v.activity > 0 && (now - v.activateTime) > v.timeout) {
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