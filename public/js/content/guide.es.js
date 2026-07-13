// Contenido en español — mirrors content/guide.en.js (canonical). Keep structure identical.
export const GUIDE_HUMAN = `# Tus primeros 30 minutos

IR Kit funciona con un solo bucle: **registra lo que pasó → el panel calcula lo que importa → el update se lo cuenta a tus inversores.** Configúralo una vez y luego es ~1 hora al mes.

> ¿Trabajas con un agente de código? Sáltate casi toda la entrada manual de abajo — dile **«ir start»** y poblará el sistema desde tus documentos reales, con tu consentimiento en cada paso. Mira la pestaña «Con tu agente».

## 1. Hazlo tuyo (Ajustes, 3 min)
Configura nombre de la empresa, fundador, email, objetivo de la ronda y el día del mes en que sale tu update. Deja la **bandera de ejemplo activada** hasta que tus datos reales hayan reemplazado el ejemplo en todas partes — la etiqueta ámbar SAMPLE de la barra lateral te recuerda que aquí todavía nada es real.

## 2. Introduce tus finanzas (Finanzas, 10 min)
Fija la **caja inicial** (saldo bancario antes de tu primer mes) y luego una fila por mes: desglose de ingresos, nómina/infra/otros costes, entradas de financiación, plantilla y tus métricas de tracción. ¿Te falta algo? Déjalo en blanco — nunca lo adivines. Las columnas calculadas (ingresos, costes, P&L, caja) y el panel se actualizan mientras escribes.

Empieza con los últimos 6–12 meses si los tienes: el histórico es lo que hace creíbles tus cifras de MoM y runway.

## 3. Introduce tu cap table (Cap table, 10 min)
- **Accionistas:** acciones del fundador, opciones asignadas, pool sin asignar — según los documentos de constitución, no de memoria.
- **Libro de SAFEs:** cada SAFE firmado: principal, cap, descuento, fecha, estado. Si no estás seguro de un término, busca el PDF firmado y compruébalo — el «no estoy seguro» sobre tu propio cap table es lo que la due diligence castiga más duro.
- ¿Nuevo en esto? Lee antes la pestaña «Cap table 101».

## 4. Configura a tus inversores (CRM de inversores, 5 min)
Añade a los inversores actuales y a todos los que deban recibir updates (pestaña de lista de envío, con segmentos). Si estás levantando, añade tu pipeline a Compromisos.

## 5. Envía tu primer update (Updates, continuo)
El editor rellena tus métricas reales — completa los corchetes, recorta hasta 3 minutos de lectura, envía con el botón BCC y pulsa **Enviado → archivo**. El archivo es lo importante: un futuro inversor líder lo leerá de principio a fin, y una racha ininterrumpida es la credibilidad más barata que puede tener una startup.

## El ritmo mensual desde aquí
| Cuándo | Qué | Dónde |
|---|---|---|
| Fin de mes + 10 días máx. | Cierre del mes | Finanzas |
| El mismo día | Revisar burn/runway/alertas | Panel |
| Día de update (lo fijas tú) | Enviar el update | Updates |
| Cada SAFE firmado | Libro + CRM + lista de envío, el mismo día | Cap table + CRM |
| Trimestral | Pack de consejo/inversores | Playbooks → Pack de consejo |

Descarga el archivo de calendario en Updates para llevar este ritmo a tu calendario real.`;

export const GUIDE_AGENT = `# Operar IR Kit con tu agente

Tu agente de código (Claude Code, Codex, Cursor, etc.) es un **par de esta interfaz**, no un apaño encima. Trabaja a través de la línea de comandos \`ir\`, que impone las mismas reglas que esta UI — tú decides, el agente hace el trabajo mecánico. Ese es tu «equipo de IR de diez personas».

## De la descarga a un panel con datos reales — di «ir start»
1. **Consigue el kit:** \`git clone https://github.com/howieyoung/ir-kit && cd ir-kit\`
2. **Arranca la app:** \`node server.js\` → http://127.0.0.1:2330 — funciona al instante con una empresa de ejemplo.
3. **Abre tu agente en la carpeta del repo** (Claude Code, Codex, Cursor…) y di: **«ir start»**. Ese es todo el truco — el agente crea todo (incluida una **bandeja de entrada** de documentos), enuncia las reglas de privacidad y te guía desde ahí.
4. **Suelta tus documentos en la bandeja** (\`ir-workspace/inbox/\`) — SAFEs, extractos bancarios, cap tables, decks, sin ordenar está perfecto. ¿Documentos dispersos por el disco? El agente puede hacer \`ir scan\` de carpetas que tú designes (solo nombres de archivo; nada se abre sin tu OK).
5. **Lo archiva todo** en las categorías correctas del data room con \`ir sort\` — **re-ejecutable en cualquier momento**; un servicio de archivo permanente, no un evento único.
6. **Con tu consentimiento extrae:** tu cap table real, SAFEs y finanzas mensuales — cada número citado a un documento fuente; lo ambiguo queda en una lista de dudas, nunca se adivina.
7. **Verifica y tú confirmas:** \`ir check\` pasa limpio, repasa contigo el panel contra las citas, y solo entonces se apaga la bandera de ejemplo. Si no aportas documentos, el panel simplemente conserva los datos de ejemplo.

A partir de ahí, el ritmo mensual — los rituales y el calendario de abajo.

## El viaje completo del maestro de IR
No necesitas saber de relaciones con inversores — delegas cada tarea a tu agente en lenguaje llano. El arco completo y el ritual detrás de cada paso:

| Quieres… | Dile a tu agente | Ritual |
|---|---|---|
| Configurar desde tus documentos reales | **«ir start»** | \`onboard.md\` |
| Construir un data room limpio | «Audita mi data room contra las checklists» | \`data-room-audit.md\` |
| **Encontrar inversores afines + contactar** | «Lee prompts/investor-sourcing.md y busca inversores que nos encajen» | \`investor-sourcing.md\` |
| Preparar una reunión con un inversor | «Prepárame la reunión con [inversor]» | \`meeting-prep.md\` |
| Enviar el update mensual | «Redacta el update de este mes» | \`draft-update.md\` |
| **Dirigir un consejo** | «Lee prompts/board-meeting.md y organiza mi consejo del [fecha]» | \`board-meeting.md\` |
| **Dirigir una junta de accionistas** | «Lee prompts/shareholder-meeting.md y prepara mi junta» | \`shareholder-meeting.md\` |
| Arrancar una ronda | «Modela mi ronda y arma el plan de pipeline» | \`round-kickoff.md\` |

Todo corre en tu máquina, cita tus números reales y no redacta nada que se envíe sin ti.

## La interfaz: la CLI ir
Referencia completa con ejemplos: [docs/CLI.md](docs/CLI.md).

\`\`\`
# empezar
ir start              configuración guiada — crea todo, detecta tu etapa, imprime el siguiente paso
ir sort               archiva los documentos de la bandeja en el data room (re-ejecutable)

# leer
ir status [--json]    todas las métricas derivadas en una llamada — sitúate primero
ir check              la suite de tests — tras CUALQUIER edición directa de data/*.json
ir model round --pre 12000000 --new 3000000    conversión de SAFEs en ronda con precio

# escribir (invariantes garantizadas)
ir close-month 2026-07 --saas 31000 --ads 14000 --payroll 34000 ...
ir safe add "Fund X" --principal 50000 --cap 8000000 --status Signed
ir prospect add "Acme Capital" --fit "leads pre-seed dev-tools" --source "<url>"
ir update draft | mark-sent

# onboarding y entregables
ir scan <folders>     documentos financieros candidatos — solo nombres, nunca se abren
ir export board-pack | tearsheet | captable
ir schedule show      líneas de cron para los rituales mensuales
\`\`\`

Tres reglas que el agente sigue (y tú también deberías):
1. **Prefiere los verbos \`ir\` a editar JSON** — un solo \`safe add\` reconcilia el libro del cap table, el compromiso en CRM, la ficha del inversor y la lista de envío; una edición manual puede desincronizarlos en silencio.
2. **Tras editar JSON directamente, ejecuta \`ir check\`** — exit 1 significa que rompiste una invariante; arregla antes de nada.
3. **Nunca inventes un número.** Los datos ausentes quedan en null; los meses sin cerrar bloquean el borrador del update.

## Los rituales (prompts/)
Cada tarea recurrente de IR tiene un prompt canónico en [prompts/](prompts/) — copia, rellena los corchetes, pega. Todos pasan por los verbos de la CLI:

| Prompt | Qué hace el agente |
|---|---|
| \`onboard.md\` | **Empieza aquí** — con consentimiento por etapas: escanea tus carpetas, organiza el data room, puebla datos reales con una cita por número |
| \`investor-sourcing.md\` | Investiga inversores afines, registra cada uno con \`ir prospect add\` (encaje + fuente), redacta outreach personalizado — nunca envía |
| \`monthly-close.md\` | \`ir close-month\` + explica cada alerta, revisa las promesas del último update |
| \`safe-signed.md\` | \`ir safe add\` + informe de límites + acciones del mismo día |
| \`draft-update.md\` | \`ir update draft\` para el esqueleto, luego escribe la narrativa con tu material |
| \`meeting-prep.md\` | Brief de una página: historial con ese inversor, números a saberse de memoria, sus 3 preguntas más difíciles |
| \`board-meeting.md\` | \`ir export board-pack\` + agenda, convocatoria, pre-lectura, resoluciones y plantilla de acta |
| \`shareholder-meeting.md\` | Convocatoria de junta, agenda, resoluciones, hoja de votación del cap table, poder, acta |
| \`data-room-audit.md\` | Recorre tu data room contra las checklists por niveles y entrega una lista de pendientes por gravedad |
| \`round-kickoff.md\` | Modela la ronda, siembra el pipeline en CRM, arma el plan de ronda por lotes |

## Ponlo en un calendario
La parte mecánica ni siquiera necesita un agente — \`ir update draft\` es determinista:

\`\`\`
# crontab -e   (o: ir schedule show)
0 9 1 * *  cd ~/ir-kit && ./bin/ir.js status          # día 1: recordatorio de cierre
0 9 3 * *  cd ~/ir-kit && ./bin/ir.js update draft    # día 3: borrador esperando revisión
0 9 * * 1  cd ~/ir-kit && ./bin/ir.js check           # lunes: integridad de datos
\`\`\`

Añade una ejecución del agente encima para la narrativa (highlights/lowlights) — recetas y reglas de seguridad en [prompts/schedule-updates.md](prompts/schedule-updates.md). Los borradores nunca se auto-envían: la revisión y el envío siguen siendo tuyos.

## Extender el kit
El código está hecho a propósito para que un agente lo edite: JS puro sin dependencias, sin build. Pide a tu agente un módulo nuevo («añade seguimiento de ESOP», «soporte multidivisa») y señálale [AGENTS.md](AGENTS.md) — las convenciones están escritas: las operaciones nuevas van en \`core/ops.js\` con su verbo de CLI, las matemáticas viven en \`public/js/metrics.js\`, las páginas nuevas se registran en \`app.js\`. Al extender, mantén la promesa: cero dependencias, local-first y \`ir check\` en verde.`;

export const CAPTABLE_101 = `# Cap table 101 — la versión de diez minutos

¿Nunca has visto un cap table? Esto es lo mínimo para usar la página «Cap table» con confianza. (Conocimiento para planificar, no asesoría legal.)

## Lo básico
Tu **cap table** es la lista de quién posee qué. La propiedad se cuenta en **acciones**; tu porcentaje es tus acciones divididas por todas las acciones — en base **totalmente diluida**, que incluye el **pool de opciones** (acciones reservadas para futuros empleados) aunque nadie las tenga todavía. Ese es el denominador honesto, y es el que usan los inversores.

## Los SAFEs, en llano
Un **SAFE** es dinero ahora por acciones después: el inversor transfiere hoy y recibe acciones cuando levantas una **ronda con precio**. El término clave es el **valuation cap** — en el **SAFE post-money** estándar, la participación del inversor justo antes de tu ronda con precio es simplemente:

**participación implícita = principal ÷ cap post-money** (p. ej., $100K con cap de $8M = 1,25%)

Por eso el libro de SAFEs muestra el «% implícito». Dos reglas de oro que el kit hace visibles:
- Mantén la **participación implícita total de los SAFEs por debajo de ~15%** antes de poner precio a una ronda — los SAFEs post-money se acumulan y esa dilución **la absorben solo los fundadores**.
- Mantén todos los SAFEs con **los mismos términos**. Una pila de caps distintos es un desastre de due diligence y señala poca convicción.

Un **descuento** (p. ej., 20%) permite al SAFE convertir a un precio más barato que el de los nuevos inversores; si hay cap y descuento, el inversor se queda con el que le resulte mejor.

## Qué muestra el modelador de ronda
Cuando por fin levantas una ronda con precio, pasan tres cosas a la vez: los SAFEs se convierten en acciones, el pool de opciones suele **recargarse** hasta un % objetivo y entran nuevos inversores. Los porcentajes de todos se mueven. El modelador hace esas cuentas con la mecánica real del SAFE post-money — cambia la valoración pre-money, el importe y el objetivo de pool, y mira quién acaba con qué. Fundadores: revisad la pestaña de **escenarios de dilución** — si entráis a la Serie A por debajo de ~50%, el momento de repensar tamaños de ronda o caps es *ahora*, no con el term sheet en la mesa.

## Qué muestra el waterfall de salida
Los inversores suelen tener **acciones preferentes** con **preferencia de liquidación 1x**: en una venta, recuperan primero su dinero *o* convierten a su porcentaje — lo que pague más. El waterfall muestra quién recibe qué a distintos precios de venta, incluido dónde las ordinarias (tú y tu equipo) empiezan a ver dinero de verdad. **MOIC** es el múltiplo del capital invertido.

## Los tres números que hay que saberse de memoria en cualquier reunión
1. Participación implícita total de los SAFEs hoy.
2. % del fundador tras la próxima ronda con precio (escenario base).
3. Tu runway en meses.

Los tres están en pantalla en este kit a dos clics. Un «te lo confirmo luego» sobre tu propio cap table termina reuniones.`;

export const GLOSSARY = `# Glosario

| Término | Significado |
|---|---|
| ARR (ingresos anualizados) | Ingresos del mes × 12. No es lo mismo que ARR contratado — etiqueta con honestidad |
| Burn (neto) | Costes menos ingresos del mes; entradas de financiación excluidas |
| Cap (valuation cap) | La valoración usada para convertir un SAFE — cap más bajo = más acciones para el inversor |
| Data room | La carpeta organizada de documentos que un inversor revisa en due diligence |
| Dilución | Tu % se encoge al emitirse acciones nuevas para inversores/pool — tu *número* de acciones no cambia |
| Descuento | El SAFE convierte a (1 − descuento) × el precio de la ronda; el inversor toma lo mejor entre cap y descuento |
| Totalmente diluido (FD) | Recuento de acciones incluyendo todas las opciones y el pool sin emitir — el denominador honesto |
| Preferencia de liquidación | Los preferentes recuperan su dinero primero en una salida (1x no participativa = recuperar O convertir, no ambas) |
| MFN | Side letter de «nación más favorecida» — si un inversor posterior logra mejores términos, este los recibe también. Por eso los tratos secretos siempre afloran |
| MoM | Crecimiento mes a mes. Indica la ventana al citar un promedio |
| MOIC | Múltiplo sobre el capital invertido — lo que recibe el inversor ÷ lo que puso |
| Pool de opciones | Acciones reservadas para el equipo futuro; se recarga en las rondas, normalmente diluyendo a los fundadores |
| SAFE post-money | El SAFE estándar de YC (2018+): participación fijada en principal ÷ cap justo antes de la ronda |
| Post-money / pre-money | Valor de la empresa después / antes del dinero nuevo: post = pre + ronda |
| Pro-rata | Derecho del inversor a volver a invertir para mantener su % en rondas futuras |
| Ronda con precio | Financiación de capital a un precio por acción negociado (seed, Serie A…) — donde convierten los SAFEs |
| Runway | Caja ÷ burn mensual medio = meses hasta quedarse sin caja |
| SAFE | Simple Agreement for Future Equity — dinero ahora, acciones en la próxima ronda con precio |
| Side letter | Términos extra concedidos a un inversor junto a su SAFE — deben revelarse en due diligence |
| 409A | Valoración independiente de las acciones ordinarias; obligatoria antes de conceder opciones en EE. UU. |`;
