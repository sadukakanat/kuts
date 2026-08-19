# KUTS Economics Protocol

## Status

Draft

## Purpose

This document defines the economic rules used by the KUTS protocol.

The purpose is to ensure that economic calculations are deterministic, transparent, and independently reproducible by every validating node.

## Core Principle

The same valid economic input must produce the same economic result on every KUTS node.

Economic calculations must not depend on:

- browser state
- localStorage
- user interface logic
- random values
- local device settings
- floating-point inconsistencies
- undocumented exceptions

## Economic Calculation Flow

Economic Input
    ↓
Canonical Calculation
    ↓
Validation
    ↓
Transaction Result
    ↓
Ledger Entry

## Monetary Representation

Amounts must use a canonical representation.

The protocol must define:

- currency identifier
- decimal precision
- minimum transaction amount
- rounding method
- maximum permitted amount
- handling of zero values
- handling of negative values

The exact rules are to be defined before Protocol v1.0.

## Value Distribution

Where an economic transaction requires value distribution, the protocol must define each component explicitly.

Example:

Gross Amount
    ↓
TDS
    ↓
RSP
    ↓
Net Recipient Amount

Every component must be calculated deterministically.

## Economic Invariants

A valid economic transaction must satisfy:

- all required components are present
- no component is negative unless explicitly permitted
- the total distribution reconciles with the gross amount
- rounding follows the canonical protocol rule
- the result is independently reproducible

## Example

Gross Amount = 100.00 KINE

The protocol may define a distribution such as:

- Worker allocation
- TDS allocation
- RSP allocation

The exact percentages and rules must be defined by the KUTS economic specification.

## Failed Economic Validation

A transaction must be rejected if:

- the calculation cannot be reproduced
- the total allocation does not reconcile
- an invalid amount is provided
- an unauthorized economic rule is applied
- the transaction violates an economic invariant

## Economic Rule Versioning

Economic rules must be versioned.

Example:

economicRuleVersion: "1.0"

A transaction must identify which economic rule version was used when required.

## Status of This Specification

This document is a draft and may change before KUTS Core Protocol v1.0.