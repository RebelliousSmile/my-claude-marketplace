---
name: doc-quick-ref
description: Create a quick reference guide for a component or pattern
allowed-tools: Read, Write, Glob, Grep, Task
argument-hint: [component-name]
---

# Quick Reference Guide Generator

Create a quick reference guide for a specific component or pattern.

## Usage

```
/doc-quick-ref [component-name]
```

## Examples

- `/doc-quick-ref circuit-breakers` : Create quick ref for circuit breaker pattern
- `/doc-quick-ref sync-api` : Create quick ref for Sync API
- `/doc-quick-ref cache-resilience` : Create quick ref for cache patterns

## What This Command Does

The agent will:
1. Consult existing documentation
2. Delegate to specialized agents if needed
3. Create a 3-tier guide:
   - TL;DR (30 seconds)
   - Quick Reference (5 minutes) with code examples
   - Link to deep dive documentation
4. Optimize for memory bank (< 2k tokens)
5. Add to appropriate location in documentation

## Guide Structure

The generated guide will include:
- Core concepts and principles
- Most common use cases with code
- Frequent pitfalls to avoid
- Links to full documentation
- References to actual code locations

## When to Use

- You need concise reference for a pattern
- Existing docs are too verbose
- You want to onboard developers quickly
- You frequently access the same information
