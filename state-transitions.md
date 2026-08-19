# KUTS State Transition Protocol

## Status

Draft

## Purpose

This document defines how the KUTS system moves from one valid state to another.

## Core Principle

The KUTS system changes state only through valid, authorized, and validated transitions.

A user interface must not directly define authoritative system state.

## State Model

Previous State
    +
Valid Transaction
    ↓
Validation
    ↓
New State

Conceptually:

State(t+1) = Apply(State(t), Valid Transaction)

## Transaction State Lifecycle

A transaction may pass through the following states:

CREATED
    ↓
SIGNED
    ↓
SIGNATURE_VERIFIED
    ↓
VALIDATED
    ↓
ACCEPTED
    ↓
COMMITTED

## Invalid Transitions

The protocol must reject invalid transitions.

Examples:

CREATED → COMMITTED

without validation is invalid.

UNSIGNED → ACCEPTED

is invalid when a signature is required.

REJECTED → COMMITTED

is invalid unless a new valid transaction is created.

## State Transition Requirements

Every state transition must have:

- a previous valid state
- a valid triggering action or transaction
- a validation result
- a deterministic resulting state

## Balance State

Balances should be derived from valid ledger history wherever possible.

The preferred model is:

Valid Ledger Entries
    ↓
State Calculation
    ↓
Current Balance

A balance stored only in local browser storage must not be treated as authoritative protocol state.

## State Rebuilding

A node should be able to reconstruct valid state from the accepted ledger history or an equivalent verified state snapshot.

## State Consistency

Two nodes processing the same valid history under the same protocol rules should derive the same state.

## State Conflicts

The protocol must define how conflicting state transitions are handled.

Examples include:

- duplicate transactions
- conflicting transactions
- simultaneous spending
- invalid ordering
- competing state histories

The conflict-resolution rules must be defined before Protocol v1.0.

## State Finality

The protocol must define when a state transition is considered final.

Possible states may include:

- pending
- accepted
- committed
- finalized

The exact finality model is to be defined by the KUTS network protocol.

## Status of This Specification

This document is a draft and may change before KUTS Core Protocol v1.0.