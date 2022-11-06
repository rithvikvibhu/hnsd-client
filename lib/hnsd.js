const assert = require('bsert');
const { StubResolver, wire } = require('bns');
const { writeToObj, castValueByName } = require('./util');


class HnsdClient {
  constructor(options) {
    this.host = '127.0.0.1';
    this.port = 5349;

    if (options) {
      this.initOptions(options);
    }

    this.resolver = new StubResolver();
    this.resolver.setServers([`${this.host}:${this.port}`]);
  }

  initOptions(options) {
    if (options.host != null) {
      assert(typeof options.host === 'string');
      this.host = options.host;
    }

    if (options.port != null) {
      assert(typeof options.port === 'number');
      assert(options.port >>> 0 === options.port);
      this.port = options.port;
    }
  }

  async open() {
    await this.resolver.open();
  }

  /**
   * Query hesiod and parse answer
   * @param {string} name
   * @returns {object}
   */
  async query(name) {
    assert(name);
    const qs = wire.Question.fromJSON({
      name,
      class: 'HS',
      type: 'TXT',
    });
    const { answer } = await this.resolver.resolve(qs);
    assert(answer && answer.length);
    return this.parseAnswer(answer);
  }

  /**
   * Parse BNS Answer message to an object
   * @param {import('bns/lib/wire').Message} answer
   * @returns {object}
   */
  parseAnswer(answer) {
    assert(Array.isArray(answer));

    let res = {};

    for (const item of answer) {
      const name = item.name;
      const value = item.data.txt.join('');

      const path = name
        .split('.')                                       // split into array
        .filter(x => !!x)                                 // remove empty str
        .map(x => isNaN(parseInt(x)) ? x : parseInt(x))   // try  int for arr
        .reverse();                                       // reverse path

      const castedValue = castValueByName(value, name);
      writeToObj(res, path, castedValue);
    }

    if (res.hnsd) {
      res = res.hnsd;
    }

    // Remove empty peers (since peer id is used as index)
    if (res?.pool?.peers) {
      res.pool.peers = res.pool.peers.filter(peer => peer.host);
    }

    return res;
  }

  async getAll() {
    const res = await this.query('hnsd.');
    return res;
  }

  async getChain() {
    const res = await this.query('chain.hnsd.');
    const { chain } = res;
    assert(chain && typeof chain === 'object')
    return chain;
  }

  async getPool() {
    const res = await this.query('pool.hnsd.');
    const { pool } = res;
    assert(pool && typeof pool === 'object')
    return pool;
  }

  async getPeers() {
    const res = await this.query('peers.pool.hnsd.');
    const { peers } = res?.pool || {};
    assert(peers && Array.isArray(peers))
    return peers;
  }
}


module.exports = HnsdClient;
