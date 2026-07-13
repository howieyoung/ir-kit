# IR Kit — Español

**Gestiona las relaciones con inversores como si tuvieras un equipo de diez — aunque solo estéis tú y un agente de IA.**

IR Kit es un sistema de relaciones con inversores open source y local-first: cap table con cálculo de conversión de SAFEs, panel financiero (burn/runway), CRM de inversores, updates mensuales en el formato estándar del sector, checklists de data room y playbooks operativos — diseñado para trabajar con agentes de código (Claude Code, Codex, Cursor…).

## Inicio rápido

```bash
git clone https://github.com/howieyoung/ir-kit && cd ir-kit
node server.js        # Node 18+, cero dependencias — la instalación es solo esto
# → http://127.0.0.1:2330
```

## El primer día son dos palabras: dile a tu agente «ir start»

1. Arranca la app (funciona al instante con una empresa de ejemplo).
2. Abre tu agente en la carpeta del repo — lee AGENTS.md automáticamente.
3. Di: **«ir start»**. El agente crea todas las carpetas (incluida la bandeja de entrada de documentos), explica las reglas de privacidad y te guía desde ahí.
4. Suelta todos tus documentos financieros/de la empresa en la bandeja — SAFEs, extractos bancarios, cap tables, decks; sin ordenar está bien.
5. `ir sort` archiva cada documento en la categoría correcta del data room — **re-ejecutable en cualquier momento**; es un servicio de archivo permanente.
6. Con tu consentimiento, el agente lee los documentos y construye tu cap table real, el libro de SAFEs y las finanzas mensuales — **cada número con su cita (archivo + página)**; lo ambiguo va a una lista de dudas, nunca se inventa.
7. `ir check` pasa, confirmas los números, y el panel muestra tus datos reales. ¿No aportas documentos? Se mantienen los datos de ejemplo.

## Privacidad (arquitectura, no política)

- Tus datos son JSON local (`data/`) y carpetas de documentos (`ir-workspace/`) — **ambos en .gitignore**: no pueden filtrarse al repo público.
- El servidor solo escucha en localhost por defecto; en la demo pública, tus datos viven solo en tu navegador.
- Sin cuentas, sin nube — nadie debería subir su cap table a ningún sitio para hacer buen IR.

## Idiomas

Cambia el idioma desde la barra lateral (inglés, chino tradicional, japonés, coreano, español, francés). El tutorial completo está en español: [Tutorial (español)](TUTORIAL.es.md); la referencia de la CLI es canónica en inglés: [CLI](../CLI.md) · [Contribuir](../../CONTRIBUTING.md) (todo PR debe mantener cobertura completa de los 6 idiomas).

Licencia MIT · [Demo en vivo](https://howieyoung.github.io/ir-kit/) · [English README](../../README.md)
