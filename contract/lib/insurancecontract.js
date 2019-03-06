/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Fabric smart contract classes
const { Contract, Context } = require('fabric-contract-api');

// InsuranceNet specifc classes
const Insurance = require('./insurance.js');
const InsuranceList = require('./insurancelist.js');

/**
 * A custom context provides easy access to list of all insurance
 */
class InsuranceContext extends Context {

    constructor() {
        super();
        // All insurance are held in a list of insurances
        this.insuranceList = new InsuranceList(this);
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

        insurance.setOwner(owner);
        insurance.setIssuer(issuer);
        insurance.setGoodSerialNo(goodSerialNo);
        insurance.setInsuranceNo(insuranceNo);

        // Smart contract, rather than insurance, moves insurance into ISSUED state
        insurance.setIssued();

        // Add the insurance to the list of all similar insurance the ledger world state
        await ctx.insurceList.addInsurance(insurance);

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
            throw new Error('Insurance ' + issuer + insuranceNo + ' is already refunded');
        }

        // Verify that the redeemer owns the commercial paper before redeeming it
        if (paper.getOwner() === redeemingOwner) {
            paper.setOwner(paper.getIssuer());
            paper.setRedeemed();
        } else {
            throw new Error('Redeeming owner does not own paper' + issuer + paperNumber);
        }

        await ctx.insuranceList.updateInsurance(insurance);
        return insurance.toBuffer();
    }

}

module.exports = InsuranceContract;
