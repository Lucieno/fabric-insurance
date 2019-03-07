/*
SPDX-License-Identifier: Apache-2.0
*/

/*
 * This application has 6 basic steps:
 * 1. Select an identity from a wallet
 * 2. Connect to network gateway
 * 3. Access InsuranceNet network
 * 4. Construct request to report
 * 5. Submit transaction
 * 6. Process response
 */

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');
const Insurance = require('../../../contract/lib/insurance.js');

// A wallet stores a collection of identities for use
//const wallet = new FileSystemWallet('../user/isabella/wallet');
const wallet = new FileSystemWallet('../identity/user/tom/wallet');

// Main program function
async function main() {

  // A gateway defines the peers used to access Fabric networks
  const gateway = new Gateway();

  // Main try/catch block
  try {

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

    // report to an insurance
    console.log('Submit report transaction.');

    const reportResponse = await contract.submitTransaction('report', 'Oscar', 'SmartInsurace', '121214', '000001');

    // process response
    console.log('Process report transaction response.');

    let insurance = Insurance.fromBuffer(reportResponse);

    console.log(`successfully reported to the insurance ${insurance.insuranceNo} for ${insurance.owner} and his ${insurance.goodSerialNo}`);
    console.log('Transaction complete.');

  } catch (error) {

    console.log(`Error processing transaction. ${error}`);
    console.log(error.stack);

  } finally {

    // Disconnect from the gateway
    console.log('Disconnect from Fabric gateway.')
    gateway.disconnect();

  }
}
main().then(() => {

  console.log('Report program complete.');

}).catch((e) => {

  console.log('Report program exception.');
  console.log(e);
  console.log(e.stack);
  process.exit(-1);

});
