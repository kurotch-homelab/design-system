---
name: forma-design-system
description: Installs and applies the Forma business design system from bundled React packages, standalone CSS, design tokens, and IBM Plex Sans JP fonts without its source repository or an npm publication. Use when adopting Forma, adding @kurotch-homelab/forma-* components, creating a Forma-based business interface, or aligning an existing React, Next.js, Vue, Svelte, Astro, or HTML project with Forma (Formaの導入・デザインシステム適用).
---

# Forma design system

## What is included

This directory is a complete portable skill. Its installer uses only Node.js built-ins.
The source repository, a local catalog server, and a published Forma package are unnecessary.
Bundled assets include the React ES Modules/types, plain CSS, CSS/JSON tokens, motion, and licensed IBM Plex Sans JP fonts (400/500/600).
Keep the bundled MIT license with Forma code/docs and OFL.txt with redistributed fonts; see THIRD_PARTY_NOTICES.md.
Read `bundle.json` for the included versions; never guess or install a registry version of Forma.

## Quick start

Resolve `SKILL_DIR` to the directory containing this file, not the current project.
Resolve `PROJECT_DIR` to the actual application package, including in a monorepo.
Quote paths as required by the host shell. The commands below use placeholders, not environment variable syntax.

```sh
node "<SKILL_DIR>/scripts/forma.mjs" inspect --target "<PROJECT_DIR>"
node "<SKILL_DIR>/scripts/forma.mjs" install --target "<PROJECT_DIR>" --mode react --assets-dir public/forma --dry-run
node "<SKILL_DIR>/scripts/forma.mjs" install --target "<PROJECT_DIR>" --mode react --assets-dir public/forma
```

Use `--mode css` for non-React web projects, or `--mode tokens` for design-only/native projects.
Choose the asset directory from the application: `public/forma`, `static/forma`, or `assets/forma` are examples.
The installer stages assets and edits only the React package dependency when applicable; it does not run a package manager or rewrite application entry points.

## Workflow

1. Read the project's instructions, package manifests, lockfile, entry points, routes, styles, and existing providers.
   Reuse the existing stack, package manager and navigation. Do not replace the app or add React to a non-React project.
2. Read [INTEGRATION.md](references/INTEGRATION.md) and [DESIGN.md](references/DESIGN.md).
   For React, also read [REACT.md](references/REACT.md); for plain controls, consult [HTML.md](references/HTML.md).
3. Run `inspect`. Select the target package, `react|css|tokens`, and a served asset directory.
   The React adapter requires an existing compatible React (18.3 or 19); otherwise use CSS or resolve the upgrade within the user's scope.
4. Run the installer with `--dry-run`, inspect the concrete changes, then run the same command without it.
   A dry run is a read-only implementation check, not a required approval gate. Continue within existing authorization.
   If an existing file differs, preserve it and reconcile the conflict rather than forcing an overwrite.
5. For React, run the existing package manager's install command in the detected workspace root and inspect the lockfile change.
   Forma is a `file:` dependency on a tarball copied into the target project, never an absolute path back to this skill.
   Keep the tarball and installed assets in version control; they are required for reproducible installs.
6. Integrate styles and fonts once. React imports `@kurotch-homelab/forma-react/styles.css` and wraps the relevant UI in `FormaProvider`.
   Plain HTML/framework templates load `forma.css` and use a `.forma` boundary with theme/density attributes.
   Load the bundled `fonts.css` from its served path. Font files are local and licensed; no Google request is needed.
7. Implement or adapt at least one meaningful existing screen using the shared tokens and components.
   For a new app, use the complete examples under `assets/examples/` as a starting point.
   Preserve existing business logic, routing, form names, localization, and loading/error behavior.
8. Apply the rules below and the design references; installation alone does not complete adoption.
9. Run `verify`, then the project's type check/build/tests and inspect its rendered screen.
   Check keyboard input, labels, validation, focus return, 390/768/1440px, light/dark, and reduced motion as applicable.
   Report the changed files, versions, tested behavior, and any environment-specific limits.

```sh
node "<SKILL_DIR>/scripts/forma.mjs" verify --target "<PROJECT_DIR>"
node "<SKILL_DIR>/scripts/forma.mjs" self-check
```

## Design rules

- Use neutral surfaces, ink text, and blue for actions/selection. Choose semantic CSS variables rather than scattering hex colors.
- IBM Plex Sans JP: body 400, labels 500, headings 600; normal tracking 0; short English overlines may use .08em.
- Use the 4px spacing grid, 4/6/8px radii, 40px controls (32px compact), and shadows only for floating surfaces.
- Business body text starts at 14px; website text at 16px. Use tabular numerals for comparisons.
- Avoid decorative gradients, excessive rounding/cards, vague marketing copy, bounce, and scroll reveal sequences.
- Keep reaction/transition/larger opening durations at 120/180/240ms. Preserve immediate state and focus updates and respect reduced motion.
- Use native semantics, visible labels, specific errors, keyboard access, and named icon buttons. Color alone never carries state.
- Use table-local horizontal scrolling and responsive navigation. Do not clip translated labels.

## Boundaries

The React package is optional; CSS and tokens remain framework-independent.
Runtime dependency of the adapter is React only. Do not introduce another UI, icon, date, or animation library merely to integrate Forma.
Native date/datalist UI is browser/OS dependent. FileUpload selects/validates locally; it does not upload.
Backend, authentication, publication, hosting, table virtualization and cell editing are not supplied.
For non-web projects, use the JSON tokens and design guidance; do not claim that browser CSS or React DOM controls work natively.
External project dependencies may still require the project's package registry/cache. Bundled Forma assets and fonts do not.
