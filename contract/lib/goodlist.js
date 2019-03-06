/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Utility class for collections of ledger states --  a state list
const StateList = require('./../ledger-api/statelist.js');

const Good = require('./good.js');

class GoodList extends StateList {

    constructor(ctx) {
        super(ctx, 'org.insurancenet.good');
        this.use(Good);
    }

    async addGood(good) {
        return this.addState(good);
    }

    async getGood(goodKey) {
        return this.getState(goodKey);
    }

    async updateGood(good) {
        return this.updateState(good);
    }
}


module.exports = GoodList;
