# Anforderungen

- Realistische Zutatenbeschriftungen samt Mengen/Einheiten/ausdrücklich unterstützten Zusätzen auf bestehende Motive abbilden: Eier, Mehl, Zucker, Butter, Äpfel aus den im Proposal genannten Beispielen. Einfache bisherige Aliasse erhalten, Eingabe begrenzen, Texte/Rezeptdaten nicht verändern.
- Alternativen, Mischungen, Verneinungen, Ei-Ersatz und Apfelsaft nicht fälschlich erkennen. Keine beliebige Teilzeichenfolgensuche oder ID-Verknüpfung, keine unsicheren Pfade.
- Eindeutige Back-/Vorheiz-/Koch-/Brataktionen in vollständigen Sätzen erkennen; vorhandenes nichtleeres action-Feld bevorzugen. Reine Geräte-/Temperaturangaben, widersprüchliche und verneinte Aktionen ablehnen. Zwischenzustände ohne Motive.
- Bereinigte reale Apfelkuchen-Fixture offline durch Beschaffung, Cache und echtes Rendering prüfen: sichtbare Icons in SVG und PNG, bewusst nicht passende Knoten ohne Icons, eine Beschaffung je Motiv und unveränderte Rezept-/Zutatenbytes. Modi, Darstellungshinweise, Kanten, Originale und Timeline erhalten. Keine Live-Provider in automatisierten Tests.

Normative Szenarien: [spec.md](specs/recipe-icon-motif-resolution/spec.md).
