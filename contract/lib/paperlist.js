/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Utility class for collections of ledger states --  a state list
const StateList = require('./../ledger-api/statelist.js');

const Insurance = require('./paper.js');

class InsuranceList extends StateList {

    constructor(ctx) {
        super(ctx, 'org.insurancenet.insurance');
        this.use(Insurance);
    }

    async addInsurrance(insurance) {
        return this.addState(insurance);
    }

    async getInsurrance(insuranceKey) {
        return this.getState(insuranceKey);
    }

    async updateInsurance(insurance) {
        return this.updateState(insurance);
    }
}


module.exports = InsuranceList;
