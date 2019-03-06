/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Utility class for ledger state
const State = require('./../ledger-api/state.js');

// Enumerate commercial insurance state values
const insuranceState = {
    ISSUED: 1,
    REPORTED: 2,
    REFUNDED: 3
};

/**
 * Insurance class extends State class
 * Class will be used by application and smart contract to define an insurance
 */
class Insurance extends State {

    constructor(owner, issuer, goodSerialNo, insuranceNo) {
        super(Insurance.getClass(), [owner, issuer, goodSerialNo, insuranceNo]);
        Object.assign(this, obj);
        setOwner(owner);
        setIssuer(issuer);
        setGoodSerialNo(goodSerialNo);
        setInsuranceNo(insuranceNo);
        setIssued();
    }

    /**
     * Basic getters and setters
    */
    getIssuer() { return this.issuer; }
    setIssuer(newIssuer) { this.issuer = newIssuer; }

    getOwner() { return this.owner; }
    setOwner(newOwner) { this.owner = newOwner; }

    getGoodSerialNo() { return this.GoodSerialNo; }
    setGoodSerialNo(x) { return this.GoodSerialNo = x; }

    getInsuranceNo() { return this.getInsuranceNo; }
    setInsuranceNo(x) { return this.getInsuranceNo = x; }

    getInsuranceNo() { return this.getInsuranceNo; }
    setInsuranceNo(x) { return this.getInsuranceNo = x; }

    /**
     * Useful methods to encapsulate commercial insurance states */ 
    setIssued() { this.currentState = insuranceState.ISSUED; }

    setReported() { this.currentState = insuranceState.REPORTED; }

    setRefunded() { this.currentState = insuranceState.REFUNDED; }

    isIssued() { return this.currentState === insuranceState.ISSUED; }

    isReported() { return this.currentState === insuranceState.REPORTED; }

    isRefunded() { return this.currentState === insuranceState.REFUNDED; }

    static fromBuffer(buffer) {
        return this.deserialize(Buffer.from(JSON.parse(buffer)));
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    /**
     * Deserialize a state data to commercial insurance
     * @param {Buffer} data to form back into the object
     */
    static deserialize(data) {
        let json = JSON.parse(data.toString());
        let objClass = Insurance[json.class];
        if (!objClass) {
            throw new Error(`Unknown class of ${json.class}`);
        }
        let object = new (objClass)(json);

        return object;
    }

    /**
     * Factory method to create a commercial insurance object
     */
    static createInstance(owner, issuer, goodSerialNo, insuranceNo) {
        return new Insurance({ owner, issuer, goodSerialNo, insuranceNo });
    }

    static getClass() {
        return 'org.insurancenet.insurance';
    }
}

module.exports = Insurance;
