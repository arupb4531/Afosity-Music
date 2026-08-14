<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:afosity-docs-rules -->

# Documentation Update Rule

After EVERY modification to this project (new features, bug fixes, component changes, API changes, dependency updates), you MUST update the following files in the `docs/` directory:

1. **`e:\Afosity Music\docs\REPORT.md`** — Update the relevant sections:
   - Update the "Last Updated" date and version number at the top.
   - Update the **Feature Changelog** table with a new row describing what changed and the date.
   - Update the **Feature Status** table if new features were added or removed.
   - Update the **Component Breakdown** section if any component's props, state, or behavior changed.
   - Update the **Architecture & Data Flow** section if any data or interaction flow changed.
   - Update the **Technology Stack** table if any new dependencies were added.

2. **`e:\Afosity Music\docs\workflow_diagram.png`** — If a major new feature or data flow was added that significantly changes the architecture, regenerate the workflow diagram using `generate_image` and overwrite this file.

Do NOT skip this step. Keeping the docs current is a requirement, not optional.

<!-- END:afosity-docs-rules -->
