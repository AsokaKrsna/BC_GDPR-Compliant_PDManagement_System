/**
 * Phase 2: Evaluation - Suite 2.9
 * Test: Scalability Microbenchmark (Consent Creation & Granting)
 *
 * Goal:
 *  - Provide simple, repeatable numbers for your report about:
 *      * Gas usage per consent creation
 *      * Rough time to create and grant many consents
 *  - This is not a full performance study, but a microbenchmark
 *    you can run and copy console output from.
 */

const CollectionConsent = artifacts.require("CollectionConsent");

contract("Phase 2.9: Scalability Microbenchmark", accounts => {
  const dataSubject = accounts[0];
  const dataController = accounts[1];
  const dataProcessor = accounts[2];

  const NUM_CONSENTS = 20; // adjust to 50/100 if Ganache and gas allow

  describe("Test 2.9.1: Batch Consent Creation & Granting", () => {
    it("Should deploy and grant multiple consents and log metrics", async () => {
      console.log("\n🧪 Test 2.9.1: Batch Consent Creation & Granting");
      console.log("=".repeat(70));
      console.log(`Creating and granting ${NUM_CONSENTS} consents...`);

      const deployments = [];
      const gasUsageCreate = [];
      const gasUsageGrantDS = [];
      const gasUsageGrantDC = [];

      const startTime = Date.now();

      for (let i = 0; i < NUM_CONSENTS; i++) {
        // 1) Create consent
        const createTx = await CollectionConsent.new(
          dataController,
          [dataProcessor],
          0xffff,
          86400, // 1 day
          [0, 1],
          { from: dataSubject }
        );

        const createReceipt = await web3.eth.getTransactionReceipt(createTx.transactionHash);
        gasUsageCreate.push(createReceipt.gasUsed);

        // 2) Grant by DS
        const grantDsTx = await createTx.grantConsent({ from: dataSubject });
        const grantDsReceipt = await web3.eth.getTransactionReceipt(grantDsTx.tx);
        gasUsageGrantDS.push(grantDsReceipt.gasUsed);

        // 3) Grant by DC
        const grantDcTx = await createTx.grantConsent({ from: dataController });
        const grantDcReceipt = await web3.eth.getTransactionReceipt(grantDcTx.tx);
        gasUsageGrantDC.push(grantDcReceipt.gasUsed);

        deployments.push(createTx.address);
      }

      const endTime = Date.now();
      const totalMs = endTime - startTime;

      function avg(arr) {
        if (!arr.length) return 0;
        return arr.reduce((a, b) => a + b, 0) / arr.length;
      }

      console.log("\n📊 Results:");
      console.log(`  Total consents:       ${NUM_CONSENTS}`);
      console.log(`  Total time:           ${totalMs} ms`);
      console.log(`  Average per consent:  ${(totalMs / NUM_CONSENTS).toFixed(2)} ms`);
      console.log("");
      console.log("  Average gas (create):   ", Math.round(avg(gasUsageCreate)).toLocaleString(), "gas");
      console.log("  Average gas (DS grant): ", Math.round(avg(gasUsageGrantDS)).toLocaleString(), "gas");
      console.log("  Average gas (DC grant): ", Math.round(avg(gasUsageGrantDC)).toLocaleString(), "gas");

      console.log("\n💡 You can use these numbers as empirical evidence in your report\n   when discussing scalability and cost per consent lifecycle.");
      console.log("   Try changing NUM_CONSENTS or parameters and rerun this test.\n");

      // Simple sanity assertion so test suite reports success
      assert.equal(deployments.length, NUM_CONSENTS, "All consents should be deployed");
    });
  });
});
