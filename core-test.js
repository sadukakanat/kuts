const {
    identity,
    transaction,
    validator,
    Ledger,
    state
} = require("../kuts-core");

console.log("KUTS CORE TEST START");

// 1. Create Alice
const alice = identity.createIdentity();

// 2. Create Bob
const bob = identity.createIdentity();

console.log("Alice:", alice.id);
console.log("Bob:", bob.id);

// 3. Create a transaction
const tx = transaction.createTransaction({
    type: "TRANSFER",
    sender: alice.id,
    recipient: bob.id,
    amount: "100",
    currency: "KINE",
    nonce: 1
});

// 4. Sign the transaction
const signedTx = transaction.signTransaction(
    tx,
    alice.privateKey
);

// 5. Validate the transaction
const result = validator.validateTransaction(
    signedTx,
    alice.publicKey
);

console.log("Transaction valid:", result.valid);

// 6. Put it into the ledger
const ledger = new Ledger();

if (result.valid) {
    ledger.commit(signedTx);
}

// 7. Derive state
const currentState = state.deriveState(
    ledger.getEntries()
);

console.log("Balances:");
console.log(currentState.balances);

console.log("KUTS CORE TEST COMPLETE");