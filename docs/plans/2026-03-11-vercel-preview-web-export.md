# Vercel Preview Web Export Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the Expo app exportable as a static web build and easy to deploy to Vercel for preview/demo sharing.

**Architecture:** Keep the current Expo app as the single source of truth. Add minimal web export configuration so `pnpm run export:web` produces a static `dist` directory, and add Vercel settings that serve that output without introducing production-only complexity.

**Tech Stack:** Expo SDK 54, React Native Web, TypeScript, pnpm, Vercel static deployment

---

### Task 1: Add static web export configuration

**Files:**
- Modify: `app.json`
- Modify: `package.json`

**Step 1:** Confirm the current web config does not fully declare static export behavior.

**Step 2:** Add the minimal Expo web export settings needed for preview hosting.

**Step 3:** Add a dedicated script for generating the preview build.

**Step 4:** Run the export command and confirm `dist/` is generated.

### Task 2: Add Vercel deployment configuration

**Files:**
- Create: `vercel.json`

**Step 1:** Configure Vercel to serve the exported static output from `dist`.

**Step 2:** Keep the config preview-oriented and avoid production-specific routing complexity.

**Step 3:** Re-run the export command and ensure the output still matches the Vercel config.

### Task 3: Document preview deployment flow

**Files:**
- Modify: `README.md`

**Step 1:** Document how to create the preview build locally.

**Step 2:** Document how to connect/import the repo in Vercel and which output directory to use.

**Step 3:** Note that this path is intended for demo sharing, not app-store distribution.

### Task 4: Verify local preview pipeline

**Files:**
- Verify: `package.json`
- Verify: `app.json`
- Verify: `vercel.json`

**Step 1:** Run `pnpm run export:web`.

**Step 2:** Run `pnpm run typecheck`.

**Step 3:** Confirm `dist/` exists and the config files align with the generated output.
