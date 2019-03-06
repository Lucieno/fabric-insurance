/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Fabric smart contract classes
const { Contract, Context } = require('fabric-contract-api');

// InsuranceNet specifc classes
const Insurance = require('./insurance.js');
const InsuranceList = require('./insurancelist.js');
const Good = require('./good.js');
const GoodList = require('./goodlist.js');

/**
 * A custom context provides easy access to list of all insurance
 */
class InsuranceContext extends Context {

    constructor() {
        super();
        // All insurance are held in a list of insurances
        this.insuranceList = new InsuranceList(this);
        this.goodList = new GoodList(this);
    }

}

/**
 * Define insurance smart contract by extending Fabric Contract class
 *
 */
class InsuranceContract extends Contract {

    constructor() {
        // Unique namespace when multiple contracts per chaincode file
        super('org.insurancenet.insurance');
    }

    /**
     * Define a custom context for insurance 
    */
    createContext() {
        return new InsuranceContext();
    }

    /**
     * Instantiate to perform any setup of the ledger that might be required.
     * @param {Context} ctx the transaction context
     */
    async instantiate(ctx) {
        // No implementation required with this example
        // It could be where data migration is performed, if necessary
        console.log('Instantiate the contract');
    }

    /**
     * Issue Insurance
     *
     * @param {Context} ctx the transaction context
     * @param {String} owner insurce owner
     * @param {String} issuer insurce issuer
     * @param {Integer} goodSerialNo serial number of the product insured
     * @param {Integer} insuranceNo insurnce number for this insurance
    */
    async issue(ctx, owner, issuer, goodSerialNo, insuranceNo) {

        // create an instance of the insurance
        let insurance = Insurance.createInstance(owner, issuer, goodSerialNo, insuranceNo);

        // Set the member of the insurance
        insurance.setOwner(owner);
        insurance.setIssuer(issuer);
        insurance.setGoodSerialNo(goodSerialNo);
        insurance.setInsuranceNo(insuranceNo);

        // Smart contract, rather than insurance, moves insurance into ISSUED state
        insurance.setIssued();

        // Ensure the good is not refund and the contract will not reset the state
        let goodKey = Good.makeKey([goodSerialNo]);
        let retrievedGood = await ctx.goodList.getGood(goodKey);

        if (retrievedGood != null) {
            if (retrievedGood.getOwner() !== owner) {
                throw new Error('Good ' + goodSerialNo + ' does not belong to ' + owner);
            }
            if (retrievedGood.isRefunded()) {
                throw new Error('Good ' + goodSerialNo + ' has already been refunded');
            }
        }

        // Create the good
        let good = Good.createInstance(owner, goodSerialNo);

        good.setOwner(owner);
        good.setGoodSerialNo(goodSerialNo); 
        good.setInsured();

        // Add the insurance to the list of all similar insurance the ledger world state
        // and do the same to the good
        await ctx.insurceList.addInsurance(insurance);
        await ctx.goodList.addGood(good);

        // Must return a serialized insurance to caller of smart contract
        return insurance.toBuffer();
    }

    /**
     * Report to an insurance that the insured good is lost/damaged
     *
     * @param {Context} ctx the transaction context
     * @param {String} issuer commercial paper issuer
     * @param {Integer} paperNumber paper number for this issuer
     * @param {String} currentOwner current owner of paper
     * @param {String} newOwner new owner of paper
     * @param {Integer} price price paid for this paper
     * @param {String} purchaseDateTime time paper was purchased (i.e. traded)
    */
    async report(ctx, owner, issuer, goodSerialNo, insuranceNo) {

        // Retrieve the insurance using key fields provided
        let insuranceKey = Insurance.makeKey([issuer, insuranceNo]);
        let insurance = await ctx.insuranceList.getInsurance(insuranceKey);

        // Validate current owner
        if (insurance.getOwner() !== owner) {
            throw new Error('Insurace ' + issuer + insuranceNo + ' is not owned by ' + owner);
        }

        if (insurance.getGoodSerialNo() !== goodSerialNo) {
            throw new Error('Insurace ' + issuer + insuranceNo + ' does not insure ' + goodSerialNo);
        }

        // First buy moves state from ISSUED to TRADING
        if (insurance.isIssued()) {
            insurance.setReported();
        }

        // Update the insurance
        await ctx.insuranceList.updateInsurance(insurance);
        return insurance.toBuffer();
    }

    /**
     * Refund an insurance
     *
     * @param {Context} ctx the transaction context
     * @param {String} issuer insurance issuer
     * @param {Integer} paperNumber paper number for this issuer
     * @param {String} redeemingOwner redeeming owner of paper
     * @param {String} redeemDateTime time paper was redeemed
    */
    async redeem(ctx, issuer, insuranceNo) {

        // Retrieve the insurance using key fields provided
        let insuranceKey = Insurance.makeKey([issuer, insuranceNo]);
        let insurance = await ctx.insuranceList.getInsurance(insuranceKey);

        // Check insurance is not REFUNDED
        if (insurance.isRefunded()) {
            throw new Error('Insurance ' + issuer + insuranceNo + ' has already been refunded');
        }

        // Verify that the the good is not refunded
        let goodKey = Good.makeKey([goodSerialNo]);
        let good = await ctx.goodList.getGood(goodKey);

        if (good.isRefunded()) {
            throw new Error('Good ' + goodSerialNo + ' has already been refunded');
        }

        insurance.setRefunded();
        good.setRefunded();

        await ctx.insuranceList.updateInsurance(insurance);
        await ctx.goodList.goodInsurance(good);
        return insurance.toBuffer();
    }

}

module.exports = InsuranceContract;
