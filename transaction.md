# KUTS Transaction Protocol

## Status

Draft

## Purpose

This document defines the canonical structure of a KUTS transaction.

## Core Principle

A transaction is a signed request to change system state.

A transaction is not automatically valid merely because it was created or received.

## Transaction Lifecycle

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

## Conceptual Transaction

{
  "version": 1,
  "type": "...",
  "sender": "...",
  "recipient": "...",
  "amount": "...",
  "currency": "...",
  "nonce": 0,
  "timestamp": "...",
  "metadata": {},
  "signature": "..."
}

## Validation Requirements

A transaction must:

- have a valid structure
- identify the sender
- identify the recipient where required
- contain a valid amount
- contain a valid timestamp
- contain a valid nonce
- contain a valid signature
- satisfy economic rules
- satisfy current state rules

## State Change

A transaction must not directly modify application UI state.

The process is:

Transaction
    ↓
Validation
    ↓
Ledger Entry
    ↓
State Derivation
    ↓
Application Display

## Replay Protection

A transaction must contain a mechanism preventing the same transaction from being accepted more than once.

The exact replay-protection mechanism is defined separately.

## Status of This Specification

This document is a draft and may change before KUTS Core Protocol v1.0.