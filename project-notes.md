# Wayfinders Project Notes

## Stack
- Next.js 14 — Progressive Web App, single codebase for web and mobile
- Supabase — database, authentication, storage
- Vercel — hosting, auto-deploys from GitHub
- Cursor — code editor
- Claude Code — set up, used for hands-on building

## URLs
- Local: http://localhost:3000
- Live: https://wayfinders-kappa.vercel.app
- GitHub: https://github.com/tihunt85/wayfinders.git

## Supabase
- Credentials live in .env.local (gitignored, never committed) — see app/supabase.js
  for how they're read
- Tables built so far: profiles (with Row Level Security — public select, own insert,
  own update)

## Build Status
- [x] Windows dev environment set up (Node.js, Git, Cursor)
- [x] GitHub repository created and connected
- [x] Next.js 14 app running locally
- [x] Live on Vercel with automatic deployment from GitHub on push
- [x] Supabase connected and verified
- [x] profiles table created with Row Level Security
- [x] Authentication working — email/password via Supabase, using @supabase/ssr
- [x] Login/signup page live at /login
- [x] Full product vision defined — see CLAUDE.md
- [x] Full 27-table data model scoped — see DATA-MODEL.md
- [x] Creator expression of interest landing page designed (as visual artifact —
      not yet exported/hosted)
- [x] Claude Code set up in project folder with CLAUDE.md context file
- [x] Claude.ai Project created with documents synced to knowledge base
- [x] Supabase credentials moved to .env.local
- [ ] project-notes.md recreated as a tracked file (this commit)
- [ ] Full Supabase database schema built field-by-field with data types
- [ ] Video storage/delivery decision made and implemented (see open-questions.md — OQ-011)
- [ ] PWA configuration (manifest, service worker, add-to-home-screen)
- [ ] Core feed / discovery experience
- [ ] Experience detail pages
- [ ] Waypoint upload flow
- [ ] User profile pages
- [ ] Map browse
- [ ] Search (place / experience / creator)
- [ ] List / save mechanic with auto geographic grouping
- [ ] Social layer (comments, Q&A, follows, likes)
- [ ] Notification system
- [ ] Admin editorial tools
- [ ] Creator EOI page exported as a real hosted page

## Windows Setup — Troubleshooting Reference
Issues hit during initial setup, kept here in case the environment ever needs rebuilding:
- `git` not recognised — Git wasn't installed; install from git-scm.com, then close and
  reopen the terminal before retrying (PATH doesn't update in an already-open terminal)
- `npx` not recognised — same root cause, Node.js wasn't installed yet
- PowerShell blocks script execution by default — run
  `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` once, confirm with Y
- PowerShell does not support Unix-style flags — `rmdir /s /q folder` (cmd syntax) fails;
  use `Remove-Item -Recurse -Force folder` instead
- The very latest Next.js (15+, Turbopack/wasm bindings) had a Windows-specific
  compatibility error on this machine (`turbo.createProject is not supported by the wasm
  bindings`) — resolved by deliberately installing Next.js 14 instead
  (`npx create-next-app@14`). If upgrading Next.js later, test this carefully on Windows
  before committing.
- `git commit` requires identity config on a fresh machine —
  `git config --global user.email "..."` and `git config --global user.name "..."`

## Local Development
1. Open Cursor
2. Open terminal
3. cd wayfinders
4. npm run dev
5. Visit http://localhost:3000
