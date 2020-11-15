const getIPAddresses = () => {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  const ipAddresses = new Array<string>();

  for (const deviceName of Object.keys(interfaces)) {
    const addresses = interfaces[deviceName];
    for (const addressInfo of addresses) {
      if (addressInfo.family === 'IPv4' && !addressInfo.internal) {
        ipAddresses.push(addressInfo.address);
      }
    }
  }

  return ipAddresses;
};

const osc = require('osc');

export class OSCServerModule {
  public udpPort: any;
  private timeout: any;
  private disconnected = false;
  constructor(private msgCb: any = undefined) {}
  static getMulticastIp() {
    return '230.1.1.1'
  }
  public connect(ip: string, port: number) {
    let multicast = false;
    if (ip.startsWith('230')) {
      multicast = true;
    }

    const localIp = '0.0.0.0';

    const membership = multicast ?
        getIPAddresses().map(intIp => {
          return {
            address: ip, interface: intIp
          }
        }) :
        undefined  //[{address: ip, interface: localIp}] : undefined
    console.log(membership)
    
    const udpPort = new osc.UDPPort({
      localAddress: localIp,  // broadcast//0.0.0.0",
      localPort: this.msgCb ? port : undefined,
      multicast,
      multicastMembership: membership,
      remoteAddress: ip,
      remotePort: this.msgCb ? undefined : port
    });
    console.log(`listening on ${ip} : ${port}`);
    this.udpPort = udpPort;
    udpPort.on('ready', () => {
      clearTimeout(udpPort.timeout)
      const ipAddresses = getIPAddresses();
      console.log('Listening for OSC over UDP.');
      ipAddresses.forEach((address) => {
        console.log(' Host:', address + ', Port:', udpPort.options.localPort);
      });
      console.log('SendingTo');

      console.log(
          ' Host:', udpPort.options.remoteAddress + ', Port:',
          udpPort.options.remotePort);
    });
    udpPort.on('bundle', this.processBundle.bind(this));
    udpPort.on('message', this.processMsg.bind(this));

    udpPort.on('error', (err: any) => {
      console.error('OSC Module connection error', err);
      this.defferReconnect(udpPort)
    });
    
    this.tryReConnect(udpPort)
  }

  disconnect(){
    if(this.udpPort){
      console.error("disconnect",this.udpPort);
      clearTimeout(this.udpPort.timeout);
      this.disconnected = true;
    }
    else{
      console.error("can't disconnect");
    }
  }
  defferReconnect(port: any) {
    if(this.disconnected){
      return;
    }
    clearTimeout(port.timeout)
    port.timeout = setTimeout(this.tryReConnect.bind(this, port), 1000);
  }
  tryReConnect(port: any) {
    if (port.isConnected) {
      clearTimeout(this.timeout)
      return;
    }
    console.warn('try connect',port.options)
    try {
      port.open();
    } catch {
      console.error('can\'t connect to ', port.localAddress, port.localPort)
    }
    if(this.msgCb){
    this.defferReconnect(port)
  }
  }
  public processMsg(msg: any, time: any, info: any) {
    if (this.msgCb) {
      this.msgCb(msg, time, info);
    }
  }

  public processBundle(b: any, time: any, info: any) {
    for (const i of Object.keys(b.packets)) {
      const p = b.packets[i];
      if (p.packets) {
        this.processBundle(p, time, info);
      } else {
        this.processMsg(p, time, info);
      }
    }
  }

  public send(address: string, args: any[]) {
    this.udpPort.send({address, args})
  }
}
