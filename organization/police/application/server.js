/*
SPDX-License-Identifier: Apache-2.0
*/

/*
 * This application has 6 basic steps:
 * 1. Select an identity from a wallet
 * 2. Connect to network gateway
 * 3. Access InsuranceNet network
 * 4. Initialize REST API
 * 5. Listen on frontend request
 * 6. Submit transactions
 * 7. Response to frontend
 */

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');
const Insurance = require('../../../contract/lib/insurance.js');
const express = require('express');

// A wallet stores a collection of identities for use
//const wallet = new FileSystemWallet('../user/isabella/wallet');
const wallet = new FileSystemWallet('../identity/user/jack/wallet');

// connect to network
async function connect() {

  // A gateway defines the peers used to access Fabric networks
  const gateway = new Gateway();

  // Specify userName for network access
  // const userName = 'isabella.issuer@magnetocorp.com';
  const userName = 'User2@org1.example.com';

  // Load connection profile; will be used to locate a gateway
  let connectionProfile = yaml.safeLoad(fs.readFileSync('../gateway/networkConnection.yaml', 'utf8'));

  // Set connection options; identity and wallet
  let connectionOptions = {
    identity: userName,
    wallet: wallet,
    discovery: { enabled:false, asLocalhost: true }
  };

  // Connect to gateway using application specified parameters
  console.log('Connect to Fabric gateway.');

  await gateway.connect(connectionProfile, connectionOptions);

  // Access InsuranceNet network
  console.log('Use network channel: mychannel.');

  const network = await gateway.getNetwork('mychannel');

  // Get addressability to insurance contract
  console.log('Use org.insurancenet.insurance smart contract.');

  const contract = await network.getContract('insurancecontract', 'org.insurancenet.insurance');

  return contract;

}

connect()
.then(contract => {
  var app = express();
  app.use(express.static("./frontend"));
  
  app.get('/api/report', function (req, res) {
    var owner = req.query.owner;
    var issuer = req.query.issuer;
    var goodSerialNo = req.query.good;
    var insuranceNo = req.query.insuranceNo;
    if (!owner || !goodSerialNo || !insuranceNo || !issuer) {
      res.status(400).send("invalid input");
    }

    contract.submitTransaction('report', owner, issuer, goodSerialNo, insuranceNo)
    .then(response => res.send("success"))
    .catch(err => res.status(400).send(err.message));
  });
  
  var server = app.listen(8081, () => {
    console.log("server started on %s:%s", server.address().address, server.address().port);
  });
 
})
.catch(err => {
  console.log('Failed to connect to InsuranceNet:');
  console.log(err);
  process.exit(1);
});


