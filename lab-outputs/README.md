# Turbo cache lab logs

These files are the full terminal output of `npx turbo run build --ui=stream` on this repo:

| File | What changed | Cached line |
| --- | --- | --- |
| `01-first-build.txt` | nothing (cold) | `0 cached, 2 total` — 7.329s |
| `02-second-build-full-turbo.txt` | nothing | `2 cached, 2 total` — 13ms `FULL TURBO` |
| `03-web-only-change.txt` | `apps/web/app/page.tsx` | `1 cached, 2 total` |
| `04-shared-ui-change.txt` | `packages/ui/src/button.tsx` | `0 cached, 2 total` |
