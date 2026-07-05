---
name: expo-react-native-design
description: Use this skill when creating, redesigning, polishing, or reviewing Expo Go React Native UI. It focuses on mobile-first layout, native touch ergonomics, Safe Area, NativeWind tokens, component states, and anti-AI-slop mobile design.
---

# Expo React Native Design Skill

Use this skill for Expo Go and React Native UI work.

## Goal

Create mobile UI that feels native, touch-friendly, visually coherent, responsive across phone sizes, and consistent with the project design tokens.

Do not produce web-looking UI unless the product intentionally needs a web-style interface.

## Workflow

### 1. Understand the screen

Identify:

- screen purpose
- primary action
- secondary actions
- navigation entry point
- expected scroll behavior
- empty/loading/error states
- whether keyboard input is involved
- whether the screen appears inside tabs, stack navigation, modal, or drawer

### 2. Mobile layout first

Design for small phone width first.

Check likely behavior at:

- 360px Android compact
- 390px iPhone baseline
- 430px large phone
- tablet width if relevant

Avoid fixed widths unless intentional.

### 3. Safe Area and system UI

Account for:

- status bar
- notch / dynamic island
- bottom home indicator
- tab bar
- keyboard
- modal sheet insets

Use SafeAreaView or project-safe screen wrappers where available.

### 4. Touch ergonomics

- Main actions should be easy to tap.
- Icon-only buttons need accessible labels.
- Touch targets should generally be 44-48dp or larger.
- Avoid dense controls near screen edges.
- Do not rely on hover interactions.

### 5. Typography

- Use clear hierarchy: screen title, section title, body, caption.
- Keep body text readable on mobile.
- Avoid tiny low-contrast labels.
- Avoid too many font sizes.
- Use line-height intentionally.
- Prevent important text clipping.

### 6. Spacing

- Use 4px scale.
- Group related controls tightly.
- Separate unrelated sections clearly.
- Keep vertical rhythm consistent.
- Avoid random margin patches.

### 7. Color and tokens

- Use semantic tokens.
- Avoid raw hex values.
- Support light/dark mode if the project supports it.
- Ensure disabled, destructive, selected, and active states are distinct.

### 8. Component rules

Prefer existing project UI primitives.

If using NativeWind or React Native Reusables:

- prefer token-based class names
- avoid arbitrary color classes
- avoid repeated inline className patterns
- extract repeated UI into components

If using StyleSheet:

- import tokens from the project theme
- avoid hardcoded colors and magic spacing
- keep styles grouped by component intent

### 9. Native platform details

Consider:

- iOS shadow vs Android elevation
- Android ripple or pressed state
- status bar contrast
- keyboard avoiding behavior
- scroll indicator and content inset
- platform-specific typography differences

### 10. Final anti-slop pass

Reject UI that looks like:

- generic AI SaaS dashboard
- web landing page squeezed into mobile
- repetitive card list with no hierarchy
- decorative gradient without purpose
- unreadable low-contrast text
- cramped touch controls
- inconsistent radius/shadow/spacing

## Completion Report

When done, report:

- design direction
- files changed
- components reused
- tokens used or added
- mobile states considered
- Expo Go risks or unverified behavior
