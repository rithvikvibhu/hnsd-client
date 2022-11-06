# hnsd-client

A js client for use with hnsd's DNS API. Depends on https://github.com/handshake-org/hnsd/pull/102.

## Usage

Add package with

```sh
npm install https://github.com/rithvikvibhu/hnsd-client
```

Then use it like:

```js
const { HnsdClient } = require('hnsd-client');

// Create a client instance
const client = new HnsdClient({
  host: '127.0.0.1',
  port: 5349,
});
await client.open();

// Query for info
const chain = await client.getChain(); // {tip: {...}, synced, progress}
const peers = await client.getPeers(); // [{host, agent}, ...]
```
