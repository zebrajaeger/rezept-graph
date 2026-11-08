# AGENTS.md

## Basics
- Für Codeänderungen immer über OpenSpec gehen.
- Commit Messages immer auf Basis des OpenSpec change Namens machen
- Test Driven Development. Erst die Tests bauen, dann die Codeänderung implementieren.

## Code
- Im Code für Kommentare, Log-Ausgaben etc. immer englisch verwenden.

## Dokumentation
- Die Dokumentation ist zweisprachig: englisch und deutsch.
  - Pro Sprache eine Datei mit i18n Suffix, wie `_de` oder `_en`.
- Im Projekt-Root gibt es die Readme, Details, Bilder etc. kommen in den Unterordner `docs`. 
- Die Dokumentation so strukturieren, dass sie für Menschen gut erfassbar ist. Zum Beispiel:  statt einer langen README.md, dort nur eine Übersicht mit links zu den Details in separaten Dateien.
- Verwende Mermaid Diagramme, wenn es einen Mehrwert bietet.
- Erzeuge Screenshots und binde sie ein, wenn es einen Mehrwert bietet.

## Organisation
Als Hilfestellung: stell dir vor, der Entwickler hat ADHS und möchte mit möglichst wenig Aufwand wieder in das Projekt einsteigen.

- Es gibt im Hauptverzeichnis die Datei `next_step.md`.
- Die `next_step.md` muss immer aktuell gehalten werden.
- Die `next_step.md` wird ausschließlich in deutscher Sprache gepflegt.
- Den Anfang bildet die Sektion, wo in der kürzest möglichen Form steht, was ich tun muss, um das Projekt auszuführen.
- In der zweiten Sektion steht, was ein kleiner möglicher Einstiegspunkt sein könnte.
  - Der Einstiegspunkt ist im Idealfall ein kleine Feature.
  - Es muss nicht wichtig sein.
  - Es sollte aber interessant sein und ein schnelles Erfplgserlebnis bieten.
  - Es geht darum, nach eine längeren Pasue, den Einstieg zu finden.
- Danach soll es eine Sektion geben, welche den aktuellen Zustand in knapper Form beschreibt.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **rezept-graph** (864 symbols, 1401 relationships, 35 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> Index stale? Run `node .gitnexus/run.cjs analyze` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? `npx gitnexus analyze` (npm 11 crash → `npm i -g gitnexus`; #1939).

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows. For regression review, compare against the default branch: `detect_changes({scope: "compare", base_ref: "main"})`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `query({search_query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).

## Never Do

- NEVER edit a function, class, or method without first running `impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit changes without running `detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/rezept-graph/context` | Codebase overview, check index freshness |
| `gitnexus://repo/rezept-graph/clusters` | All functional areas |
| `gitnexus://repo/rezept-graph/processes` | All execution flows |
| `gitnexus://repo/rezept-graph/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
