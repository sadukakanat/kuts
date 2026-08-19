# KUTS Identity Protocol

## Status

Draft

## Purpose

This document defines how a KUTS identity is created, represented, authenticated, and used to authorize actions.

## Core Principle

A KUTS identity is based on a cryptographic public key.

The identity is not defined solely by:

- a username
- an email address
- a browser session
- localStorage
- a device
- an IP address

## Identity Model

A KUTS identity consists of:

- a public key
- a cryptographic algorithm identifier
- an identity identifier
- optional public metadata

The private key belongs exclusively to the identity holder.

## Conceptual Structure

Private Key
    ↓
Public Key
    ↓
KUTS Identity
    ↓
Signed Actions
    ↓
Network Verification

## Identity Identifier

The identity identifier should be deterministically derived from the public key.

Example:

kuts:<public-key-identifier>

## Authentication

Authentication must use a challenge-response process.

1. A node creates a challenge.
2. The identity holder signs the challenge with the private key.
3. The node verifies the signature using the public key.
4. The identity is authenticated if verification succeeds.

## Security Principles

1. Private keys must never be transmitted to a node.
2. Private keys must never be stored in plaintext on a network-accessible service.
3. A localStorage value alone must not be treated as proof of identity.
4. Every authorized transaction must be cryptographically signed.
5. Signatures must be independently verifiable.

## Status of This Specification

This document is a draft and may change before KUTS Core Protocol v1.0.