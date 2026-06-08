# MANUAL DE OPERACIONES — MIKOKO v27.0

> **Clasificación:** USO INTERNO — LOCALHOST ONLY
> **Versión del sistema:** 27.0
> **Modo de almacenamiento:** 100% offline, Single Source of Truth (SSOT) en JSON local
> **Última actualización:** junio 2026
> **Doctrina operativa:** Frío, analítico, altamente disciplinado, orientado a la supervivencia.

---

## Índice

1. [¡Bienvenido al Búnker! — Introducción](#1-¡bienvenido-al-búnker!—introducción)
2. [Primer Despegue — Arranque Inicial](#2-primer-despegue—arranque-inicial)
3. [Puesta a Punto Inicial — Onboarding](#3-puesta-a-punto-inicial—onboarding)
4. [Tour Completo del HUD — Cada Rincón del Búnker](#4-tour-completo-del-hud—cada-rincón-del-búnker)
5. [Workflows — Protocolos de Despliegue](#5-workflows—protocolos-de-despliegue)
6. [Modo Simulación (Cuarto de Juegos de Guerra) vs. LIVE (Terreno Real)](#6-modo-simulación-cuarto-de-juegos-de-guerra-vs-live-terreno-real)
7. [El Checksum — El Sistema de Soporte Vital (6 Ejes)](#7-el-checksum—el-sistema-de-soporte-vital-6-ejes)
8. [La Pirámide Estratégica — Doctrina de Asignación de Capital](#8-la-pirámide-estratégica—doctrina-de-asignación-de-capital)
9. [Arquitectura del Sistema — Los Cimientos del Búnker](#9-arquitectura-del-sistema—los-cimientos-del-búnker)
10. [Respaldos y Seguridad — Protocolo de Supervivencia](#10-respaldos-y-seguridad—protocolo-de-supervivencia)
11. [Solución de Problemas — Diagnóstico y Reparación](#11-solución-de-problemas—diagnóstico-y-reparación)
12. [Buenas Prácticas y Doctrina Operativa](#12-buenas-prácticas-y-doctrina-operativa)
13. [FAQ — Base de Conocimiento](#13-faq—base-de-conocimiento)
14. [Glosario de Términos MIKOKO](#14-glosario-de-términos-mikoko)

---

## 1. ¡Bienvenido al Búnker! — Introducción

### 1.1 ¿Qué es MIKOKO?

MIKOKO es un **sistema de mando para la gestión de carteras de criptoactivos**. Opera como un búnker digital autónomo: todo el sistema reside en tu máquina, sin conexión a servidores externos, sin telemetría, sin cuentas de usuario, sin dependencia de servicios en la nube. Tus datos no abandonan tu disco duro.

El mercado de criptoactivos es un **territorio hostil**. La volatilidad, la sobreinformación, el ruido constante y la presión emocional trabajan en tu contra. MIKOKO está diseñado para darte una ventaja estructural: reemplaza la improvisación con **protocolos**, el pánico con **métricas frías**, y la memoria falible con un **registro inmutable**.

No es una herramienta de trading automatizado ni un bot. No ejecuta órdenes ni se conecta a exchanges. Es un **centro de inteligencia y control** para que seas tú quien tome las decisiones, con la mejor información posible, en el menor tiempo posible.

### 1.2 ¿Qué problema resuelve?

Sin un sistema como MIKOKO, gestionar una cartera de criptoactivos implica:

- **Hojas de cálculo dispersas** que se desactualizan y nadie mantiene.
- **Notas sueltas** en el móvil, en apps de notas, en tweets guardados.
- **Registros mentales** de precios de entrada, cantidades y estrategias.
- **Decisiones emocionales** tomadas sin contexto histórico.
- **Dificultad para saber** qué posees realmente, dónde está, cuánto vale y qué riesgo corres.

MIKOKO centraliza toda esa información en un solo lugar, con un solo formato, y con protocolos de registro que garantizan que los datos sean precisos, estén actualizados y sean auditables.

### 1.3 Filosofía operativa

| Principio | Significado |
|-----------|-------------|
| **Single Source of Truth** | Cada dato tiene una única fuente autoritativa. No hay duplicados ni versiones en conflicto. |
| **100% localhost** | Tus datos nunca salen de tu máquina. Sin nube, sin terceros, sin telemetría. |
| **Protocolos sobre impulsos** | Toda acción significativa se ejecuta siguiendo un workflow predefinido. No se improvisa. |
| **Registro inmutable** | Las transacciones no se eliminan ni modifican. El libro mayor es irreversible. |
| **Checksum de integridad** | El sistema audita automáticamente su propio estado y bloquea operaciones si detecta anomalías. |

### 1.4 ¿Qué necesitas para empezar?

- **Node.js** (versión 18 o superior) instalado en tu máquina.
- **npm** (viene con Node.js).
- Un navegador web moderno (Chrome, Firefox, Edge).
- Conexión a Internet (solo para la actualización de precios vía CoinGecko; el resto del sistema funciona sin conexión).

No necesitas:
- Cuenta de usuario ni registro.
- Servicios en la nube ni bases de datos remotas.
- Conocimientos de programación.
- Instalar bases de datos externas (MySQL, PostgreSQL, etc.).

---

## 2. Primer Despegue — Arranque Inicial

### 2.1 Iniciar el sistema

Abre una terminal en el directorio del proyecto y ejecuta:

```bash
npm run dev
```

Este comando hace dos cosas simultáneamente:

1. **Inicia el backend bridge** (servidor Express en `127.0.0.1:5000`).
   - Lee y escribe las 22 bases de datos JSON en el directorio `.obsidian/mikoko-moster/`.
   - Sirve una API REST para que el frontend pueda acceder a los datos.
   - Si es la primera ejecución, **crea automáticamente** las 22 bases de datos con su estructura de envelope inicial.

2. **Inicia el frontend** (servidor de desarrollo Vite + React en `127.0.0.1:3001`).
   - Compila la interfaz de usuario.
   - La abre en tu navegador predeterminado o puedes acceder manualmente.

Verás en la terminal una salida similar a:

```
MIKOKO v27.0 local bridge listening at http://127.0.0.1:5000
Local storage: /home/tu-usuario/mikoko-moster/.obsidian/mikoko-moster
Bridge session: a1b2c3d4-e5f6-7890-abcd-ef1234567890

  VITE v6.0.7  ready in 234 ms
  ➜  Local:   http://localhost:3001/
```

### 2.2 Acceder a la interfaz

Abre tu navegador y ve a:

```
http://localhost:3001
```

**IMPORTANTE:** Debes usar `localhost`, no `127.0.0.1`. El backend solo acepta solicitudes CORS desde `http://localhost:3001`. Si accedes desde `http://127.0.0.1:3001`, verás un error de CORS.

### 2.3 La primera vez que entras

Al cargar la interfaz por primera vez, verás una **pantalla de carga** con un icono de Activity animado en cian y el mensaje:

> Cargando bases de datos locales

Esto es normal. El frontend está solicitando las 22 bases de datos al backend. En cuanto las recibe, las procesa y muestra el Dashboard.

Si no hay datos previos (primera ejecución), las bases de datos están en **estado semilla**:
- **bd0** contiene un registro único (el nodo soberano "SISTEMA MIKOKO") con todos los valores en cero.
- **bd1** está vacía (sin lotes de cartera).
- **bd2** está vacía (sin transacciones), pero ya tiene definida su taxonomía de categorías y subtipos.
- **bd3** está vacía (sin activos registrados).
- **bd4 a bd21** están vacías.

Como no hay datos, el checksum mostrará **BLOCKED** (todos los ejes en rojo) porque el sistema detecta que no hay lotes en bd1, no hay auditoría, la pirámide está vacía, etc. Es el estado esperado. El sistema te está diciendo: "no hay datos, no puedo validar nada". Tu primera tarea será poblarlo.

### 2.4 Detener el sistema

Para detener MIKOKO, vuelve a la terminal donde ejecutaste `npm run dev` y presiona **Ctrl + C** dos veces, o una vez y espera a que los procesos terminen.

Si la terminal se cerró y los procesos quedaron huérfanos, puedes matarlos manualmente:

```bash
kill $(lsof -ti :5000) $(lsof -ti :3001) 2>/dev/null
```

### 2.5 Resumen: ciclo de vida de una sesión

```
Abrir terminal → npm run dev → Navegador en localhost:3001 → Operar → Ctrl+C → Fin
```

No hay cierre de sesión, login, ni estados que guardar. Los cambios se persisten en disco instantáneamente (en modo LIVE). Puedes cerrar el navegador cuando quieras y retomar donde lo dejaste.

---

## 3. Puesta a Punto Inicial — Onboarding

Esta sección está diseñada para quienes ya tienen activos, posiciones abiertas y un historial de operaciones antes de empezar a usar MIKOKO. Si empiezas desde cero (sin cartera previa), puedes saltar a la [Sección 4](#4-tour-completo-del-hud—cada-rincón-del-búnker).

### 3.1 El concepto del "Día Cero"

MIKOKO no puede rastrear tu historial pasado automáticamente. No hay forma de saber qué compraste, a qué precio, ni dónde están tus activos si no se lo dices.

El **Día Cero** es la fecha que eliges como punto de partida. A partir de ese momento, cada operación que realices se registra en MIKOKO y el seguimiento es perfecto. Para los activos que ya poseías antes del Día Cero, harás un **registro masivo único** con tu mejor estimación de coste de adquisición.

**Regla importante:** No se busca precisión de arqueólogo. Se busca una **Línea de Base funcional**. Si no recuerdas el precio exacto al que compraste un activo hace dos años, usa una estimación razonable. Es mejor un dato aproximado pero presente que un cero absoluto.

### 3.2 Paso 1: Registrar tus activos existentes

1. En el **Dashboard**, localiza el formulario **"Nueva Transacción"** (panel izquierdo de la sección inferior).
2. Rellena los campos:
   - **Nombre del activo:** El nombre completo (ej: "Ethereum", "Bitcoin", "USDC").
   - **Ticker:** El símbolo del activo en mayúsculas (ej: "ETH", "BTC", "USDC").
   - **Tipo:** Selecciona "Comprar" (es una entrada de capital, aunque sea histórica).
   - **Cantidad:** La cantidad total que posees de ese activo.
   - **Precio unitario USD:** Tu mejor estimación del precio al que lo adquiriste.
   - **Fecha/Hora:** La fecha de tu **Día Cero** (o la fecha real si la recuerdas).
3. Haz clic en **"Confirmar Transacción Local"** (modo LIVE) o **"[SIM] Simular Transacción"** (modo simulación si solo quieres probar).

**¿Qué ocurre al confirmar?**

- El activo se crea en **bd3 (Activos Cripto)** con estado de tesis **"PENDIENTE"**.
- La transacción se registra en **bd2 (Transacciones)** con todos sus detalles.
- Como el activo tiene tesis "PENDIENTE", entran en juego las **reglas de Strict Block** (ver sección 5): el activo **no modifica** la cartera (bd1) ni los totales consolidados (bd0). Queda en un estado de "cuarentena".
- El sistema muestra un aviso: *"Strict Block activo: activo borrador y transacción pendiente guardados; el capital BD1 no fue mutado."*

**¿Por qué ocurre esto?** MIKOKO no sabe si confiar en ese activo. Para que un activo afecte a tu capital real, debe tener la tesis **APROBADA**. Esto evita que registres activos basura o especulativos sin pasar por un proceso de validación.

### 3.3 Paso 2: Aprobar la tesis de tus activos

Para que los activos que registraste entren en el cómputo de tu cartera:

1. Ve a la **Consola de Datos** (icono de base de datos en la barra lateral, el último).
2. En el selector de base de datos, elige **bd3 — Activos Cripto**.
3. Localiza el registro del activo que quieres aprobar.
4. Usa el formulario de alta para **modificar** su estado (o edita directamente el JSON si usas "Ver raw"). Cambia `estadoTesis` de `"PENDIENTE"` a `"APROBADA"`.
5. Tras aprobar, el sistema recalcula: el activo pasa a formar parte de bd1 (Portfolio Actual) y el nodo soberano bd0 se actualiza con los nuevos totales.

**Atajo:** También puedes usar el workflow **WF-001: Registrar Activo** desde el Launchpad, que tiene un flujo más guiado, o modificar directamente el archivo JSON en la Consola de Datos.

### 3.4 Paso 3: Registrar tu primer movimiento real

Una vez que tus activos históricos están registrados y aprobados, cada operación nueva que realices (compra, venta, transferencia) deberás registrarla inmediatamente en MIKOKO usando el formulario de **Nueva Transacción** en el Dashboard (o el workflow **WF-002**).

La regla es simple: **toda operación on-chain debe tener su reflejo en MIKOKO en menos de 5 minutos.** Cada transacción no registrada es un "agujero" en la memoria del sistema que distorsionará tus métricas.

---

## 4. Tour Completo del HUD — Cada Rincón del Búnker

La interfaz de MIKOKO se divide en tres zonas permanentes (barra lateral, barra superior, área de contenido) y seis vistas intercambiables.

---

### 4.1 Barra Lateral (Panel de Navegación)

La barra lateral izquierda es tu panel de navegación principal. Está siempre visible.

#### Colapsar / Expandir

En el extremo superior hay dos botones:
- **`<` (ChevronLeft):** Cuando la barra está expandida, la colapsa. Solo muestra los iconos de cada sección.
- **`>` (ChevronRight):** Cuando la barra está colapsada, la expande. Muestra los iconos con sus etiquetas.

Esto es útil en pantallas pequeñas o cuando quieres maximizar el área de contenido.

#### Los 6 nodos de navegación

Cada icono representa una vista del sistema. Haciendo clic cambias la vista central:

| Icono | Vista | Color | ¿Para qué sirve? |
|-------|-------|-------|------------------|
| 📊 LayoutDashboard | Dashboard | Verde esmeralda | Panel principal. Visión general del estado de tu arsenal. |
| 🔀 GitPullRequest | Workflows | Cian | Launchpad de protocolos de misión. Desde aquí ejecutas acciones. |
| 🧠 BrainCircuit | Inteligencia | Dorado | Feed de notas, análisis, diario e investigación. |
| 📈 BarChart3 | Análisis | Azul | Calculadora de asignación y rebalanceo. |
| 🔺 Triangle | Pirámide | Violeta | Visualización de la estructura de capital por niveles de riesgo. |
| 🗄️ Database | Consola BD | Rojo carmesí | Administración directa de las 22 bases de datos. |

#### Indicador de estado al pie

En la parte inferior de la barra lateral hay un **indicador luminoso** que muestra el veredicto actual del checksum:

- **Verde** → SISTEMA AUTORIZADO (todo correcto, puedes operar).
- **Ámbar** → PRECAUCIÓN (algo requiere atención pero no bloquea).
- **Rojo** → BLOQUEADO (uno o más ejes bloqueantes impiden operar).

Cuando la barra está colapsada, solo se ve el punto de color. Cuando está expandida, también se ve el texto del veredicto.

---

### 4.2 Barra Superior (Top Bar)

La barra superior contiene elementos que se mantienen visifiques sin importar la vista activa.

#### Indicador de protocolo

A la izquierda: un icono de **Radio** (señal) en rojo seguido del texto:

```
MIKOKO v27.0 // SECURE PROTOCOL
```

Esto confirma visualmente que estás en el sistema y que opera en modo seguro (localhost-only). La versión (27.0) coincide con el archivo `package.json`.

#### Badge de Checksum

A la derecha del indicador de protocolo, un recuadro con el veredicto actual:

- **AUTHORIZED** (texto verde) → Todo en orden.
- **CAUTION** (texto ámbar) → Revisa los ejes marcados.
- **BLOCKED** (texto rojo) → Operaciones restringidas.

#### Toggle SIMULACIÓN / LIVE

A la derecha del badge, un botón que alterna entre dos modos operativos:

- **Modo LIVE** (apariencia roja/carmesí): Las operaciones escriben directamente en los archivos JSON del disco. Cada transacción, actualización de precio o modificación de datos persiste al cerrar el navegador.
- **Modo SIMULACIÓN** (apariencia naranja/dorada): Las operaciones se ejecutan exclusivamente en memoria (estado React). Los cambios se ven en la interfaz, pero **no se persisten** en disco. Al recargar la página, todo vuelve al estado original.

**Cómo alternar:** Haz clic en el botón. Cambia de modo instantáneamente. No hay confirmación ni advertencia.

**¿Cuándo usar cada modo?**

- Usa **SIMULACIÓN** cuando quieras probar un escenario hipotético: "¿qué pasaría si comprara 1 BTC ahora?", "¿cómo se vería mi cartera si rebalanceo al 40% en Tier 1?".
- Usa **LIVE** cuando estés registrando operaciones reales que quieres que se guarden permanentemente.

**IMPORTANTE:** El estado del toggle **se reinicia al recargar la página**. Si recargas, el sistema vuelve a LIVE. Esto es intencional: la simulación debe ser una decisión consciente cada sesión.

---

### 4.3 Dashboard (Vista Principal / HUD)

La vista Dashboard es la primera que ves al entrar. Es tu **panel de control central**. Se divide en varias secciones que se describen a continuación.

#### 4.3.1 Encabezado del Dashboard

En la parte superior, dentro de un panel con bordes y sombra tenue:
- **"MIKOKO v27.0"** en texto dorado pequeño.
- **"Panel de Cartera Soberana"** como título.
- Cuatro indicadores en fila:
  - **Checksum:** Muestra el veredicto actual con su color.
  - **Modo:** Muestra "SIMULACIÓN" (naranja) o "Usuario Único" (cian, modo LIVE).
  - **Almacenamiento:** Muestra la ruta `".obsidian/mikoko-moster"`.
  - **Botón "Actualizar Precios":** Dispara la actualización de precios vía CoinGecko (o simulación). Muestra una animación de giro mientras se ejecuta.

#### 4.3.2 Los 4 Estados Visibles del Dashboard

El Dashboard puede mostrar 4 estados diferentes. Es importante reconocerlos:

**Estado 1 — Carga (loading):**

Cuando el sistema está obteniendo las bases de datos del backend, ves una pantalla centrada con:
- Un icono de **Activity** animado (pulso).
- El mensaje: *"Cargando bases de datos locales"*.

No puedes interactuar con nada mientras esté en este estado. Si se queda aquí más de 10 segundos, hay un problema de conexión (ver sección 11).

**Estado 2 — Error:**

Si el backend no responde o hay un error al leer las bases de datos, aparece una **banda roja** en la parte superior del dashboard con el mensaje de error. Por ejemplo:
- *"No se pudo obtener bd3."* — Indica que una base de datos concreta no se pudo leer.
- *"Unable to read local databases."* — Error general del backend.

**Estado 3 — Aviso (notice):**

Después de ejecutar una acción exitosa (registrar transacción, actualizar precios), aparece una **banda verde** con un mensaje confirmando el resultado. Por ejemplo:
- *"Transacción confirmada localmente y resúmenes recalculados."*
- *"[SIMULACIÓN] Transacción confirmada localmente..."* (en modo simulación).
- *"Precios de mercado actualizados anónimamente."*

**Estado 4 — Normal (con datos o vacío):**

El dashboard muestra sus paneles con datos. Si no hay activos registrados, la tabla de activos muestra una fila vacía con el mensaje: *"No hay activos BD3 aún. La primera transacción creará un pasaporte borrador bajo Strict Block."*

#### 4.3.3 Las 4 Tarjetas Métricas (Patrimonio Neto)

Debajo del encabezado hay una fila de 4 tarjetas que resumen el estado de tu arsenal:

| Tarjeta | Descripción | Color de borde |
|---------|-------------|----------------|
| **Patrimonio Neto** | Valor total consolidado de tu cartera en USD. Es la suma de todo tu capital en todos los niveles de riesgo. | Esmeralda |
| **Cambio Cartera 24h** | Variación del valor de la cartera en las últimas 24 horas. **Actualmente muestra "Snapshot pendiente"** porque esta funcionalidad requiere un sistema de snapshots periódicos que está en desarrollo. | Cian |
| **Polvo Seco** | Capital líquido disponible en stablecoins. Muestra el valor en USD y, debajo, el porcentaje de liquidez sobre el total (ej: "15.3% liquidez"). | Dorado |
| **Precios Obsoletos** | Número de activos cuyo precio SSOT tiene más de 24 horas sin actualizar. Debajo indica "Activos bloqueando EJE-2". Si es 0, no hay problema. | Carmesí |

**¿De dónde vienen estos números?** El backend calcula los totales a partir de las bases de datos:
- **Patrimonio Neto** = rollup de todos los lotes activos en bd1.
- **Polvo Seco** = lotes de stablecoins con etiqueta de liquidez "OPEN_ENVELOPE".
- **Precios Obsoletos** = activos en bd3 con `fechaSSTPrecio` anterior a 24 horas y que tienen capital en bd1.

#### 4.3.4 Matriz de Integridad del Sistema (6 Ejes)

Esta sección muestra el estado de los 6 ejes del checksum. Cada eje se representa como una tarjeta independiente con:

- **Código del eje** (ej: "EJE-1", "EJE-2", "EJE-P", etc.) en texto pequeño gris.
- **Nombre del eje** (ej: "Contabilidad", "Precios", "Auditoría") en blanco.
- **Indicador luminoso** (círculo de color): Verde = OK, Amarillo = atención, Naranja = crítico no bloqueante, Rojo = bloqueante.
- **Mensaje de acción** (ej: "Crear lotes de cartera BD1 auditados.").

La distribución es 2 columnas en pantallas medianas y 3 en grandes.

#### 4.3.5 Distribución de Asignación (Barras de Progreso)

Panel derecho de la segunda fila. Muestra 4 barras de progreso apiladas verticalmente, una por cada nivel de riesgo (Tier):

| Tier | Etiqueta | Color de barra |
|------|----------|----------------|
| TIER_1 | Reserva Nivel 1 | Esmeralda |
| TIER_2 | Rendimiento Nivel 2 | Cian |
| TIER_3 | Alpha Nivel 3 | Dorado |
| TIER_4 | Especulación Nivel 4 | Carmesí |

Cada barra muestra:
- El nombre del nivel.
- El valor en USD y el porcentaje sobre el total (ej: "$12,500.00 · 41.7%").
- Una barra horizontal cuyo ancho representa el porcentaje.

Si no hay capital asignado a un nivel, la barra tiene ancho 0.

#### 4.3.6 Formulario de Nueva Transacción

Panel izquierdo de la tercera fila. Contiene 6 campos y un botón de confirmación.

**Campos del formulario:**

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| Nombre del activo | Texto | No | Nombre legible del activo (ej: "Ethereum"). Si se deja vacío, se genera automáticamente a partir del ticker. |
| Ticker | Texto | **Sí** | Símbolo del activo en mayúsculas (ej: "ETH", "BTC", "USDC"). Se normaliza automáticamente. |
| Tipo | Select | **Sí** | "Comprar" (entrada de capital), "Vender" (salida), "Transferir" (movimiento interno). |
| Cantidad | Número | **Sí** | Cantidad del activo. Debe ser mayor que cero. |
| Precio unitario USD | Número | **Sí** | Precio en USD por unidad. Puede ser cero (para airdrops o rewards). |
| Fecha/Hora | datetime-local | **Sí** | Fecha y hora de la operación. Por defecto se rellena con la fecha/hora actual. |

**Botón de confirmación:**

- En **modo LIVE:** Muestra "Confirmar Transacción Local".
- En **modo SIMULACIÓN:** Muestra "[SIM] Simular Transacción".
- Mientras se procesa: Muestra "Escribiendo Ledger Local..." y se deshabilita.

**Validaciones:**

Si introduces datos inválidos, la transacción no se envía y verás un error en la banda roja:

| Error | Causa |
|-------|-------|
| *"El ticker es obligatorio."* | Dejaste el ticker vacío. |
| *"La cantidad debe ser mayor a cero."* | Cantidad 0 o negativa. |
| *"El precio no puede ser negativo."* | Precio negativo. |

**¿Qué ocurre al confirmar?** (Detallado en sección 5.2)

#### 4.3.7 Tabla de Activos (BD3)

Panel derecho de la tercera fila. Muestra todos los activos registrados en bd3 con información consolidada de bd1.

**Columnas de la tabla:**

| Columna | Descripción |
|---------|-------------|
| **Activo** | Ticker (negrita) y nombre del activo (gris, truncado a 48 caracteres). |
| **Cantidad** | Cantidad total del activo sumando todos los lotes activos en bd1. Formato con hasta 8 decimales. |
| **Precio** | Precio unitario en USD según el campo `precioUnitarioUSD` de bd3. |
| **Valor** | Valor total en USD (cantidad × precio). |
| **Actualización** | Estado de frescura del precio: "ACTUAL" (verde, <3h), "PROXIMO_A_VENCER" (ámbar, >3h pero <24h), o "OBSOLETO" (rojo, >24h y el activo tiene capital). Debajo, la fecha de la última actualización. |
| **Tesis** | Estado de la tesis del activo: "APROBADA" (verde), "PENDIENTE" (ámbar), "INVALIDADA" (rojo). |

**Indicador de bloqueo:** Si el checksum está en BLOCKED, aparece un badge rojo a la derecha del título de la tabla con el texto "Operaciones bloqueadas".

**Tabla vacía:** Si no hay activos en bd3, la tabla muestra una fila única: *"No hay activos BD3 aún. La primera transacción creará un pasaporte borrador bajo Strict Block."*

---

### 4.4 Launchpad de Workflows (Panel de Control)

Esta vista contiene 6 tarjetas de workflow, cada una representando un protocolo de misión. Cada tarjeta incluye:

- **ID del workflow** (ej: "WF-001") en texto gris pequeño.
- **Nombre** del workflow en blanco.
- **Descripción** de lo que hace.
- **Icono** representativo en un cuadrado dorado.
- **Dos botones:**
  - **"Ejecutar":** Inicia el workflow. El comportamiento varía según el workflow:
    - WF-020, WF-030, WF-099: ejecutan la acción directamente.
    - WF-001, WF-002, WF-010: redirigen al Dashboard (donde están los formularios correspondientes) o muestran una notificación.
  - **"Info":** Botón reservado para futura expansión (actualmente no hace nada visible).

#### Los 6 Workflows

| ID | Nombre | Acción al ejecutar |
|----|--------|-------------------|
| **WF-001** | Registrar Activo | Crear un nuevo pasaporte de activo en BD3. |
| **WF-002** | Nueva Transacción | Registrar compra/venta/transferencia en BD2. |
| **WF-010** | Rebalanceo de Cartera | Ejecutar rebalanceo entre niveles de riesgo. |
| **WF-020** | Reconciliación Contable | Conciliar saldos BD1 contra BD0. |
| **WF-030** | Actualizar Precios | Refrescar precios de mercado vía CoinGecko. |
| **WF-099** | Inicializar Bases de Datos | Recargar todas las BD desde el servidor. |

#### Consola de Sistema

Al pie del Launchpad hay una sección que muestra métricas del estado actual:

```
Estado actual: 5 transacciones · 3 lotes · 4 activos
```

Estos números vienen de:
- `bd2.records.length` → número de transacciones.
- `bd1.records.length` → número de lotes.
- `bd3.records.length` → número de activos.

Si el sistema está desconectado, muestra "Desconectado".

Hay un botón **"Recargar BD"** que fuerza la recarga de todas las bases de datos desde el servidor (es lo mismo que WF-099).

---

### 4.5 Feed de Inteligencia (Centro de Análisis)

Esta vista agrega contenido de 4 bases de datos en un solo feed cronológico descendente (más reciente primero).

#### Las 4 tarjetas de conteo

En la parte superior, 4 tarjetas muestran cuántos registros hay en cada base de datos de inteligencia:

| Tarjeta | Base de datos | Icono | Color |
|---------|---------------|-------|-------|
| Notas BD8 | bd8 — Notas y Análisis | BookOpen | Cian |
| Inbox BD16 | bd16 — Pitacoras Inbox | Inbox | Dorado |
| Research BD17 | bd17 — Prensa y Research | Newspaper | Esmeralda |
| Diario BD14 | bd14 — Diario Cripto | FileText | Carmesí |

#### El feed de entradas

Cada registro de estas 4 bases de datos aparece como una tarjeta en el feed. Cada tarjeta muestra:

- **Icono** del origen (BookOpen, Inbox, Newspaper, FileText).
- **Título** (campo `titulo`, `asunto`, `nombre` o `ticker` del registro, según lo que tenga).
- **Badge** del origen (ej: "Notas y Análisis", "Bandeja Inbox").
- **Extracto** del contenido (primeras líneas de `contenido`, `notas`, `descripcion` o `cuerpo`).
- **Fecha** del registro.

**Estado vacío:** Si las 4 bases de datos están vacías, se muestra un mensaje en el centro:

> No hay registros en las bases de datos de inteligencia (BD8, BD14, BD16, BD17).
> Agrega registros desde la Consola de Datos para verlos aquí.

---

### 4.6 Estación de Análisis (Calculadora de Rebalanceo)

Vista dividida en dos paneles laterales.

#### Panel izquierdo — Asignación Actual

Muestra el desglose del capital por cada nivel de riesgo (Tier 1 a 4), con:

- **Capital total** en USD en la parte superior.
- Por cada Tier:
  - Nombre del nivel (ej: "Reserva Nivel 1") con su color.
  - Valor en USD y porcentaje sobre el total.
  - Barra de progreso horizontal.
  - Descripción del tipo de activo esperado en ese nivel (ej: "Stablecoins, efectivo, valor refugio").

#### Panel derecho — Calculadora de Rebalanceo

Incluye 4 controles deslizantes (sliders), uno por cada nivel de riesgo (Tier 1 a 4). Cada slider va de 1% a 80%.

Al mover los sliders, se ajustan los porcentajes objetivo. Si la suma supera el 100%, el sistema ajusta automáticamente los otros sliders para compensar.

Debajo de los sliders, cuando hay capital total > 0, se genera un **Plan de Acción** que compara la asignación actual con la objetivo:

- Por cada nivel, muestra:
  - El nombre del nivel con su color.
  - El valor actual en USD.
  - La diferencia: si es positiva (necesitas comprar) en verde, si es negativa (necesitas vender) en rojo.
  - Flecha hacia arriba (comprar) o hacia abajo (vender).

Ejemplo:

```
Reserva Nivel 1     $12,500 → +$3,500 (verde)
Rendimiento Nivel 2  $8,200 → -$1,200 (rojo)
...
```

Al pie: *"Rebalanceo estimado. Ejecutar WF-010 para aplicar cambios."*

**Nota:** Los sliders no persisten al recargar la página. Vuelven a los valores por defecto (40% Tier 1, 25% Tier 2, 20% Tier 3, 10% Tier 4).

---

### 4.7 Panel de la Pirámide (Estructura de Capital)

Representación geométrica conceptual de la estructura de capital en 4 niveles visuales apilados de base ancha a ápice estrecho.

#### Los 4 niveles visuales

De abajo arriba:

| Nivel | Color | Descripción | Ancho visual |
|-------|-------|-------------|--------------|
| **Reserva Nivel 1** (Base) | Esmeralda | Store of Value — la capa más ancha | 100% |
| **Rendimiento Nivel 2** | Cian | Yield Generation — segunda capa | 80% |
| **Alpha Nivel 3** | Dorado | Growth — tercera capa | 60% |
| **Especulación Nivel 4** (Ápice) | Carmesí | Speculation — la capa más estrecha | 40% |

Cada nivel muestra:
- Nombre y descripción.
- Valor en USD (sin decimales).
- Porcentaje sobre el total.

#### Panel de Salud de la Pirámide

A la derecha de la pirámide, tres indicadores de salud:

| Indicador | Qué mide | Verde si... | Rojo si... |
|-----------|----------|-------------|------------|
| **Base (Tier 1)** | ¿Hay capital de reserva? | capitalTier1 > 0 | capitalTier1 = 0 |
| **Proporción Alto Riesgo** | ¿Tier 3+4 supera el 30%? | ≤ 30% del total | > 30% del total |
| **Liquidez** | ¿El polvo seco supera el 10%? | ≥ 10% del total | < 10% del total |

Cada indicador muestra su valor actual (ej: "15.3% liquidez") y un punto verde o un icono de alerta.

#### Diagnóstico del Eje Piramidal

Debajo de los indicadores de salud, un panel que muestra el estado del **EJE-P** (Piramidal) del checksum:

- **Estado:** GREEN, YELLOW o RED.
- **Label:** Descripción textual.
- **Action:** Qué hacer si hay problema.

---

### 4.8 Consola de Datos (Administración de Bases de Datos)

Herramienta de administración directa de todas las 22 bases de datos del sistema.

#### Selector de Base de Datos

Un menú desplegable en la parte superior que lista las 22 bases de datos en formato `BD00 — Nombre` a `BD21 — Nombre`.

Al seleccionar una base de datos, la consola muestra sus registros.

#### Panel izquierdo — Agregar Registro

Formulario para agregar un nuevo registro a la base de datos seleccionada:

- **Área de texto:** Donde escribes un objeto JSON válido.
- **Botón "Agregar":** Añade el registro.
  - En modo LIVE: escribe en la base de datos real.
  - En modo SIMULACIÓN: el botón se deshabilita (no se pueden simular altas en Consola de Datos).

**Placeholder del área de texto:**

```json
{"internalId": "asset-xxx", "nombre": "Ejemplo", "ticker": "XYZ"}
```

**Validación:** Si el JSON no es válido, aparece un alert nativo del navegador: "JSON inválido. Revisa el formato."

#### Panel derecho — Tabla de Registros

Muestra los registros de la base de datos seleccionada en formato tabular.

- Las columnas se adaptan dinámicamente a las claves de los primeros 3 registros (hasta 8 columnas).
- Cada fila muestra el número de registro y el valor de cada columna.
- Los valores largos se truncan (más de 40 caracteres + "...").
- Los valores nulos muestran "—".
- Los valores objeto se serializan como JSON truncado.

**Tabla vacía:** Si la base de datos no tiene registros, se muestra: *"No hay registros en BDXX."*

#### Botón "Ver raw"

En la parte superior, junto al selector. Al activarlo, se muestra el contenido JSON completo de la base de datos seleccionada, incluyendo metadatos como:

- `schemaVersion`
- `storage` (modo, ruta)
- `dependencies`
- `checksum` (status, calculatedAt, note)
- `createdAt`, `updatedAt`

El JSON se muestra en un bloque `<pre>` con scroll vertical (altura máxima de 384px).

#### Contador de registros

Muestra el número total de registros en la base de datos seleccionada (ej: "5 registros").

---

## 5. Workflows — Protocolos de Despliegue

Cada workflow es un protocolo de misión. Debes ejecutarlos en orden y siguiendo los pasos indicados para garantizar la integridad del sistema.

---

### 5.1 WF-001: Registrar Activo

**Objetivo:** Crear un nuevo pasaporte de activo en la base de datos BD3 (Activos Cripto).

**Cuándo usarlo:** Cada vez que adquieras un activo que aún no existe en tu catálogo de BD3. Si el activo ya fue creado automáticamente al registrar una transacción (con tesis "PENDIENTE"), usa WF-002 directamente.

**Cómo ejecutarlo paso a paso:**

1. Ve al **Launchpad de Workflows**.
2. Localiza la tarjeta **WF-001 — Registrar Activo**.
3. Haz clic en **"Ejecutar"**.
4. Serás redirigido al Dashboard. En el formulario de Nueva Transacción, introduce los datos del activo (ticker, nombre, etc.) y confirma.
5. El activo se crea en BD3 con estado de tesis **"PENDIENTE"**.
6. Para que el activo entre en el cómputo de tu cartera, debes cambiar su tesis a **"APROBADA"** desde la **Consola de Datos** (ver sección 4.8).

**El Razonamiento (¿por qué es importante?):** No todos los activos merecen el mismo nivel de confianza. Un activo con tesis "PENDIENTE" está en cuarentena: puedes registrar transacciones con él, pero no afectará a tu capital consolidado hasta que decidas conscientemente aprobarlo. Esto evita que registros incompletos o especulativos distorsionen tus métricas de cartera.

**Resultado Esperado:** Un nuevo pasaporte de activo en BD3 con toda su metadata (ticker, nombre, precio, estado de tesis, riesgo estático, etc.).

---

### 5.2 WF-002: Nueva Transacción

**Objetivo:** Registrar una compra, venta o transferencia en el libro mayor inmutable (BD2) y actualizar el portfolio (BD1) y los totales consolidados (BD0).

**Cuándo usarlo:** Inmediatamente después de realizar cualquier operación real: comprar, vender, recibir un airdrop, stakear, mover fondos entre wallets, etc. También para registrar el histórico inicial (ver sección 3).

**Cómo ejecutarlo paso a paso:**

1. Desde el **Dashboard**, localiza el formulario **"Nueva Transacción"** (panel izquierdo de la tercera fila).
2. Rellena los campos obligatorios (ver 4.3.6).
3. Haz clic en el botón de confirmación.

**¿Qué ocurre internamente? (secuencia completa)**

Cuando confirmas una transacción en modo LIVE, el sistema ejecuta esta secuencia de 4 escrituras en disco:

```
bd3 (Activos) → bd2 (Transacciones) → bd1 (Portfolio) → bd0 (Central)
```

**Paso 1 — Buscar o crear el activo en BD3:**
- Si el ticker ya existe en BD3, se actualiza su precio y timestamp SSOT.
- Si el ticker **no existe**, se crea un nuevo pasaporte con `estadoTesis: "PENDIENTE"`, riesgo estático por defecto (TIER_4 para cripto, TIER_1 para stablecoins) y una nota: *"Pasaporte borrador creado por ingreso de transacción Strict Block."*

**Paso 2 — Crear la transacción en BD2:**
- Se genera un ID único de transacción con formato `WF-002-{TICKER}-{YYYYMMDDHHMMSS}`.
- Se genera un hash de integridad combinando el internalId, la fecha y el ID de transacción.
- Se asigna la categoría fiscal (`ENTRADA_DE_CAPITAL` para compras, `SALIDA_DE_CAPITAL` para ventas, `MOVIMIENTO_INTERNO` para transferencias).
- Se asigna el subtipo operativo (`COMPRA_FIAT_CRIPTO`, `VENTA_CRIPTO_FIAT`, `TRANSFERENCIA`, etc.).
- La transacción incluye una referencia al activo (id, nombre, ticker, si es stablecoin).
- La transacción se añade al array `records` de BD2.

**Paso 3 — Actualizar el lote en BD1 (solo si el activo está APROBADO):**
- Si el activo tiene `estadoTesis: "APROBADA"`:
  - Se busca el lote activo para ese ticker en BD1. Si no existe, se crea uno nuevo.
  - **Compra:** Se suma la cantidad a `currentQuantity`, se actualiza `costBaseUSD`, se recalcula `averageEntryUSD`.
  - **Venta:** Se resta la cantidad de `currentQuantity`. Si la cantidad a vender haría el saldo negativo, se lanza un error: *"Error-Cero: la cantidad de venta haría negativa la cantidad actual de BD1."*
  - **Transferencia:** No modifica cantidades en BD1 (solo cambia de ubicación, conceptualmente).
  - Se actualiza `currentPriceUSD`, `currentValueUSD`, `finalTier` y `status` (ACTIVE o CLOSED si cantidad llega a 0).
- Si el activo tiene `estadoTesis !== "APROBADA"`:
  - La transacción se registra en BD2, pero **no modifica BD1** (Strict Block).
  - El capital total permanece intacto.
  - El mensaje de confirmación lo indica explícitamente.

**Paso 4 — Sincronizar BD0 (nodo soberano):**
- Se recalcula el rollup de BD1: total global, polvo seco, capital por tier, referencias a lotes activos.
- Se actualizan los campos de BD0: `totalGlobalUSD`, `dryPowderUSD`, `capitalTier1-4USD`, `portfolioLinks`.
- Se actualiza el checksum de BD0.

**El Razonamiento (¿por qué es importante?):** BD2 es un **libro mayor inmutable**. Una vez que una transacción se registra, no se puede eliminar ni modificar. Esto crea un registro de auditoría inalterable. Cada transacción tiene un hash único que permite rastrear su origen y verificar su integridad.

**Resultado Esperado:** Una transacción registrada en BD2, tu cartera actualizada (si el activo estaba aprobado), y los totales consolidados recalculados. Recibirás un mensaje de confirmación verde.

---

### 5.3 WF-010: Rebalanceo de Cartera

**Objetivo:** Ejecutar un rebalanceo entre los niveles de riesgo (Tiers) para alinear la asignación real con la asignación objetivo definida en tu Pirámide Estratégica.

**Cuándo usarlo:** Cuando la Estación de Análisis (ver 4.6) muestre una desviación significativa entre la asignación actual y la deseada. O durante tu revisión periódica si decides que es necesario un ajuste táctico.

**Cómo ejecutarlo paso a paso:**

1. Ve a la **Estación de Análisis** (icono de gráfico de barras en la barra lateral).
2. En el panel derecho (**Calculadora de Rebalanceo**), ajusta los sliders de cada nivel al porcentaje objetivo.
3. Revisa el **Plan de Acción** generado automáticamente. Te indicará:
   - Qué niveles están sobreexpuestos (vender) → diferencia negativa en rojo.
   - Qué niveles están infraexpuestos (comprar) → diferencia positiva en verde.
4. Ejecuta las operaciones reales necesarias en tus exchanges/wallets.
5. Registra cada operación con **WF-002** (Nueva Transacción).
6. Vuelve al Dashboard para verificar que los totales se han actualizado.

**El Razonamiento (¿por qué es importante?):** El rebalanceo es el mecanismo que te fuerza a **comprar barato y vender caro** de forma sistemática. Cuando un activo sube mucho, representa un porcentaje mayor de tu cartera del que planeaste: el rebalanceo te obliga a vender un poco (tomar ganancias). Cuando baja, te obliga a comprar más (promediar). Sin rebalanceo, tu perfil de riesgo se desvía silenciosamente.

**Resultado Esperado:** Tu cartera real alineada con tu asignación objetivo. Las ganancias de los activos sobreperformantes se han materializado parcialmente, y los activos infraperformantes han recibido capital adicional.

---

### 5.4 WF-020: Reconciliación Contable

**Objetivo:** Conciliar los saldos de BD1 (Portfolio Actual) contra BD0 (Central de Datos) para verificar que no hay discrepancias.

**Cuándo usarlo:** Como parte del mantenimiento preventivo, cada 14 días como mínimo. También después de una sesión de registro intensiva.

**Cómo ejecutarlo paso a paso:**

1. Ve al **Launchpad de Workflows**.
2. Localiza la tarjeta **WF-020 — Reconciliación Contable**.
3. Haz clic en **"Ejecutar"**.
4. El sistema compara los totales de BD1 contra los registros de BD0.
5. Revisa visualmente que los valores coincidan. Si hay diferencias:
   - Usa la **Consola de Datos** para inspeccionar BD1 y BD0.
   - Verifica que no hay transacciones sin procesar en BD2 que no se hayan reflejado en BD1.

**El Razonamiento (¿por qué es importante?):** La reconciliación es tu **auditoría de integridad**. Con el tiempo, errores humanos, fallos de escritura atómica o inconsistencias pueden generar desfases entre BD1 y BD0. Detectarlos a tiempo evita que se acumulen y distorsionen tus métricas.

**Resultado Esperado:** Confirmación de que BD1 y BD0 están sincronizados. Si hay diferencias, identificarlas temprano para corregirlas.

---

### 5.5 WF-030: Actualizar Precios

**Objetivo:** Refrescar los precios de mercado de todos los activos activos en BD3 mediante la API pública de CoinGecko.

**Cuándo usarlo:** A diario, como mínimo una vez al día. Si ves que el **EJE-2** del checksum se pone rojo, es urgente.

**Cómo ejecutarlo paso a paso:**

1. Desde el **Dashboard**, haz clic en el botón **"Actualizar Precios"** en el encabezado.
   - O desde el **Launchpad**, en la tarjeta **WF-030 — Actualizar Precios**.
2. El botón mostrará una animación de giro mientras se procesa.
3. En modo **LIVE**:
   - El frontend envía los tickers de los activos al backend.
   - El backend llama a la API de CoinGecko (`api.coingecko.com/api/v3/simple/price`) con los IDs de CoinGecko de cada activo.
   - Si un activo no tiene `coingeckoId`, el backend intenta resolverlo buscando en CoinGecko por ticker.
   - Los precios obtenidos se guardan en BD3, se recalculan los valores de los lotes en BD1 y se actualiza BD0.
   - Límite: máximo 100 activos por llamada. CoinGecko free plan: 10-30 llamadas/minuto.
4. En modo **SIMULACIÓN**:
   - No se llama a CoinGecko.
   - Cada activo recibe una variación aleatoria de ±1% sobre su precio actual.
   - Las marcas de tiempo SSOT se actualizan al momento actual.
5. Al terminar, aparece una banda verde: *"Precios de mercado actualizados anónimamente."*

**El Razonamiento (¿por qué es importante?):** El precio es el dato más volátil del sistema. Si los precios están desactualizados, todas las métricas derivadas (patrimonio neto, asignación por tier, polvo seco, checksum) son incorrectas. El EJE-2 bloquea las operaciones si hay precios obsoletos para evitar que tomes decisiones basadas en información desactualizada.

**Resultado Esperado:** Todos los activos activos tienen precios actualizados (≤24h). El EJE-2 pasa a verde.

---

### 5.6 WF-099: Inicializar Bases de Datos

**Objetivo:** Recargar todas las 22 bases de datos desde el servidor, descartando cualquier estado local que pudiera estar corrupto o desactualizado.

**Cuándo usarlo:**
- Cuando el frontend muestra datos inconsistentes.
- Cuando sospechas que el estado local de React se ha desincronizado del backend.
- Después de restaurar una copia de seguridad.
- Al inicio de una sesión si quieres asegurarte de tener los datos más recientes.

**Cómo ejecutarlo paso a paso:**

1. Ve al **Launchpad de Workflows**.
2. Localiza la tarjeta **WF-099 — Inicializar Bases de Datos**.
3. Haz clic en **"Ejecutar"** (o usa el botón **"Recargar BD"** en la Consola de Sistema).
4. El frontend realiza una petición GET a `/api/db` y obtiene todas las bases de datos frescas.
5. La interfaz se actualiza instantáneamente.

**Nota:** WF-099 **no borra ni reinicia** los datos. Solo recarga lo que hay en disco. Si los archivos JSON están corruptos, primero deberás restaurarlos (ver sección 11).

**El Razonamiento (¿por qué es importante?):** El frontend mantiene una copia en memoria de todas las bases de datos. Si por alguna razón esta copia se desincroniza (una escritura falló, otro proceso modificó los archivos), recargar desde el servidor restaura la coherencia.

**Resultado Esperado:** El frontend refleja exactamente el estado de los archivos JSON en disco.

---

## 6. Modo Simulación (Cuarto de Juegos de Guerra) vs. LIVE (Terreno Real)

### 6.1 El interruptor de modo

El toggle **SIMULACIÓN / LIVE** está ubicado en la barra superior. Su estado persiste durante la sesión del navegador pero **se reinicia al recargar la página**.

| Modo | Color del toggle | ¿Se persisten los cambios? | ¿Llamadas al backend? |
|------|-----------------|----------------------------|----------------------|
| **LIVE** | Rojo/Carmesí | Sí, se escriben en disco | Sí, POST reales a Express |
| **SIMULACIÓN** | Naranja/Dorado | No, solo en memoria | No, se interceptan y devuelven respuestas simuladas |

### 6.2 Comportamiento en SIMULACIÓN

Cuando el interruptor está en modo SIMULACIÓN:

**addTransaction (Nueva Transacción):**
- Se ejecuta toda la lógica de creación de activos (BD3), transacciones (BD2) y lotes (BD1) **en memoria**.
- Las llamadas a `postDb` (que normalmente escriben en disco) se **interceptan** y devuelven una respuesta simulada: `{ ok: true, simulation: true }`.
- El estado local de React se actualiza: ves los cambios en la interfaz.
- Los archivos JSON en disco **permanecen intactos**.

**refreshMarketPrices (Actualizar Precios):**
- **No** se realiza la llamada HTTP a CoinGecko.
- En su lugar, se simula una variación de precio del **±1% aleatorio** en todos los activos existentes.
- Las marcas de tiempo SSOT (`fechaSSTPrecio`) se actualizan al momento actual.
- Los lotes de BD1 y el nodo BD0 se recalculan en memoria.

**Consola de Datos — Agregar registro:**
- El botón "Agregar" se **deshabilita** en modo simulación.
- No se permite simular altas directas en las bases de datos.

**Indicación visual:**
- El botón de confirmar transacción en el Dashboard muestra `[SIM] Simular Transacción`.
- Los mensajes de confirmación llevan el prefijo `[SIMULACIÓN]`.

### 6.3 Comportamiento en LIVE

Cuando el interruptor está en modo LIVE:

**addTransaction:**
- Cada transacción ejecuta 4 POST secuenciales al backend: BD3 → BD2 → BD1 → BD0.
- Cada POST pasa por un proceso de validación de payload en el servidor:
  - Verifica que el payload sea un objeto JSON válido.
  - Verifica que el campo `database` coincida con el nombre de la base de datos.
  - Verifica que `records` sea un array.
  - Para BD0: verifica que haya exactamente 1 registro y que `systemName` sea "SISTEMA MIKOKO".
- El backend implementa **escritura atómica** (ver sección 9.5).
- Si algún paso falla, el error se muestra en la banda roja y los datos previos se preservan.

**refreshMarketPrices:**
- Se realiza una llamada POST a `/api/market/prices` con los activos a actualizar.
- El backend busca el ID de CoinGecko de cada activo (por el campo `coingeckoId` o por la URL en `enlaceCoinGecko`, o resolviéndolo por ticker).
- Se solicita precio, market cap, volumen 24h y cambio 24h.
- **Solo se transmiten identificadores de activos a CoinGecko.** No se envían cantidades, balances ni datos de cartera.

### 6.4 Reglas de validación en modo LIVE

Cuando el sistema está en LIVE y se ejecuta una transacción:

1. **Validación de campos:** ticker no vacío, cantidad > 0, precio ≥ 0.
2. **Búsqueda en BD3:** Si el ticker no existe, se crea un pasaporte borrador con `estadoTesis: "PENDIENTE"`.
3. **Evaluación de tesis:**
   - Si `estadoTesis === "APROBADA"`: la transacción modifica BD1 (crea o actualiza lotes).
   - Si `estadoTesis !== "APROBADA"`: la transacción se registra en BD2 pero **no modifica BD1** (Strict Block).
4. **Sincronización de BD0:** Se actualizan los rollups.

**Importante:** En modo LIVE, las operaciones pueden ser bloqueadas por el checksum. Si alguno de los ejes bloqueantes (EJE-1, EJE-2, EJE-P, EJE-L) está en rojo, el checksum mostrará "BLOCKED" y aunque el formulario de transacción sigue operativo, las nuevas transacciones no modificarán BD1. Ver sección 7.

### 6.5 Estrategias de uso

| Escenario | Modo recomendado |
|-----------|------------------|
| Registrar una compra real | LIVE |
| Probar cómo afectaría una compra hipotética | SIMULACIÓN |
| Ver el impacto de un rebalanceo antes de ejecutarlo | SIMULACIÓN |
| Actualizar precios para tu sesión diaria | LIVE |
| Hacer limpieza o pruebas de concepto | SIMULACIÓN |
| Modificar datos directamente en la Consola de Datos | LIVE (es el único modo disponible) |

---

## 7. El Checksum — El Sistema de Soporte Vital (6 Ejes)

El checksum es el **sistema de diagnóstico continuo** de MIKOKO. Evalúa 6 dimensiones críticas del sistema y produce un veredicto. Es tu indicador de salud número 1. Revísalo **cada vez que entres al Dashboard**.

### 7.1 ¿Cómo funciona?

El checksum se calcula **exclusivamente del lado del frontend** (React). Cada vez que los datos cambian (nueva transacción, actualización de precios, recarga), se recalcula automáticamente.

Toma los datos de BD0, BD1 y BD3 y evalúa cada eje.

### 7.2 Los 6 ejes

#### EJE-1: Contabilidad

| Campo | Qué valida |
|-------|------------|
| Código | `EJE-1-NODO-DESCONECTADO`, `EJE-1-DENOMINADOR-CERO`, `EJE-1-DRY-GT-TOTAL`, `EJE-1-LOTES-HUERFANOS` |
| Cálculo | Verifica: (a) que BD1 tenga lotes activos, (b) que el total sea > 0, (c) que el polvo seco no exceda el total, (d) que no haya lotes desvinculados |
| **Rojo si** | Cualquiera de las verificaciones falla |
| **Impacto** | **BLOQUEANTE** — No se pueden ejecutar transacciones |
| **Solución** | Revisar BD1 y BD0 en la Consola de Datos. Crear lotes auditados. Ejecutar WF-020. |

#### EJE-2: Precios

| Campo | Qué valida |
|-------|------------|
| Código | `EJE-2-PRECIOS-OBSOLETOS` |
| Cálculo | Recorre los activos de BD3. Para cada activo que tenga capital en BD1, verifica que `fechaSSTPrecio` tenga menos de 24h de antigüedad. |
| **Rojo si** | Uno o más activos con capital tienen precio obsoleto (>24h) |
| **Impacto** | **BLOQUEANTE** — No se pueden ejecutar transacciones |
| **Solución** | Ejecutar WF-030 (Actualizar Precios). Si CoinGecko no responde, ver sección 11. |

#### EJE-3: Auditoría

| Campo | Qué valida |
|-------|------------|
| Código | `EJE-3-NUNCA-AUDITADO`, `EJE-3-AUDITORIA-VENCIDA`, `EJE-3-AUDITORIA-ATENCION` |
| Cálculo | Compara la fecha de la última auditoría (`lastAuditDate` en BD0) con la fecha actual. |
| **Rojo si** | Nunca auditado o última auditoría > 30 días |
| **Amarillo si** | Auditoría entre 14 y 30 días |
| **Impacto** | **BLOQUEANTE** en rojo. Amarillo no bloquea |
| **Solución** | Ejecutar WF-020 (Reconciliación Contable) y actualizar `lastAuditDate` en BD0. |

#### EJE-4: Psicología

| Campo | Qué valida |
|-------|------------|
| Código | `EJE-4-OK`, `EJE-4-ALERTA`, `EJE-4-CRITICO` |
| Cálculo | Evalúa la puntuación del operador (`operatorScore` en BD0, rango 1-10). |
| **Naranja si** | `operatorScore > 7` (Alerta: "Reducir tamaño de operación al 50%") |
| **Amarillo si** | `operatorScore > 9` (Crítico: "Reducir tamaño de operación al 25%") |
| **Impacto** | **NO bloqueante** — Es informativo, no bloquea operaciones |
| **Solución** | Registrar tu estado psicológico objetivo en BD15 (Estado del Operador) antes de cada sesión. Si tu puntuación es alta, reduce el tamaño de tus operaciones. |

#### EJE-P: Pirámide (Piramidal)

| Campo | Qué valida |
|-------|------------|
| Código | `EJE-P-SIN-DATOS`, `EJE-P-TIER1-VACIO`, `EJE-P-INVERTIDA`, `EJE-P-ALPHA-ALTO` |
| Cálculo | Verifica: (a) que Tier 1 tenga capital, (b) que Tier 3+4 no exceda Tier 1, (c) que el capital de alto riesgo no supere el 30% del total. |
| **Rojo si** | Tier 1 vacío, o Tier 3+4 > Tier 1 (pirámide invertida), o sin datos |
| **Amarillo si** | Tier 3+4 > 30% del total (pero no supera Tier 1) |
| **Impacto** | **BLOQUEANTE** en rojo. Amarillo no bloquea |
| **Solución** | Rebalancear: vender posiciones de alto riesgo o aportar capital a Tier 1. |

#### EJE-L: Liquidez

| Campo | Qué valida |
|-------|------------|
| Código | `EJE-L-SIN-DATOS`, `EJE-L-CRITICO`, `EJE-L-BAJO` |
| Cálculo | Calcula el porcentaje de polvo seco (stablecoins líquidas) sobre el total. |
| **Rojo si** | `polvoSeco / total < 10%` |
| **Amarillo si** | `polvoSeco / total < 20%` |
| **Impacto** | **BLOQUEANTE** en rojo. Amarillo no bloquea |
| **Solución** | Vender activos para generar liquidez o aportar capital externo. |

### 7.3 Veredictos

| Veredicto | Significado | Acción recomendada |
|-----------|-------------|-------------------|
| **AUTHORIZED** | Todos los ejes en verde. Sistema listo para operar. | Operar con normalidad. |
| **CAUTION** | Hay ejes en amarillo/naranja pero ninguno bloqueante. | Revisar los ejes afectados. Programar correcciones. |
| **BLOCKED** | Uno o más ejes bloqueantes en rojo. | No abrir nuevas posiciones. Resolver los ejes rojos antes de operar. |

**Resumen:** El veredicto aparece en tres lugares simultáneamente:
1. En el badge de la barra superior.
2. En el indicador luminoso al pie de la barra lateral.
3. En la tarjeta "Checksum" del Dashboard.

### 7.4 ¿Cómo afecta a las operaciones?

Cuando el checksum está en **BLOCKED**:
- El formulario de Nueva Transacción sigue siendo funcional.
- Pero las transacciones nuevas se registran en **Strict Block**: el activo se crea/actualiza en BD3 y la transacción en BD2, pero **no se modifica BD1**.
- Esto significa que el capital no se mueve, los totales no cambian, y la cartera permanece congelada hasta que se resuelvan los ejes bloqueantes.

El sistema no te impide físicamente registrar transacciones, pero impide que afecten a tu capital. Es un recordatorio disciplinado de que el sistema no puede garantizar la integridad de los cálculos hasta que los ejes estén verdes.

---

## 8. La Pirámide Estratégica — Doctrina de Asignación de Capital

### 8.1 El principio del Riesgo Dinámico

En MIKOKO, el riesgo de un activo **no es estático**. No depende solo del activo en sí, sino de **dónde está desplegado** y **para qué se usa**.

Ejemplo: 1 ETH en un hardware wallet no tiene el mismo perfil de riesgo que 1 ETH usado como colateral en un protocolo de préstamo. El primero es almacenamiento de valor (Tier 1), el segundo es una posición activa con riesgo de liquidación (Tier 3).

Por eso, en MIKOKO, el riesgo se asigna a cada **lote de capital** en BD1, no al tipo de activo en general. Un mismo activo (ETH) puede tener lotes en diferentes Tiers simultáneamente.

### 8.2 Los 4 niveles (Tiers)

| Tier | Nombre | Función | Tipo de activo esperado | % Objetivo recomendado |
|------|--------|---------|------------------------|----------------------|
| **Tier 1** | Reserva | Defensa y combustible. Capital que no debe perderse. | Stablecoins, efectivo, BTC/ETH en cold storage | 25-40% |
| **Tier 2** | Rendimiento | Generación de yield sobre capital estable. | Staking, LPs, yield farming de bajo riesgo | 20-30% |
| **Tier 3** | Alpha | Crecimiento controlado. Grandes capitalizaciones. | BTC, ETH, L1/L2 top, blue-chip DeFi | 15-25% |
| **Tier 4** | Especulación | Ataques tácticos de alta recompensa. | Small caps, alts, NFTs, nuevas oportunidades | 5-15% |

### 8.3 Contabilidad de Sobres (Gestión de Liquidez)

Toda la liquidez en stablecoins se clasifica en uno de estos "sobres" mediante la propiedad `liquidityLabel` del lote en BD1:

| Sobre | Descripción | Etiqueta en BD1 |
|-------|-------------|-----------------|
| **Polvo Seco** | Capital disponible listo para desplegar en nuevas oportunidades. | `OPEN_ENVELOPE` |
| **Reserva de Beneficios** | Ganancias realizadas que se sacan del juego activo. | `OPEN_ENVELOPE` (con nota de origen) |
| **En Estrategia** | Capital trabajando en una posición activa (LP, staking, préstamo). | `NO_LIQUIDITY` |
| **No Gastable** | Reserva de seguridad intocable. | `OPEN_ENVELOPE` (con etiqueta de colchón) |

**Nota técnica:** Actualmente la etiqueta de liquidez se asigna automáticamente: los activos marcados como `isStablecoin` reciben `OPEN_ENVELOPE`, y el resto reciben `NO_LIQUIDITY`. La gestión granular de sobres es una funcionalidad prevista para futuras versiones.

### 8.4 Guardarraíles (Guardrails)

Son las reglas no negociables que protegen tu cartera. El checksum monitoriza estas reglas a través del **EJE-P** y el **EJE-L**:

| Regla | Límite | Consecuencia si se viola |
|-------|--------|--------------------------|
| **Tier 1 (Base)** nunca debe caer a cero | Tier 1 > 0 | EJE-P rojo (bloqueante) |
| **Alto riesgo** (Tier 3 + Tier 4) no debe superar Tier 1 | T3+T4 ≤ T1 | EJE-P rojo (bloqueante: pirámide invertida) |
| **Alto riesgo** no debe superar el 30% del total | (T3+T4)/Total ≤ 30% | EJE-P amarillo (no bloqueante, pero requiere atención) |
| **Polvo seco** no debe bajar del 10% | Liquidez ≥ 10% | EJE-L rojo (bloqueante) |
| **Polvo seco** no debe bajar del 20% (alerta temprana) | Liquidez ≥ 20% | EJE-L amarillo (no bloqueante) |

---

## 9. Arquitectura del Sistema — Los Cimientos del Búnker

### 9.1 Paradigma operacional

MIKOKO v27.0 opera bajo un paradigma **100% localhost-only**. Ningún dato abandona la máquina del operador. La arquitectura se compone de dos procesos independientes que se ejecutan simultáneamente:

| Componente | Puerto | Tecnología | Rol |
|------------|--------|------------|-----|
| **Backend Bridge** | `127.0.0.1:5000` | Express.js (Node) | API REST, persistencia JSON, lectura de precios CoinGecko |
| **Frontend HUD** | `127.0.0.1:3001` | Vite + React 18 + Tailwind CSS | Interfaz de usuario, cálculos de checksum, visualización de cartera |

Ambos procesos se inician con un solo comando: `npm run dev`. El comando ejecuta `concurrently` para lanzar ambos procesos simultáneamente.

### 9.2 El backend bridge (Express)

El servidor Express.js escucha en `127.0.0.1:5000` y proporciona:

- **GET /api/health**: Estado del servidor, modo, puerto, ruta de almacenamiento, lista de bases de datos.
- **GET /api/db**: Devuelve todas las 22 bases de datos en un solo objeto.
- **GET /api/db/:name**: Devuelve una base de datos específica por nombre (bd0, bd1, ..., bd21).
- **POST /api/db/:name**: Guarda una base de datos. Requiere un payload con el envelope correcto.
- **POST /api/market/prices**: Obtiene precios de CoinGecko para una lista de activos.

El backend **no tiene autenticación** (no es necesaria, solo escucha en localhost) y tiene **CORS estricto** configurado para aceptar solo solicitudes desde `http://localhost:3001`.

### 9.3 Las 22 bases de datos

Todos los datos residen en archivos JSON planos dentro del directorio:

```
.obsidian/mikoko-moster/
```

Cada archivo representa una base de datos independiente con un esquema de envelope uniforme:

```json
{
  "database": "bd0",
  "moduleName": "Central de Datos",
  "schemaVersion": "27.0",
  "storage": {
    "mode": "LOCALHOST_ONLY",
    "path": ".obsidian/mikoko-moster",
    "remoteAuth": false,
    "telemetry": false
  },
  "dependencies": [],
  "checksum": {
    "status": "PENDING_RECALCULATION",
    "calculatedAt": null,
    "note": "Computed fields are recalculated by the application and are never persisted."
  },
  "records": [],
  "createdAt": "2026-06-01T00:00:00.000Z",
  "updatedAt": "2026-06-01T00:00:00.000Z"
}
```

#### Catálogo completo de las 22 bases de datos

| BD | Módulo | Dependencias | Propósito |
|----|--------|--------------|-----------|
| **bd0** | Central de Datos | — | Nodo soberano. Contiene el registro maestro del sistema, los totales consolidados y los links a todos los lotes de cartera. Es el punto de partida de cualquier reconciliación. |
| **bd1** | Portfolio Actual | bd0, bd2, bd3, bd11, bd12 | Almacena los lotes activos de la cartera. Cada lote representa una posición abierta con cantidad, precio de entrada, valor actual y nivel de riesgo asignado. |
| **bd2** | Transacciones | bd1, bd3, bd11 | Libro mayor inmutable. Cada transacción queda registrada con hash de integridad, categoría fiscal y subtipo operativo. No se permite eliminación de registros. |
| **bd3** | Activos Cripto | bd1 | Pasaportes de activos. Cada activo tiene ticker, nombre, precio SSOT, estado de tesis y clasificación de riesgo estático. |
| **bd4** | Parametros Piramide | bd0, bd1 | Configuración de la estructura piramidal de capital: porcentajes objetivo por nivel, umbrales de rebalanceo y métricas de salud de la pirámide. |
| **bd5** | Estrategias DeFi | bd3, bd11 | Registro de estrategias de yield farming, staking y provisión de liquidez. |
| **bd6** | Tareas y Alertas | bd0 | Sistema de notificaciones y tareas pendientes. Alertas de precios, recordatorios de rebalanceo y avisos de auditoría. |
| **bd7** | Proyectos y Protocolos | bd3, bd8 | Fichas técnicas de proyectos cripto: tokenomics, equipo, riesgos identificados. |
| **bd8** | Notas y Analisis | bd3, bd7 | Notas de investigación, análisis fundamental y técnico, tesis de inversión desarrolladas por el operador. |
| **bd9** | Campanas Airdrop | bd3, bd11 | Seguimiento de campañas de airdrop: estado, requisitos, fechas límite y valor estimado. |
| **bd10** | Glosario Cripto | — | Diccionario de términos técnicos, definiciones y referencias cruzadas. |
| **bd11** | Ubicaciones | bd1 | Registro de exchanges, wallets, direcciones de contrato y bridges utilizados. |
| **bd12** | Posiciones Activas | bd1, bd5 | Vista consolidada de posiciones abiertas con datos en tiempo real de rendimiento y P&L. |
| **bd13** | NFTs | bd14 | Catálogo de NFTs: metadata, costos base, valor estimado y vínculos a mercado. |
| **bd14** | Diario Cripto | bd0, bd15 | Registro cronológico de operaciones, eventos de mercado y decisiones del operador. |
| **bd15** | Estado del Operador | bd0 | Puntuación psicológica del operador (1-10). Evalúa la objetividad y disciplina. Afecta el EJE-4 del checksum. |
| **bd16** | Pitacoras Inbox | bd6, bd7, bd8 | Bandeja de entrada para enlaces, ideas rápidas y records pendientes de clasificar. |
| **bd17** | Prensa y Research | bd3, bd5, bd7, bd8 | Artículos, newsletters, informes de investigación externos. |
| **bd18** | Herramientas | bd5, bd7, bd8 | Catálogo de herramientas, calculadoras, dashboards externos y scripts útiles. |
| **bd19** | Contactos | bd2, bd5, bd7 | Red de contactos del ecosistema cripto: traders, desarrolladores, asesores. |
| **bd20** | Reconciliaciones | bd0, bd1, bd2 | Historial de conciliaciones realizadas. Cada reconciliación compara bd1 contra bd0 y genera un reporte de diferencias. |
| **bd21** | Snapshots Contables | bd0, bd1, bd20 | Instantáneas periódicas del estado contable del sistema para trazabilidad histórica. |

### 9.4 Single Source of Truth (SSOT)

El principio SSOT de MIKOKO establece una **jerarquía de autoridad** entre las bases de datos:

1. **bd3** es la fuente autoritativa para **precios de activos**. El campo `fechaSSTPrecio` define la última actualización de precio. Ningún otro componente del sistema puede establecer un precio sin pasar por bd3.
2. **bd2** es el **libro mayor inmutable**. Ninguna transacción puede ser modificada o eliminada una vez registrada. Es la fuente de verdad para todas las operaciones.
3. **bd1** es un **derivado de bd2 + bd3**: los lotes se recalculan a partir de las transacciones aprobadas. No se pueden crear lotes manualmente sin una transacción que los respalde.
4. **bd0** es un **rollup de bd1**: contiene los totales consolidados que alimentan el Dashboard. No se pueden modificar manualmente los totales; se recalculan automáticamente al sincronizar.

### 9.5 Escritura atómica

El bridge local Express implementa un protocolo de **escritura atómica** para prevenir la corrupción de datos durante cortes de energía o fallos del sistema:

1. Cuando se recibe un POST para guardar una base de datos:
   a. Se crea un archivo temporal: `bd0.json.{PID}.{TIMESTAMP}.tmp`
   b. Se escribe el contenido completo en el archivo temporal.
   c. Se hace `fsync()` para asegurar que los datos lleguen al disco.
   d. Se cierra el archivo temporal.
   e. Se renombra (`rename()`) el archivo temporal sobre el archivo original (operación atómica a nivel de sistema de archivos).
2. Si existe un archivo previo, se copia a `bd0.json.bak` **antes** de la escritura.
3. Si el proceso falla durante la escritura, el archivo `.tmp` se elimina automáticamente y el archivo original permanece intacto.
4. Si hay múltiples escrituras simultáneas a la misma base de datos, se encolan y ejecutan secuencialmente para evitar condiciones de carrera.

### 9.6 Tecnologías utilizadas

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Node.js | ≥ 18 | Entorno de ejecución del servidor |
| Express | 4.21.x | Framework HTTP del backend bridge |
| React | 18.3.x | Biblioteca de interfaz de usuario |
| Vite | 6.x | Bundler y servidor de desarrollo del frontend |
| Tailwind CSS | 3.4.x | Framework de estilos utilitario |
| Lucide React | 0.468.x | Librería de iconos |
| Concurrently | 9.x | Lanzador de procesos paralelos |
| PostCSS / Autoprefixer | — | Procesamiento de CSS |
| CoinGecko API | v3 | Fuente de precios de mercado (solo lectura) |

---

## 10. Respaldos y Seguridad — Protocolo de Supervivencia

### 10.1 Principio de Soberanía

MIKOKO no utiliza servicios en la nube, bases de datos remotas ni sistemas de telemetría. Todos los datos residen en archivos JSON dentro del directorio:

```
/home/tu-usuario/mikoko-moster/.obsidian/mikoko-moster/
```

La **integridad y disponibilidad** de estos archivos es responsabilidad exclusiva del operador. No hay copias de seguridad automáticas, ni versionado, ni "papelera de reciclaje". Si borras un archivo, se pierde para siempre a menos que tengas un respaldo externo.

### 10.2 Procedimiento de Respaldo en Frío

**Frecuencia recomendada:** Cada 7 días, o inmediatamente después de cada sesión de operaciones significativa.

**Paso 1: Detener el sistema**

```bash
# Identificar procesos activos
lsof -i :5000 -i :3001

# Detener (Ctrl+C en la terminal donde se ejecuta)
# O forzar la detención:
kill $(lsof -ti :5000) $(lsof -ti :3001) 2>/dev/null
```

**Paso 2: Verificar la integridad de los archivos**

```bash
cd /ruta/a/mikoko-moster
ls -la .obsidian/mikoko-moster/
# Verificar que los 22 archivos .json estén presentes
# Confirmar que ningún archivo .tmp permanezca en el directorio

# Verificar que todos los JSON tengan sintaxis válida
for f in .obsidian/mikoko-moster/*.json; do
  node -e "JSON.parse(require('fs').readFileSync('$f','utf8'))" \
  && echo "$f OK" || echo "$f CORRUPTO"
done
```

**Paso 3: Copiar a medio extraíble (USB)**

```bash
# Montar el dispositivo USB
sudo mount /dev/sdb1 /mnt/usb

# Crear un directorio con fecha
BACKUP_DIR="/mnt/usb/mikoko-backup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Copiar los datos
cp -R .obsidian/mikoko-moster/ "$BACKUP_DIR/"

# Verificar la integridad de la copia
diff -r .obsidian/mikoko-moster/ "$BACKUP_DIR/"

# Desmontar seguro
sync
sudo umount /mnt/usb
```

**Paso 4: Almacenar en custodia física**

- Guardar el USB en una caja de seguridad ignífuga.
- Mantener una segunda copia en una ubicación geográfica diferente.
- Etiquetar el medio con la fecha y versión del sistema (v27.0).

### 10.3 Procedimiento de Restauración

```bash
# Detener el sistema si está en ejecución
kill $(lsof -ti :5000) $(lsof -ti :3001) 2>/dev/null

# Hacer backup del estado actual por precaución
mv .obsidian/mikoko-moster .obsidian/mikoko-moster-corrupted

# Restaurar desde el respaldo
cp -R /ruta/al/respaldo/mikoko-backup-YYYYMMDD/ .obsidian/mikoko-moster/

# Reiniciar el sistema
npm run dev
```

### 10.4 Seguridad del Entorno

| Medida | Implementación |
|--------|---------------|
| **Aislamiento de red** | El servidor Express escucha exclusivamente en `127.0.0.1` (localhost). No es accesible desde la red local ni desde Internet. |
| **CORS estricto** | Solo se aceptan solicitudes desde `http://localhost:3001` (origin exacto). |
| **Sin telemetría** | El sistema no envía ningún dato a servidores externos. La única conexión saliente es a la API pública de CoinGecko para obtener precios, y solo transmite identificadores de activos (tickers), no cantidades, balances ni datos de cartera. |
| **Sin autenticación remota** | No hay cuentas, tokens, ni credenciales. El sistema asume un solo operador humano frente a la máquina. |
| **Encabezados de seguridad** | Express deshabilita el header `x-powered-by`. |
| **Límite de payload** | Express limita el tamaño del cuerpo de las peticiones a 2MB. |

---

## 11. Solución de Problemas — Diagnóstico y Reparación

### 11.1 Issue A: Puerto 3001 o 5000 Bloqueados

**Síntoma:** Al ejecutar `npm run dev`, aparece:

```
Error: listen EADDRINUSE :::5000
Error: listen EADDRINUSE :::3001
```

**Causa:** Un proceso anterior de MIKOKO no terminó correctamente y sigue ocupando el puerto.

**Solución inmediata:**

```bash
# Matar procesos en los puertos de MIKOKO
kill $(lsof -ti :5000) $(lsof -ti :3001) 2>/dev/null

# Verificar que estén libres
lsof -i :5000 -i :3001
# Si no muestra salida, los puertos están libres
```

**Solución preventiva (un solo comando):**

```bash
kill $(lsof -ti :5000) 2>/dev/null; kill $(lsof -ti :3001) 2>/dev/null; npm run dev
```

**Solución alternativa (cambiar puertos):**

Si el puerto 5000 está permanentemente ocupado por otro servicio:

1. En `server.js`, modificar `const PORT = 5000;` a un puerto disponible (ej: 5001).
2. En `vite.config.js`, modificar `port: 3001` a otro puerto (ej: 3002).
3. En `src/hooks/useMikoko.jsx`, actualizar `const API_BASE = "http://localhost:5001";`.
4. En `server.js`, actualizar `const FRONTEND_ORIGIN = "http://localhost:3002";`.

### 11.2 Issue B: CoinGecko API Offline o Rate-Limited

**Síntoma:** Al hacer clic en "Actualizar Precios", aparece:

```
No se pudieron actualizar los precios de mercado.
```

con detalle de `HTTP 429` (rate limit) o `fetch failed` (sin conexión).

**Comportamiento del sistema:**

Cuando los precios no se actualizan por más de 24 horas, el **EJE-2** cambia a rojo con código `EJE-2-PRECIOS-OBSOLETOS`. Consecuencias:

1. El veredicto del checksum cambia a `BLOCKED`.
2. El indicador de la barra superior se vuelve rojo.
3. En el Dashboard, la sección Precios Obsoletos muestra los tickers afectados.
4. Las nuevas transacciones no modificarán BD1 (Strict Block) hasta que se restauren los precios.

**CoinGecko API — Límites conocidos:**

- Plan gratuito (demo): 10-30 llamadas/minuto.
- Se solicita un máximo de 100 activos por llamada.
- El endpoint utilizado es `api.coingecko.com/api/v3/simple/price`.

**Procedimiento de recuperación:**

1. **Verificar conectividad:**

```bash
curl -s -o /dev/null -w "%{http_code}" https://api.coingecko.com/api/v3/ping
```

- `200`: CoinGecko accesible.
- `429`: Rate limit excedido. Esperar 1-2 minutos.
- Sin respuesta: Sin conexión a Internet.

2. **Recuperación automática:** Esperar 2 minutos y reintentar. El rate limit de CoinGecko se restablece por minuto.

3. **Override manual (solo en SIMULACIÓN):** Activar el modo SIMULACIÓN y ejecutar "Actualizar Precios". El sistema asignará precios simulados (±1% de variación) sin llamar a CoinGecko.

4. **Override manual (modo LIVE):** Editar directamente el archivo JSON de BD3 para establecer precios y fechas SSOT manualmente:

```bash
node -e "
const fs = require('fs');
const path = '.obsidian/mikoko-moster/bd3.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));
const btc = data.records.find(r => r.ticker === 'BTC');
if (btc) {
  btc.precioUnitarioUSD = 67500;
  btc.fechaSSTPrecio = new Date().toISOString();
  btc.ultimaEdicion = new Date().toISOString();
}
fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
console.log('Precio BTC actualizado manualmente.');
"
```

5. **Revalidación:** Una vez restaurados los precios, recargar el frontend (F5). El EJE-2 debería cambiar a verde.

### 11.3 Issue C: Corrupción de Datos por Apagado Inesperado

**Síntoma:** Al reiniciar el sistema después de un corte eléctrico o cierre forzado, el frontend muestra errores como "No se pudo obtener bdX" o la aplicación se queda en estado de carga indefinidamente.

**Mecanismo de protección integrado:**

El bridge local Express implementa el protocolo de escritura atómica descrito en 9.5. El archivo `.bak` es tu red de seguridad: siempre contiene la versión anterior íntegra del archivo antes de la última escritura.

**Procedimiento de recuperación:**

**Paso 1 — Identificar archivos corruptos:**

```bash
cd /ruta/a/mikoko-moster/.obsidian/mikoko-moster

# Buscar archivos temporales residuales
ls -la *.tmp 2>/dev/null

# Verificar que todos los JSON tengan sintaxis válida
for f in *.json; do
  node -e "try { JSON.parse(require('fs').readFileSync('$f','utf8')); console.log('$f: OK'); } catch(e) { console.log('$f: CORRUPTO - ' + e.message); }"
done
```

**Paso 2 — Restaurar desde backup automático (.bak):**

```bash
# Para cada archivo corrupto, restaurar desde .bak
cp bd0.json.bak bd0.json
```

**Paso 3 — Restaurar desde respaldo en frío:**

```bash
# Si no hay backup .bak o también está corrupto
cp /ruta/al/respaldo/mikoko-backup-YYYYMMDD/bd0.json .obsidian/mikoko-moster/bd0.json
```

**Paso 4 — Reconstruir desde semilla (último recurso):**

```bash
# Detener el servidor
kill $(lsof -ti :5000) 2>/dev/null

# Eliminar todas las bases de datos
rm -rf .obsidian/mikoko-moster/

# Reiniciar el servidor para que regenere las semillas
npm run dev
```

El servidor llamará a `initializeDatabases()` que creará archivos vacíos para todas las 22 bases de datos con la estructura de envelope correcta.

**Paso 5 — Verificar la integridad del sistema restaurado:**

1. Abrir el frontend en `http://localhost:3001`.
2. Confirmar que el Dashboard carga sin errores.
3. Verificar que los datos restaurados son correctos navegando por las diferentes vistas.
4. Si se restauró desde semilla, los datos se habrán perdido. Reprovisionar desde respaldo o reintroducir manualmente.

### 11.4 Issue D: Error de CORS

**Síntoma:** En la consola del navegador aparece:

```
CORS origin not allowed by MIKOKO local bridge.
```

**Causa:** El frontend se está sirviendo desde un origen diferente a `http://localhost:3001`.

**Causas comunes:**
- Acceder desde `http://127.0.0.1:3001` en lugar de `http://localhost:3001`.
- Tener un proxy o VPN que modifique el origen.
- Haber cambiado el puerto del frontend sin actualizar la configuración CORS del backend.

**Solución:** Acceder al frontend exclusivamente desde `http://localhost:3001`. Si necesitas usar otro puerto, actualiza `FRONTEND_ORIGIN` en `server.js`.

### 11.5 Issue E: Error de Icono Faltante

**Síntoma:** El frontend carga pero muestra un error en consola como:

```
The component X is not exported from lucide-react.
```

**Causa:** La versión de `lucide-react` no incluye un icono que el código está importando.

**Solución:**

```bash
# Verificar la versión instalada
node -e "console.log(require('lucide-react/package.json').version)"

# Listar iconos disponibles que contengan una palabra clave
node -e "const l=require('lucide-react'); console.log(Object.keys(l).filter(k => k.includes('User')).join('\n'))"
```

Reemplazar el icono faltante por uno existente en el archivo correspondiente.

### 11.6 Issue F: JSX en archivo .js

**Síntoma:** Vite muestra:

```
Failed to parse source for import analysis
```

**Causa:** Código JSX en un archivo con extensión `.js` (debería ser `.jsx`).

**Solución:** Renombrar el archivo a `.jsx`.

### 11.7 Mantenimiento Preventivo

| Tarea | Frecuencia | Comando / Acción |
|-------|------------|------------------|
| Verificar integridad JSON | Semanal | `for f in .obsidian/mikoko-moster/*.json; do node -e "JSON.parse(require('fs').readFileSync('$f','utf8'))" && echo "$f OK" \|\| echo "$f CORRUPTO"; done` |
| Backup a USB | Semanal | Ver sección 10.2 |
| Limpiar archivos .tmp | Diario | `rm -f .obsidian/mikoko-moster/*.tmp` |
| Verificar puertos libres | Al iniciar | `lsof -i :5000 -i :3001` |
| Actualizar precios | Diario | Botón "Actualizar Precios" en Dashboard |
| Auditoría de cartera | Cada 14 días | WF-020 Reconciliación |
| Revisar estado del checksum | Cada sesión | Observar el indicador en la barra superior |
| Verificar versión de lucide-react | Tras actualizar | `node -e "console.log(require('lucide-react/package.json').version)"` |

---

## 12. Buenas Prácticas y Doctrina Operativa

### 12.1 Las 5 Doctrinas del Comandante Disciplinado

#### Doctrina nº1: El Dashboard es tu Único Punto de Entrada

**La doctrina:** Toda sesión de trabajo en MIKOKO debe comenzar y terminar en el **Dashboard**. Es tu ritual pre-vuelo.

**El antipatrón ("Navegación caótica"):** Abrir el sistema y hacer clic en lo primero que ves en la barra lateral. Esto te lleva a reaccionar a datos sin contexto, a perder el foco y a ignorar las prioridades que tú mismo estableciste.

**El refuerzo en MIKOKO:** La Matriz de Integridad del Dashboard. El hábito es simple: abres el sistema → miras el checksum → observas las métricas principales. Esto te dice qué es **urgente** antes de que te pierdas en lo que es meramente **interesante**.

#### Doctrina nº2: La Inmediatez del Registro

**La doctrina:** Aplica la "Regla de los 2 Minutos" a toda transacción. Si te lleva menos de dos minutos registrarlo, hazlo en el momento.

**El antipatrón ("Deuda de datos"):** Pensar "ya lo apuntaré luego". Cada transacción no registrada es una deuda que contraes con tu futuro yo. Se acumula, corrompe la precisión del sistema, y te obliga a pasar horas auditando tu propio desorden.

**El refuerzo en MIKOKO:** El formulario de Nueva Transacción en el Dashboard está diseñado para que registrar una operación te lleve menos de 60 segundos.

#### Doctrina nº3: Zero tolerancia con los precios obsoletos

**La doctrina:** No operes si el EJE-2 está en rojo. Sin precios actualizados, todas las métricas derivadas son incorrectas.

**El antipatrón ("Seguir a ciegas"):** Ignorar el aviso de precios obsoletos y registrar transacciones de todos modos. Como están en Strict Block, no afectan a BD1, pero creas un falso sentido de actividad.

**El refuerzo en MIKOKO:** El checksum bloquea las operaciones si los precios no están actualizados.

#### Doctrina nº4: Registro honrado del estado psicológico

**La doctrina:** Registra tu estado mental (BD15) antes de cada sesión de operaciones. El EJE-4 existe por una razón: el peor enemigo del inversor es él mismo.

**El antipatrón ("Sobreestimar el autocontrol"):** Negarse a registrar que estás operando con fatiga, después de una pérdida, o en un estado de euforia.

**El refuerzo en MIKOKO:** El EJE-4 evalúa tu puntuación y te alerta si estás en un estado psicológico de riesgo.

#### Doctrina nº5: Respeta la jerarquía de datos (SSOT)

**La doctrina:** No modifiques BD1 o BD0 manualmente. Siempre que necesites cambiar un dato, hazlo a través de BD3 (activos) o BD2 (transacciones). El sistema derivará los cambios automáticamente.

**El antipatrón ("Atajo peligroso"):** Editar directamente BD0 para corregir un total que no cuadra, en lugar de rastrear y corregir la transacción origen.

**El refuerzo en MIKOKO:** El sistema recalcula BD0 automáticamente. Si un total no coincide, el problema está en los datos de origen (BD3, BD2, BD1), no en BD0.

### 12.2 Consejos Pro

#### 1. Usa el modo simulación como cuarto de guerra

Antes de ejecutar cualquier maniobra significativa (un rebalanceo, una entrada grande), simúlala primero. Ajusta los sliders en la Estación de Análisis, activa la simulación, registra la transacción hipotética y observa cómo cambian las métricas. Si el resultado no te convence, recarga la página y todo vuelve a la normalidad.

#### 2. La tabla de activos como tu radar

La tabla de activos en el Dashboard te muestra de un vistazo: qué tienes, cuánto vale, si los precios están actualizados y si el activo está aprobado. Acostúmbrate a escanearla visualmente al empezar cada sesión. Presta atención especial a la columna "Tesis" y "Actualización".

#### 3. La reconciliación como tu seguro

El WF-020 no solo audita el sistema: te entrena para ser meticuloso. Al ejecutarlo periódicamente, desarrollas el hábito de la revisión constante.

#### 4. El glosario como tu referencia

Cuando encuentres un término que no entiendas en este manual, consulta el [Glosario](#14-glosario-de-términos-mikoko). Si el término no está, es porque no forma parte del sistema MIKOKO.

---

## 13. FAQ — Base de Conocimiento

### Primeros pasos y operaciones básicas

**P: ¿Cómo registro comisiones de gas (gas fees)?**
**R:** Para un swap, incluye el gas en el coste del activo que vendes. Para una transferencia simple, crea una transacción separada de tipo "Vender" con cantidad 0 y precio igual al coste del gas.

**P: ¿Cómo registro un Airdrop?**
**R:** Usa el formulario de Nueva Transacción, selecciona Tipo "Comprar", introduce el ticker del activo, la cantidad recibida, y pon Precio unitario = 0 (o el coste del gas para reclamarlo si lo pagaste).

**P: ¿Y las recompensas de Staking o de una Pool de Liquidez?**
**R:** Igual que un airdrop: Transacción tipo "Comprar" con precio 0.

**P: He movido fondos entre dos de mis propias wallets. ¿Es una compra/venta?**
**R:** No. Usa el tipo "Transferir". Es un cambio de ubicación, no un evento fiscal ni una modificación de tu cartera.

**P: El valor de mi cartera en MIKOKO no coincide con el de mi exchange/wallet. ¿Qué hago?**
**R:** La causa más probable es una transacción no registrada en MIKOKO. Revisa tu historial de operaciones y compáralo con las transacciones en BD2. Usa la Consola de Datos para ver BD2 y detectar la discrepancia.

**P: ¿Qué significa "Strict Block"?**
**R:** Es un mecanismo de seguridad que impide que un activo no aprobado (tesis "PENDIENTE" o "INVALIDADA") afecte a tu cartera consolidada (BD1) ni a los totales (BD0). La transacción se registra en BD2 para mantener el registro histórico, pero el capital no se mueve.

**P: ¿Cómo convierto un activo de "PENDIENTE" a "APROBADA"?**
**R:** Desde la Consola de Datos, selecciona BD3 — Activos Cripto, localiza el activo, y modifica su campo `estadoTesis` a `"APROBADA"`. También puedes editar directamente el archivo JSON `bd3.json`.

### Sistema y personalización

**P: ¿Puedo cambiar los colores de la interfaz?**
**R:** Sí, editando `tailwind.config.js` en la sección `colors.mikoko`. Los colores actuales son: void (#0d0e12), panel (#141821), panel2 (#1b2230), line (#273246), text (#C8D4F0), muted (#6B7A99), emerald (#00C896), crimson (#FF3B5C), gold (#C6A15B), cyan (#00E0FF), amber (#F5A623).

**P: ¿Puedo agregar más bases de datos?**
**R:** Técnicamente sí, modificando `DB_CATALOG` en `server.js` y añadiendo la lógica correspondiente en el frontend. Pero el sistema está diseñado con 22 bases de datos que cubren todos los dominios necesarios. Antes de crear una nueva, pregúntate si el dato que quieres almacenar encaja en alguna de las existentes.

**P: ¿Cómo exporto mis datos a otro formato (CSV, Excel)?**
**R:** Actualmente MIKOKO no tiene exportación integrada. Los datos están en JSON plano dentro de `.obsidian/mikoko-moster/`. Puedes escribir un script que lea los archivos JSON y los convierta al formato que necesites.

**P: ¿Puedo usar MIKOKO desde otro dispositivo en mi red local?**
**R:** No. El sistema escucha exclusivamente en `127.0.0.1` (localhost). No es accesible desde la red local. Esto es intencional por razones de seguridad.

### Pirámide y gestión de cartera

**P: ¿Qué pasa si un activo cambia de uso y, por tanto, de riesgo? (Ej: muevo ETH de HODL a un protocolo de préstamo)**
**R:** Registra la transacción como una Transferencia (cambio de ubicación). Luego, en BD1, localiza el lote correspondiente y modifica su `finalTier` al nivel de riesgo adecuado.

**P: ¿Qué hago si el EJE-P está en rojo pero creo que no debo rebalancear?**
**R:** El checksum es una guía, no una orden. Si decides anular la señal, crea una entrada en BD14 (Diario Cripto) explicando por qué has decidido no seguir la recomendación del sistema. Documenta tu razonamiento.

**P: ¿Cada cuánto debo revisar los porcentajes objetivo de mi pirámide?**
**R:** La recomendación es una revisión estratégica trimestral. Pregúntate si tu tolerancia al riesgo o tu visión del mercado han cambiado.

---

## 14. Glosario de Términos MIKOKO

### A

- **Arquitectura localhost-only:** Filosofía de diseño del sistema. Todos los procesos escuchan en `127.0.0.1`, ningún dato sale de la máquina.
- **Atomic write (escritura atómica):** Mecanismo de persistencia que escribe primero en un archivo temporal (`.tmp`), hace `fsync()`, y luego renombra atómicamente sobre el archivo original.

### B

- **Backend bridge:** Servidor Express.js en el puerto 5000 que sirve las bases de datos JSON al frontend. Es el puente entre la interfaz de usuario y los archivos en disco.
- **BD0 a BD21:** Las 22 bases de datos del sistema. Cada una es un archivo JSON independiente.

### C

- **Checksum:** Sistema de diagnóstico de 6 ejes que evalúa la integridad del sistema y produce un veredicto: AUTHORIZED, CAUTION o BLOCKED.
- **CoinGecko:** API pública de precios de criptoactivos. MIKOKO la utiliza exclusivamente para obtener precios de mercado. Solo se transmiten identificadores de activos.
- **Consola de Datos:** Vista del HUD que permite inspeccionar y modificar directamente las 22 bases de datos.
- **CORS (Cross-Origin Resource Sharing):** Mecanismo de seguridad del navegador. MIKOKO configura CORS para aceptar solo solicitudes desde `http://localhost:3001`.

### D

- **Dashboard:** Vista principal del sistema. Muestra las métricas clave, la matriz de integridad, la asignación de capital, el formulario de transacciones y la tabla de activos.
- **Día Cero:** Fecha elegida como punto de partida para el registro histórico de la cartera. Los activos poseídos antes de esta fecha se registran con una estimación de su coste de adquisición.

### E

- **EJE-1 a EJE-L:** Los 6 ejes del checksum. Cada uno evalúa una dimensión crítica: Contabilidad, Precios, Auditoría, Psicología, Pirámide y Liquidez.
- **Envelope:** Estructura uniforme de cada archivo JSON de base de datos. Incluye metadatos (database, moduleName, schemaVersion, storage, dependencies, checksum) y el array `records`.

### G

- **Guardarraíles (Guardrails):** Reglas no negociables de gestión de riesgo monitorizadas por los ejes EJE-P y EJE-L del checksum.

### H

- **HUD (Head-Up Display):** Filosofía de diseño del Dashboard. Muestra solo la información crítica de un vistazo.
- **Hash de integridad:** Identificador único de cada transacción en BD2. Combina el internalId, la fecha y el ID de transacción.

### L

- **Launchpad de Workflows:** Vista que contiene los 6 workflows del sistema, cada uno representado como una tarjeta con botones de acción.
- **LIVE:** Modo operativo en el que las acciones se persisten en disco.
- **Lote de capital:** Representación en BD1 de una posición abierta. Un lote tiene ticker, cantidad, precio de entrada, valor actual y nivel de riesgo asignado.

### M

- **Matriz de Integridad:** Sección del Dashboard que muestra los 6 ejes del checksum con sus indicadores luminosos.

### N

- **Nodo soberano:** El registro único en BD0 que representa el sistema completo. Contiene todos los totales consolidados.

### P

- **Pasaporte de activo:** Registro de un activo en BD3. Contiene ticker, nombre, precio SSOT, estado de tesis y clasificación de riesgo.
- **Pirámide Estratégica:** Estructura de capital en 4 niveles de riesgo (Tier 1 a Tier 4). Cada nivel tiene una función, un perfil de riesgo y un porcentaje objetivo.
- **Polvo seco (Dry Powder):** Capital líquido disponible en stablecoins. Es la "munición" lista para desplegar.
- **Puntuación del operador:** Valor en BD15 (1-10) que evalúa el estado psicológico del operador. Afecta el EJE-4 del checksum.

### R

- **Razonamiento (El):** Sección en cada workflow que explica por qué el protocolo es importante. No es un adorno: es la justificación lógica de la acción.
- **Reconciliación:** Proceso de verificación de que los totales de BD1 coinciden con los de BD0.
- **Riesgo dinámico:** Principio de que el riesgo de un activo depende de su despliegue operativo, no solo del activo en sí.

### S

- **SIMULACIÓN:** Modo operativo en el que las acciones se ejecutan solo en memoria. Útil para probar escenarios hipotéticos.
- **Single Source of Truth (SSOT):** Principio de que cada dato tiene una única fuente autoritativa. En MIKOKO: BD3 para precios, BD2 para transacciones, BD1 para lotes, BD0 para totales.
- **Strict Block:** Mecanismo que impide que transacciones de activos no aprobados (tesis ≠ APROBADA) modifiquen BD1. Las transacciones se registran en BD2 pero el capital no se mueve.

### T

- **Tier (Nivel):** Cada uno de los 4 niveles de riesgo de la Pirámide Estratégica. Tier 1 (Reserva), Tier 2 (Rendimiento), Tier 3 (Alpha), Tier 4 (Especulación).
- **Toggle SIMULACIÓN/LIVE:** Interruptor en la barra superior que cambia entre modo de simulación y modo real.

### V

- **Veredicto:** Resultado del checksum. Tres posibles: AUTHORIZED (todo correcto), CAUTION (precaución, ejes amarillos), BLOCKED (ejes rojos bloqueantes).

### W

- **Workflow:** Protocolo de misión predefinido que guía al operador a través de una secuencia de pasos para completar una tarea. WF-001 a WF-099.

---

*Fin del Manual de Operaciones — MIKOKO v27.0*

*Documento generado en junio de 2026. Para soporte técnico, reportar incidencias en el repositorio oficial del proyecto.*
