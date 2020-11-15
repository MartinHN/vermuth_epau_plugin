const defaultTimeout = 3000;
const intTime = 1000;


class Zone {
  public activity = 0;
  public activateTime = 0;
  
  constructor(public fixtures: Array<string>,public timesFadeIn?: Array<number>,public timeout = defaultTimeout ) {
  }

  activate() {
    this.activateTime = new Date().getTime();
    this.activity = 1;
  }

  reversed() {
    const fs = this.fixtures.slice().reverse();
    const reversedTimes = this.timesFadeIn?.slice().reverse();
    return new Zone(fs, reversedTimes,this.timeout)
  }
};


const zones = {
  upTunnel: new Zone(['9', '16', '15', '13', '14']),
  lowTunnel: new Zone(['9', '12', '11', '10']),
  centre: new Zone(['8', '7', '17']),
  est: new Zone(['17', '18']),
  estAndEntree: new Zone(['17', '18','22']),
  nordeste: new Zone(['22', '21', '20', '19']),
  entreesud: new Zone(['1', '2', '3']),
  sudsud: new Zone(['3', '4', '5', '6']),
  centresud: new Zone(['6', '7', '17', '8'])
}

export const zonesMap: {[id: string]: Zone} = {
  // tunnelWestHaut
  0_0: zones.upTunnel,
  0_1: new Zone([]), 

  // tunnelWestBas
  1_0: new Zone([]),
  1_1: zones.lowTunnel,

  // tunnelCentreHaut
  2_0: zones.upTunnel.reversed(),  // new Zone(['1', '2']),
  2_1: zones.centre,

  // tunnelCentreBas
  3_0: zones.centre,
  3_1: zones.lowTunnel.reversed(),

  // chassisCentreHaut
  4_0: zones.centre,
  4_1: zones.est,

  // chassisCentreBas
  5_0: zones.centre,
  5_1: zones.est,

  // chassisEstHaut
  6_0: zones.nordeste,
  6_1: zones.est,

  // chassisEstBas
  7_0: zones.est,
  7_1: new Zone([]),

  // entreeHaut
  8_0: zones.estAndEntree,  // add 22 in index
  8_1: new Zone([]),

  // entreeBas
  9_0: new Zone([]),
  9_1: zones.entreesud,

  // archeSudSud
  A_0: zones.entreesud,
  A_1: zones.sudsud,

  // archeSudWest
  B_0: zones.sudsud,
  B_1: zones.centresud,

  // chassisCenterSud
  C_0: zones.sudsud,
  C_1: zones.centresud,

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

// chiecks inactivity
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

export function getAllFixtures(){
  const fs = new Set<string>();
 Object.values(zones).map(z=>{
   Object.values(z.fixtures).map(ee=>fs.add(ee))
  })
 return Array.from(fs)
}
