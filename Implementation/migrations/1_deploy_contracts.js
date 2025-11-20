
var CollectionConsent = artifacts.require("CollectionConsent");
var ProcessingConsent = artifacts.require("ProcessingConsent");

module.exports = function(deployer, network, accounts) {
	// No deployment needed - tests will deploy their own instances
	// This migration file exists to satisfy Truffle requirements
	console.log("Contracts compiled successfully. Tests will deploy their own instances.");
}
