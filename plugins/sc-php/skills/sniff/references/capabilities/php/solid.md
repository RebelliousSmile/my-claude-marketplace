---
paths:
  - "**/*.php"
  - "!vendor/**"
---

# SOLID violations — capability pivot for sc-php audit

Standalone pivot — initial content seeded from improve/01-analyze.md. May diverge over time.

#### SOLID violations

**Single Responsibility (SRP):**
- Controller methods > 30 lines → likely doing too much
- Model methods that query, transform, AND send email → fat model
- Look for: database queries + business logic + HTTP response formatting in the same method

**Open/Closed (OCP):**
- `switch ($type)` or `if ($type === 'X') ... elseif` chains that would require editing to add a new type → missing polymorphism
- Look for: `switch` on a type/status string that isn't backed by an enum or strategy pattern

**Liskov Substitution (LSP):**
- Subclass overrides that throw exceptions the parent never throws
- Subclass that narrows parameter types or widens return types vs parent contract

**Interface Segregation (ISP):**
- Interfaces with > 7 methods that are only partially implemented by most classes
- Classes that implement an interface but leave several methods throwing `NotImplementedException`

**Dependency Inversion (DIP):**
- `new ClassName()` inside a class constructor or method (hidden dependency)
- `static::` calls to concrete classes for service access
- Look for: `new Mailer()`, `new Repository()`, `new Logger()` instead of injected dependencies
