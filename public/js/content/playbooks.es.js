// Contenido en español — mirrors content/playbooks.en.js. Same ids, order, checkbox counts.
export const DOCS = [
  {
    id: 'updates',
    title: 'Doctrina de updates',
    md: `# Doctrina del update a inversores

**Cadencia: el mismo día cada mes** (recomendado: el 5, tras el cierre). La racha ininterrumpida es en sí misma el activo de confianza que un futuro inversor líder someterá a due diligence. **Nunca te saltes un mes malo** — desaparecer se lee (correctamente) como malas noticias.

## Reglas de escritura
1. **Métricas primero, narrativa después.** Los inversores escanean la tabla antes de leer una palabra.
2. **Las mismas métricas, el mismo orden, cada mes.** Cambiar definiciones a mitad de camino destruye la credibilidad. Si es inevitable, marca explícitamente lo viejo frente a lo nuevo.
3. **Los lowlights son obligatorios.** Los inversores juzgan a los fundadores más por la calidad de sus lowlights que por la de sus highlights. Problema + aprendizaje + cambio = madurez operativa.
4. **Los asks son el retorno.** «Presentación al responsable de audiencia de Condé Nast» consigue acción; «presentaciones a empresas de medios» se ignora. Máximo 1–3.
5. **Lectura de 3 minutos.** Recorta hasta que duela.

## Segmentos
| Segmento | Quién | Recibe |
|---|---|---|
| Board/Major | Líderes, consejo, observadores | Update completo + detalle financiero |
| All investors | Cada titular de un SAFE | Update mensual completo |
| Prospect nurture | Los que dijeron «demasiado pronto» | El mismo update — seis meses de 80% MoM convierten un «no» en una segunda reunión calurosa |

Envía solo por BCC o mail-merge — el CC filtra tu cap table y tu lista de prospectos a la vez.

## La mirada de la due diligence
Un inversor líder leerá tu archivo completo de una sentada y puntuará: ¿aparecen las mismas métricas cada mes? ¿Se cumplieron los planes anunciados? ¿Los lowlights salieron a la luz antes de volverse crisis? ¿Los asks son concretos y cierras los círculos con agradecimientos? Escribe cada update para ese lector.`,
  },
  {
    id: 'fundraising',
    title: 'Proceso de ronda',
    md: `# Playbook de fundraising — por lotes, no por goteo

El modo de fallo nº 1 en pre-seed es el contacto secuencial durante seis meses. Sustitúyelo por un proceso paralelo comprimido:

## Puerta de preparación — no agendes reuniones hasta que todo sea cierto
- [ ] Data room de nivel 1 completo (ver pestaña «Data room»)
- [ ] Deck + memo con fecha y números coherentes en todos los materiales
- [ ] Respuestas del FAQ ensayadas (ver pestaña «FAQ de inversores»)
- [ ] Pestaña de compromisos del CRM en marcha

## El lote
- **Semanas 1–2:** presentaciones cálidas + fondos prioritarios, 15–20 primeras reuniones dentro de una ventana de 2 semanas. La densidad crea urgencia; la urgencia mueve términos.
- **Semanas 3–4:** segundo nivel + todos los que pidieron «unas semanas». Anuncia los primeros compromisos blandos («$200K de $500K»).
- **Semanas 5–6:** fecha límite dura. Los SAFEs cierran sobre la marcha — nunca dejes esperando un cheque comprometido.
- **Cada viernes durante la ronda:** actualiza los compromisos y envía una nota de estado de 3 líneas a los comprometidos.

## Mecánica de reunión → cierre
1. Primera reunión → seguimiento el mismo día con memo + siguiente paso concreto.
2. Interés serio → acceso al data room, registrado en CRM.
3. Sí verbal → SAFE enviado en 24h (DocuSign), datos bancarios en el mismo correo.
4. Firmado + transferido → el mismo día: contrafirma, agradecimiento, alta en la lista de envío, registro en el libro del cap table.
5. Rechazo → agradece, pregunta qué les haría cambiar de opinión, muévelos a nurture. Un «no» + una racha fuerte de updates es el lead de seed más cálido que conseguirás jamás.

## Disciplina de caps
- Términos uniformes para cada cheque. Una pila de SAFEs con caps distintos es un lío de due diligence y señala poca convicción.
- Los SAFEs post-money se acumulan — los fundadores absorben el 100% de esa dilución. Mantén el total por debajo de ~15% antes de la ronda con precio (la pestaña de cap table lo calcula en vivo).
- Nunca digas el nombre de un fondo a otro fondo sin permiso. Nunca infles las cifras comprometidas — los fondos comparan notas.
- Responde toda pregunta de due diligence en 24h; la latencia se lee como anticipo del trato post-inversión.`,
  },
  {
    id: 'dataroom',
    title: 'Data room',
    md: `# Checklist del data room

Alójalo en un drive con permisos o en DocSend. Cada documento con fecha y versión. Registra quién tiene acceso.

## Nivel 1 — ronda actual (tenlo listo YA)
- [ ] One-pager / memo de inversión
- [ ] Pitch deck (con fecha)
- [ ] Vídeo demo del producto o acceso sandbox
- [ ] Certificado de constitución + good standing
- [ ] Resumen de métricas con definiciones escritas
- [ ] Evidencia de uso/tráfico (los inversores VERIFICARÁN tu cifra estrella)
- [ ] Lista de clientes: de pago vs. gratuitos, tipo de contrato; renovaciones destacadas
- [ ] Detalle de ingresos: la serie mensual que sustenta el crecimiento
- [ ] Exportación actual del cap table
- [ ] Todos los SAFEs firmados + side letters (una side letter sin revelar dinamita la confianza — las cláusulas MFN la sacarán a la luz igualmente)
- [ ] Modelo de SAFE de esta ronda
- [ ] Extracto bancario que respalde la caja declarada
- [ ] Cesiones de PI: fundador + cada ingeniero + cada contractor (el tropiezo nº 1 de la due diligence pre-seed)

## Nivel 2 — data room de ronda con precio (constrúyelo en 6 meses)
- [ ] Estatutos y todos los consentimientos de consejo/socios
- [ ] Libro de acciones + 409A (necesario antes de conceder opciones)
- [ ] Plan de opciones + papeleo de concesiones
- [ ] Documentos de financiaciones previas (incl. términos de aceleradoras)
- [ ] Contratos de clientes (top 10 + contrato tipo)
- [ ] Política de reconocimiento de ingresos
- [ ] Histórico de churn/renovaciones (documentado)
- [ ] Contratos laborales, cadena completa de PI, registros de marca
- [ ] Modelo operativo a 18 meses (supuestos con fuentes)`,
  },
  {
    id: 'board',
    title: 'Pack de consejo',
    md: `# Pack de consejo / reunión de inversores

¿Aún sin consejo formal? Hazlo trimestralmente con tus inversores principales de todas formas — el músculo de gobernanza y el rastro documental se cobran en la ronda con precio.

**Envía el pack 72 horas antes. Nunca presentes diapositivas que no se hayan pre-leído — el tiempo de reunión es para discutir, no para narrar.** ≥50% de la agenda en puntos de Discutir/Decidir.

## Esqueleto de agenda (60–90 min)
| Tiempo | Punto | Tipo |
|---|---|---|
| 0:00 | Apertura del CEO: lo único que importa este trimestre | Informar |
| 0:05 | Revisión de métricas y finanzas (solo Q&A de lo pre-leído) | Informar |
| 0:15 | Inmersión 1: la pregunta estratégica más difícil ahora | **Discutir** |
| 0:35 | Inmersión 2 | **Discutir** |
| 0:50 | Fundraising / estrategia de caja | Discutir |
| 0:60 | Asks, aprobaciones, consentimientos formales | **Decidir** |

## Carta del CEO (una página, prosa)
Estado de la empresa en 3 frases · lo que dije el trimestre pasado vs. lo que pasó · las 1–2 decisiones donde necesito ayuda · lo que me quita el sueño.

## Acta (circular en 48h)
Decisiones tomadas (numeradas, redacción exacta) · consentimientos aprobados · acciones (responsable + fecha) · temas tratados (2–3 líneas cada uno — no es una transcripción).

## Registro de consentimientos y resoluciones
Registra cada acto societario desde el día uno: emisiones de SAFEs, concesiones de opciones, adopciones de 409A. En la ronda con precio, los abogados lo pedirán todo — un registro mantenido convierte tres semanas de arqueología en una hora.`,
  },
  {
    id: 'faq',
    title: 'FAQ de inversores',
    md: `# Las preguntas difíciles — marcos de respuesta

Rellena con datos actuales antes de cada reunión; cada respuesta, ~45 segundos.

**«Mucho tráfico, pocos ingresos — ¿por qué?»** Reconócelo como secuencia, no como fracaso. Primero el activo de distribución; la monetización se encendió en [fecha] — la curva MoM demuestra que funciona ahora. La versión honesta desarma; la defensiva descalifica.

**«Defiende tus supuestos de upside publicitario.»** Lo medido gana a lo modelado: presenta primero datos reales de campañas y etiqueta el resto como modelado. Nunca dejes que una cifra modelada pase por medida — ese es el momento de credibilidad de toda la reunión.

**«¿Riesgo de fundador único?»** En realidad preguntan si puedes reclutar un banquillo. Evidencia de resiliencia + propiedad real de los sistemas por parte del equipo + mitigación con nombre (documentación, redundancia, equity de retención).

**«¿Por qué las plataformas no lo construyen ellas o usan una herramienta comunitaria estándar?»** Nombra la cuña (embebido nativo, cero fuga de datos) y el foso (el activo de datos generado dentro del producto). Ten una anécdota real de cliente en la que ganaste exactamente esa comparación.

**«¿Qué términos tienen tus inversores actuales?»** Respuesta instantánea y precisa — titubear es la bandera roja. Libro exportable a petición.

**«¿Por qué esa cantidad?»** La ronda debe alcanzar un hito que ponga precio a la siguiente, no solo alargar la supervivencia. Cita la tabla de escenarios de runway.

**«¿Qué pasa con todos estos SAFEs en la ronda con precio?»** Haz la conversión en vivo con el modelador. Un fundador que domina su propia dilución gana más confianza que cualquier diapositiva.

**Meta-regla:** cualquier pregunta de métricas debería responderse desde este kit en 30 segundos. «Te lo confirmo luego» sobre tus propios números = reunión terminada.`,
  },
  {
    id: 'metrics',
    title: 'Definición de métricas',
    md: `# Definición de métricas — la hoja de respuestas de la due diligence

| Métrica | Definición | Trampa |
|---|---|---|
| Ingresos totales | SaaS + publicidad reconocidos en el mes | Nunca mezcles créditos o subvenciones en ingresos |
| ARR anualizado | Ingresos del mes × 12 | No llames «ARR» al anualizado ante un inversor SaaS |
| ARR contratado | Solo el valor anualizado de contratos anuales firmados | Si divergen, informa ambos |
| Crecimiento MoM | Variación mensual de ingresos totales | Todo «MoM medio» debe indicar la ventana de promedio |
| Tráfico | Visitas únicas mensuales donde el producto llegó a renderizarse | «Cargado y renderizado», no «script instalado» |
| Burn neto | Costes menos ingresos (caja) | Las entradas de financiación no cuentan en el burn |
| Runway | Caja ÷ burn medio de 3 meses | Calcular con el burn del último mes favorece la cifra; no lo hagas |
| NRR | Retención neta de ingresos por cohortes anuales | Empieza a registrar cohortes YA — de ahí saldrá el dataset de la Serie A |

Cuando cambie una definición: versiónala aquí, marca lo viejo vs. lo nuevo en el próximo update y reexpresa el mes anterior de ambas formas.`,
  },
];
