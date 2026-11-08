## Kontext und Ziel

Im realen Apfelkuchen-Lauf wurden 0/21 Knoten erkannt. Mengen-/Zusatztexte und vollständige Prozessformulierungen scheitern an den bisherigen exakten Regeln. Ziel ist gezielte deterministische Erkennung, nicht allgemeines Sprachverständnis.

## Entscheidungen

1. Reine begrenzte Normalisierung auf einer Kopie; ausdrücklich definierte Mengen, Einheiten und Zusätze konsumieren, danach vollständige Zutatenform prüfen. Keine beliebige Teilzeichenfolgensuche und keine unbegrenzten Regex-Eingaben.
2. Positive Fälle: `3 Eier, Größe M`, `250 g Mehl`, `125 g Zucker für den Teig`, `60 g Butter zum Bestreichen`, `1,5 kg Äpfel`. Negative Fälle: `Margarine oder Butter`, `Zucker oder Zimtzucker`, `Butter und Mehl`, `Ei-Ersatz`, `Apfelsaft`, `Etwas Fett für die Form`. Nicht alle Texte nach „für“/„zum“ blind abschneiden.
3. Aktionen auch mit Zeitpräfix erkennen: `Backofen vorheizen`, `Erste 45 Minuten backen`, `Kuchen fertig backen`. Gerät allein, Temperatur, Verneinung und widersprüchliche Alternativen reichen nicht. Vorhandenes nichtleeres action-Feld bevorzugen; nur bei fehlendem/leerem Feld den Knotentext verwenden.
4. Pure Motivauflösung und vorhandene sichere Schlüssel erhalten. Keine Zutaten-/Knoten-ID-Verknüpfung erfinden, keine Rezeptdaten ändern. Bibliothek, Cache, Budget und Rendering weiterverwenden.
5. Bereinigte reale Fixture und Offline-Tests zuerst: positive/negative Zuordnung, eine Beschaffung je Motiv, sichtbare Bilder im echten SVG/PNG, unveränderte Rezept-/Zutatenbytes und Timeline-Regressionen. Kein kostenpflichtiger Aufruf für diese Abnahme.

## Grenzen und Umsetzung

Unbekannte Formulierungen bleiben bewusst Text. Unterstützte Mengen-/Einheiten-/Zusatzgrammatik in Tests und Dokumentation benennen. Abhängig vom aktiven Change `add-generated-recipe-icons`, ohne dessen Sicherheitsabnahme zu ersetzen. Vor Codeänderungen GitNexus-Impact prüfen, Tests zuerst schreiben. Keine Datenmigration, keine automatische Archivierung, kein Live-Test ohne separate Freigabe. Abschalten über `icons.mode: off` möglich.
