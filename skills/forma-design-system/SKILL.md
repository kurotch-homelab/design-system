---
name: forma-design-system
description: Installs and applies the Forma business design system using versioned React, CSS, and token packages from GitHub Packages, with local design guidance and IBM Plex Sans JP fonts. Use when adopting Forma, adding @kurotch-homelab/forma-* components, creating a Forma business interface, or aligning React, Next.js, Vue, Svelte, Astro, or HTML projects with Forma (Formaの導入・デザインシステム適用).
---

# Forma design system

## Distribution

React, CSS, and tokens are installed from `https://npm.pkg.github.com`.
Read the exact package names and versions from `bundle.json`; do not invent versions.
The skill contains guidance, examples, fonts, and an installer, not package archives or compiled CSS/tokens.
The source repository is not needed. GitHub Packages authentication and a package manager are needed.
Keep MIT notices with Forma code/docs and OFL.txt with redistributed fonts; see THIRD_PARTY_NOTICES.md.

## Workflow

1. Read project instructions, manifests, lockfiles, entry points, styles and existing providers.
   Preserve its framework, business logic, routing and package manager. Do not add React to a non-React app.
2. Read [INTEGRATION.md](references/INTEGRATION.md) and [DESIGN.md](references/DESIGN.md).
   For React read [REACT.md](references/REACT.md); for native HTML structures read [HTML.md](references/HTML.md).
3. Resolve `<SKILL_DIR>` to this directory and `<APP_DIR>` to the actual app package.
   Run `inspect`; select `react`, `css`, or `tokens` and a served asset directory.
4. Check registry configuration at the detected workspace root.
   Route `@kurotch-homelab` to `https://npm.pkg.github.com`; preserve other scopes and existing credentials.
   If this scope already points elsewhere, reconcile the affected dependencies before changing it.
   GitHub Packages requires authentication even for public npm packages. Use the user's existing credentials
   or a classic PAT with `read:packages` through the environment; never print or commit its value.
   See INTEGRATION.md for npm/pnpm/Yarn/Bun and GitHub Actions authentication.
5. Run `install --dry-run`, inspect changes, then `install` within the user's existing authorization.
   This writes exact registry dependencies, local fonts/docs and an installation record.
   For CSS/tokens in a project without package.json, it creates a private manifest without React.
   It never runs a package manager, edits registry credentials, or rewrites application source.
6. Run the project's package-manager install command in the detected workspace root.
   Verify that Forma's lockfile entries resolve from GitHub Packages and review their integrity.
   Run `sync`; CSS/tokens are copied from the installed package. React imports the installed package directly.
7. Integrate styles/fonts once. React imports `@kurotch-homelab/forma-react/styles.css` and uses `FormaProvider`.
   Plain HTML uses the synced `forma.css`; bundler projects may import `@kurotch-homelab/forma-styles`.
   Serve the copied `fonts/fonts.css` locally and keep its fonts and license together.
8. Implement or adapt a meaningful screen using the existing application state and behavior.
   Use `assets/examples/` as a starting point, not a replacement for an existing app.
9. Run `verify`, the app's typecheck/build/tests, and inspect its rendered screen.
   Check labels, keyboard input, validation, focus return, 390/768/1440px, both themes and reduced motion.
   Report versions, registry, changed files, tested behavior, and any remaining environment requirements.

```sh
node "<SKILL_DIR>/scripts/forma.mjs" inspect --target "<APP_DIR>"
node "<SKILL_DIR>/scripts/forma.mjs" install --target "<APP_DIR>" --mode react --assets-dir public/forma --dry-run
node "<SKILL_DIR>/scripts/forma.mjs" install --target "<APP_DIR>" --mode react --assets-dir public/forma
# Run the application's authenticated package manager install at its workspace root.
node "<SKILL_DIR>/scripts/forma.mjs" sync --target "<APP_DIR>"
node "<SKILL_DIR>/scripts/forma.mjs" verify --target "<APP_DIR>"
```

Use `--mode css` for Vue/Svelte/HTML and `--mode tokens` for design/native integrations.
Use `--fonts system` only when the application chooses system typography.
`self-check` checks the skill's local files and registry metadata; it does not test remote availability.
Existing edited assets or conflicting dependency specs fail before writes. Reconcile them deliberately.
For a previous managed file: installation, `install` migrates the dependency; unused old assets remain intact.
Commit package.json, the lockfile, vendor/forma docs/record and synced assets. Do not copy node_modules into a skill.

## Design rules

- Neutral surfaces, ink text, blue actions; use semantic tokens.
- IBM Plex Sans JP: body 400, labels 500, headings 600; natural tracking, .08em only for short overlines.
- 4px spacing; 4/6/8px radii; 40px controls, 32px compact; shadows only on floating surfaces.
- Business text 14px, website text 16px; tabular numerals for comparisons.
- No decorative gradients, excessive rounding/cards, vague marketing, bounce or scroll reveals.
- Motion: reactions 120ms, entrances 180ms, larger transitions 240ms; respect reduced motion and preserve focus.
- Native semantics, visible labels, useful errors, keyboard access and names for icon buttons; never color alone.
- Table-local overflow and responsive navigation; allow translated labels to wrap.

## Boundaries

The optional React adapter requires React 18.3 or 19; CSS/tokens are framework-independent.
Do not add UI, date, icon or animation dependencies merely to adopt Forma.
Native date/datalist UI follows the browser/OS. FileUpload validates locally; it does not upload.
Backend, authentication, hosting, virtual scrolling and direct cell editing are outside this design system.
For non-web projects use JSON tokens/guidance, not browser controls.
