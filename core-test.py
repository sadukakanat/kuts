code_content = """/**

KUTS Core Integration Test
Test flow:
Identity
↓
Transaction
↓
Signature
↓
Validation
↓
Ledger Commit
↓
Derived State
*/
const {
identity,
transaction,
validator,
Ledger,
state
} = require("../kuts-core");
function assert(condition, message) {
if (!condition) {
throw new Error(`TEST FAILED: ${message}`);
}
console.log(`✓ ${message}`);
}
console.log("\\n=================================");
console.log("KUTS CORE INTEGRATION TEST");
console.log("=================================\\n");
//
// 1. Create Alice's identity
//
console.log("1. Creating Alice identity...");
const alice =
identity.createIdentity();
assert(
alice.id.startsWith("kuts:"),
"Alice identity created"
);
assert(
alice.publicKey,
"Alice public key exists"
);
assert(
alice.privateKey,
"Alice private key exists"
);
//
// 2. Create Bob's identity
//
console.log("\\n2. Creating Bob identity...");
const bob =
identity.createIdentity();
assert(
bob.id.startsWith("kuts:"),
"Bob identity created"
);
//
// 3. Create a transaction
//
console.log("\\n3. Creating transaction...");
const unsignedTransaction =
transaction.createTransaction({
type: "TRANSFER",
sender: alice.id,
recipient: bob.id,
amount: "100.00",
currency: "KINE",
nonce: 1,
metadata: {
purpose: "Core integration test"
}
});
assert(
unsignedTransaction.type === "TRANSFER",
"Transaction type is correct"
);
assert(
unsignedTransaction.sender === alice.id,
"Transaction sender is correct"
);
assert(
unsignedTransaction.recipient === bob.id,
"Transaction recipient is correct"
);
//
// 4. Sign the transaction
//
console.log("\\n4. Signing transaction...");
const signedTransaction =
transaction.signTransaction(
unsignedTransaction,
alice.privateKey
);
assert(
signedTransaction.signature,
"Transaction signature exists"
);
//
// 5. Validate the transaction
//
console.log("\\n5. Validating transaction...");
const validationResult =
validator.validateTransaction(
signedTransaction,
alice.publicKey
);
assert(
validationResult.valid === true,
"Transaction signature is valid"
);
//
// 6. Create a ledger
//
console.log("\\n6. Creating ledger...");
const ledger =
new Ledger();
assert(
ledger.size() === 0,
"Ledger starts empty"
);
//
// 7. Commit the validated transaction
//
console.log("\\n7. Committing transaction...");
const ledgerEntry =
ledger.commit(
signedTransaction
);
assert(
ledgerEntry.transactionId,
"Ledger entry has transaction ID"
);
assert(
ledger.size() === 1,
"Ledger contains one transaction"
);
//
// 8. Derive state from the ledger
//
console.log("\\n8. Deriving state...");
const currentState =
state.deriveState(
ledger.getEntries()
);
assert(
currentState.transactionCount === 1,
"State contains one transaction"
);
assert(
currentState.balances[alice.id] === -100,
"Alice balance is -100"
);
assert(
currentState.balances[bob.id] === 100,
"Bob balance is +100"
);
//
// 9. Test duplicate transaction protection
//
console.log(
"\\n9. Testing duplicate transaction protection..."
);
let duplicateRejected = false;
try {
ledger.commit(
signedTransaction
);
} catch (error) {
duplicateRejected = true;
}
assert(
duplicateRejected === true,
"Duplicate transaction was rejected"
);
//
// 10. Test tampering detection
//
console.log(
"\\n10. Testing tampering detection..."
);
const tamperedTransaction = {
...signedTransaction,
amount: "1000.00"
};
const tamperedResult =
validator.validateTransaction(
tamperedTransaction,
alice.publicKey
);
assert(
tamperedResult.valid === false,
"Tampered transaction was rejected"
);
//
// Final result
//
console.log("\\n=================================");
console.log("ALL KUTS CORE TESTS PASSED");
console.log("=================================\\n");
"""

with open("kuts-core.test.js", "w") as f:
    f.write(code_content)