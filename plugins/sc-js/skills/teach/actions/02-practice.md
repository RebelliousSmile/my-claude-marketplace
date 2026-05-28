# Action 02 — practice

Generate a targeted exercise on a JS/TS/Vue/Nuxt concept, modelled on current project patterns.

## Process

### Step 1 — Identify the concept and context

From the user's request (or prior `explain` output):
- The concept to practice
- The project's framework and TypeScript setup (from `package.json` / `tsconfig.json`)
- The project's style (component structure, naming conventions)

### Step 2 — Design the exercise

Create an exercise that:
- Uses the project's actual framework and style (no generic "TodoApp" if the project is an e-commerce)
- Has a clear, self-contained problem statement
- Requires applying the concept — not just recognizing it
- Has a single correct approach (avoid exercises with many equally valid solutions)

Exercise format:
```
## Exercise — <concept>

**Context:** <1-2 lines: what the fictional scenario is>

**Task:** <what the user must write or fix>

**Starter code:**
<minimal snippet to work from>

**Acceptance criteria:**
- <criterion 1>
- <criterion 2>
```

### Step 3 — Provide the solution

After the exercise, provide the complete solution:
```
## Solution

<full solution snippet>

**Why:** <2-3 lines explaining the key decisions>
```

Link back to the project example found during `explain` (if applicable).

## Test

Invoke with "practice on async/await"; verify the exercise includes a starter snippet, acceptance criteria, and a complete solution with explanation.
