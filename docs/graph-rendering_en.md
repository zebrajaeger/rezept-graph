# Automatic graph rendering

[Overview](../README.md) · [Deutsch](graph-rendering_de.md)

The output layer owns the asynchronous image-rendering adapter. Presentation and
Mermaid serialization remain pure. The workflow awaits all five outputs before
the CLI prints success. The installed Mermaid CLI is launched through Node with
argument arrays and no shell, using the same staged source for SVG and PNG.

Images are staged together, validated as nonempty files, and published only after
both renders succeed. On failure both destination images are removed, while current
JSON, ingredients, and Mermaid remain available. Unrelated files are untouched.
Each invocation has a 60-second timeout and bounded diagnostics. Concurrent writers
and crash-atomic publication are not supported.
