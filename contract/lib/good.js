/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Utility class for ledger state
const State = require('./../ledger-api/state.js');

// Enumerate good state values
const goodState = {
    INSURED: 1,
    REFUNDED: 2,
};

/**
 * Good class extends State class
 * Class will be used by application and smart contract to define a good
 */
class Good extends State {

    constructor(obj) {
        super(Good.getClass(), [obj.goodSerialNo]);
        Object.assign(this, obj);
    }

    /**
     * Basic getters and setters
    */
    getOwner() { return this.owner; }
    setOwner(newOwner) { this.owner = newOwner; }

    getGoodSerialNo() { return this.GoodSerialNo; }
    setGoodSerialNo(x) { return this.GoodSerialNo = x; }

    /**
     * Useful methods to encapsulate good states */ 
    setInsured() { this.currentState = goodState.INSURED; }
    isInsured() { return this.currentState === goodState.INSURED; }

    setRefunded() { this.currentState = goodState.REFUNDED; }
    isRefunded() { return this.currentState === goodState.REFUNDED; }

    static fromBuffer(buffer) {
        return Good.deserialize(Buffer.from(JSON.parse(buffer)));
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    /**
     * Deserialize a state data to good
     * @param {Buffer} data to form back into the object
     */
    static deserialize(data) {
        return State.deserializeClass(data, Good);
    }

    /**
     * Factory method to create a good object
     */
    static createInstance(owner, goodSerialNo) {
        return new Good({ owner, goodSerialNo });
    }

    static getClass() {
        return 'org.insurancenet.good';
    }
}

module.exports = Good;
