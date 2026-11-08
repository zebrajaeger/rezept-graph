# Automatisches Graph-Rendering

[Übersicht](../README.md) · [English](graph-rendering_en.md)

Die Ausgabeschicht besitzt den asynchronen Bild-Rendering-Adapter. Präsentation
und Mermaid-Serialisierung bleiben rein. Der Workflow wartet auf alle fünf Ausgaben,
bevor die CLI Erfolg meldet. Die installierte Mermaid CLI startet über Node mit
Argumentlisten ohne Shell; SVG und PNG verwenden dieselbe temporäre Quelle.

Beide Bilder werden zunächst temporär erzeugt, auf nichtleere Dateien geprüft und
erst nach erfolgreichem Rendering veröffentlicht. Bei Fehlern werden beide Bildziele
entfernt; aktuelles JSON, Zutatenliste und Mermaid bleiben erhalten. Andere Dateien
bleiben unangetastet. Pro Aufruf gelten 60 Sekunden Zeitlimit und begrenzte Diagnosen.
Gleichzeitige Schreiber und absturzatomare Veröffentlichung werden nicht unterstützt.
