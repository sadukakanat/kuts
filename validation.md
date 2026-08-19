# KUTS Validation Protocol

## Status

Draft

## Purpose

This document defines the validation process used to determine whether a KUTS object or transaction is valid.

## Core Principle

Data must not be accepted merely because it was received.

Every node must independently validate data before accepting it.

## Validation Flow

Received Data
    ↓
Structural Validation
    ↓
Identity Validation
    ↓
Cryptographic Validation
    ↓
Economic Validation
    ↓
State Validation
    ↓
Protocol Validation
    ↓
Accept or Reject

## Structural Validation

The validator must verify:

- required fields exist
- field types are correct
- values use canonical formats
- no unexpected critical fields alter protocol meaning
- the protocol version is supported

## Identity Validation

The validator must verify:

- the sender identity is correctly represented
- the identity format is valid
- the identity is authorized to perform the requested action where required

## Cryptographic Validation

The validator must verify:

- the signature exists where required
- the signature is valid
- the signature corresponds to the transaction data
- the public key corresponds to the claimed identity

## Timestamp Validation

The validator must verify:

- the timestamp uses the canonical format
- the timestamp is within acceptable protocol limits
- future timestamps are handled according to protocol rules
- timestamp manipulation does not bypass validation

## Nonce and Replay Validation

The validator must verify that:

- a transaction nonce is valid
- a transaction has not already been accepted
- a previously accepted transaction cannot be replayed

## Economic Validation

The validator must verify:

- the amount is valid
- the economic calculation is reproducible
- the transaction satisfies economic rules
- the resulting distribution reconciles correctly

## State Validation

The validator must verify:

- the requested state transition is permitted
- the sender has sufficient valid authority or balance where required
- the transaction does not conflict with existing state
- the resulting state is valid

## Rejection

A validator must reject invalid data.

A rejection should include a machine-readable reason code.

Example:

{
  "valid": false,
  "code": "INVALID_SIGNATURE"
}

## Validation Result

A validation result should be deterministic.

The same input and the same protocol state should produce the same validation result.

## Status of This Specification

This document is a draft and may change before KUTS Core Protocol v1.0.