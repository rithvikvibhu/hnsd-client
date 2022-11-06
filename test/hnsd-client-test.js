const assert = require('bsert');
const HnsdClient = require('../lib/hnsd');


describe('Hnsd Client', function () {

  /** @type {HnsdClient} */
  let client;

  it('should create client', async () => {
    client = new HnsdClient({
      port: 9591,
    });
    await client.open();
  });

  it('should get all info', async () => {
    const all = await client.getAll();
    assert(all);
    assert(all.chain);
    assert(all.pool);
  });

  it('should get chain info', async () => {
    const chain = await client.getChain();
    assert(chain);
    assert(chain.tip);
    assert(chain.tip.hash);
    assert(chain.tip.height);
    assert(chain.tip.time);
    assert(chain.synced);
    assert(chain.progress);
  });

  it('should get pool info', async () => {
    const pool = await client.getPool();
    assert(pool);
    assert(pool.size);
    assert(pool.peers);
  });

  it('should get peers', async () => {
    const peers = await client.getPeers();
    assert(peers);
    assert(Array.isArray(peers));

    peers.forEach(peer => {
      assert(peer.host);
      assert(typeof peer.agent === 'string'); // may be empty string
    })
  });
});