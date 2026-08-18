<div align="center">
  <img src="src/assets/Guias_Prod.png" alt="Guias Produccion" width="180" />

  <h1>guias-produccion</h1>

  <p>
    Sistema de control de produccion pesquera de escritorio (Tauri) con frontend
    React. Registra la produccion diaria, controla los despachos y lleva el stock
    con trazabilidad por lote, desde la embarcacion hasta el cliente final.
  </p>

  <p>
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=000" />
    <img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=fff" />
    <img src="https://img.shields.io/badge/Tauri-2-24C8DB?logo=tauri&logoColor=fff" />
    <img src="https://img.shields.io/badge/Rust-stable-000000?logo=rust&logoColor=fff" />
    <img src="https://img.shields.io/badge/libsql-Turso-2ECC71?logo=sqlite&logoColor=fff" />
    <img src="https://img.shields.io/badge/License-MIT-0E7FC0" />
  </p>
</div>

---

## Caracteristicas

### Catalogos y productos

- Especies, presentaciones por especie, calidades y calibres.
- **Peso por unidad por defecto** configurable por especie: precarga el peso de
  caja al registrar un ingreso, sin tener que escribirlo en cada fila.
- **Variantes**: la combinacion de presentacion, calidad, calibre y ensunchado.
  Es el catalogo de lo que se *puede* producir; su codigo legible
  (`perico filete Z lp 2-5`) lo arma una vista SQL.

### Ingresos (partes de produccion)

- Cabecera con cliente, fecha, turno, codigo de trazabilidad, tipo de documento
  y motivo de ingreso.
- Recepcion con transportes y embarcaciones (guia, carro, placa, matricula y
  peso recibido), que es la base para calcular el rendimiento.
- **Producto empacado en acordeon por presentacion**: al desplegar una se cargan
  10 filas con las variantes ordenadas alfabeticamente, y se pueden agregar mas.
- **Ensunchado por fila**: se marca al momento del ingreso, no al crear la
  variante. Si no existe todavia la variante ensunchada equivalente, el sistema
  la crea automaticamente.
- Navegacion con Tab/Enter **en vertical**: se completa toda una columna
  (por ejemplo Carro 1) antes de pasar a la siguiente.
- Calculo automatico de peso total neto y rendimiento contra la materia prima.

### Salidas (control de salida)

- Mismo acordeon por presentacion, con **filtros de calidad y calibre**.
- Se ofrecen los **5 lotes mas antiguos** primero (FIFO), con la fecha editable
  y el stock disponible de cada lote a la vista.
- Aviso cuando la cantidad supera lo disponible en el lote.
- Cada item registra **de que lote sale**, lo que permite descontar del stock
  correcto y reconstruir la trazabilidad.

### Stock por lote

- Un lote es la combinacion de **variante + fecha de produccion**: una misma
  variante puede tener existencias de varias fechas, cada una con su saldo.
- El stock **no se almacena**: se calcula sumando ingresos y restando salidas,
  asi nunca se desincroniza con los documentos.
- Vista con fila por variante y **desglose expandible por lote**: fecha,
  antiguedad en dias, ingresado, salido y disponible.
- Los lotes de mas de 45 dias se resaltan para facilitar la rotacion.

### Reportes

| Reporte | Responde |
| --- | --- |
| **Movimiento diario** | Matriz fecha x variante con produccion, salidas y neto, agrupada por presentacion y calibre. Incluye materia prima y rendimiento. |
| **Antiguedad** | Distribucion de existencias por tramos de dias, con grafico y detalle de los lotes mas antiguos. |
| **Historial de movimientos** | Entradas y salidas de una variante con saldo corrido y grafico de evolucion. Cada linea indica el documento que la origino. |
| **Trazabilidad** | Recorrido de un lote con diagrama de flujo: de que documento y embarcacion vino, y a que clientes se despacho. |

Filtros comunes de rango de fechas y especie. Exportacion a CSV en todos.

### Otros

- Autenticacion con usuarios y JWT (registro, login, rutas protegidas).
- Dashboard con indicadores y alertas de stock critico.
- Impresion de partes de produccion y controles de salida.
- Las fechas se validan contra el calendario real antes de guardarse y la base
  ademas rechaza cualquier formato que no sea `AAAA-MM-DD`.

## Stack

- **Frontend**: React 19, React Router, React Hook Form, Zod, Zustand, Tailwind
- **Escritorio**: Tauri 2
- **Backend**: Rust, con libsql apuntando a una base Turso remota
- **PDF**: jsPDF para la impresion de documentos
- Los graficos y diagramas de los reportes son SVG propio, sin librerias externas

## Requisitos

- **Node.js 20.19+** (lo exige Vite 7)
- **pnpm** — el proyecto usa `pnpm-lock.yaml`; instalar con `npm` falla
- **Rust** (toolchain estable) y las
  [dependencias del sistema para Tauri](https://tauri.app/start/prerequisites/)
- Una base de datos **Turso** (libsql remoto)

## Variables de entorno

Crea un archivo `.env` en `src-tauri/`:

```
TURSO_DATABASE_URL=libsql://<tu-instancia>.turso.io
TURSO_AUTH_TOKEN=<token-de-acceso>
JWT_SECRET=<secreto-jwt>
```

> El archivo esta en `.gitignore`. Sin estas variables la aplicacion no arranca.

## Instalacion

```
pnpm install
```

## Desarrollo

```
# aplicacion de escritorio (levanta Vite y la ventana de Tauri)
pnpm tauri dev

# solo el frontend en el navegador (sin acceso a la base de datos)
pnpm dev
```

> `pnpm dev` sirve para trabajar el maquetado, pero las llamadas al backend
> pasan por el puente IPC de Tauri y solo funcionan dentro de `pnpm tauri dev`.

## Build

```
# frontend
pnpm build

# instalador de escritorio
pnpm tauri build
```

## Flujo recomendado

1. Registrar **especies** (con su peso por unidad por defecto).
2. Registrar **presentaciones** por especie.
3. Completar **calidades** y **calibres**.
4. Crear las **variantes** que se van a producir.
5. Registrar **ingresos**: la fecha del parte queda como fecha de lote.
6. Registrar **salidas**, eligiendo de que lote sale cada item.
7. Consultar **stock** y **reportes**.

## Estructura

```
src/
  components/
    common/       componentes de UI reutilizables
    partes/       formulario de ingreso (produccion)
    control/      formulario de salida
    reportes/     los cuatro reportes y utilidades compartidas
    stock/        vista de stock con detalle por lote
  pages/          vistas principales
  services/       llamadas a Tauri (invoke) y autenticacion
  stores/         estado global (auth)
src-tauri/
  src/
    lib.rs        comandos Tauri
    auth.rs       usuarios y JWT
    bin/          herramienta de linea de comandos
    db/           acceso a datos, un modulo por entidad
      init.rs     tablas, vistas, indices y migraciones
      reportes.rs consultas que alimentan los reportes
      stock.rs    consultas de existencias
```

## Notas de arquitectura

- **El esquema se crea y migra al arrancar**: `init_db` crea tablas, vistas e
  indices, y aplica las migraciones pendientes. Las vistas se recrean en cada
  arranque para que los cambios de definicion se propaguen.
- **El stock es siempre calculado**, nunca almacenado. `stock_actual_view` da el
  total por variante y `stock_por_lote_view` lo desglosa por fecha de ingreso.
- **La fecha de lote se congela** en cada fila de produccion al guardarla, en vez
  de derivarse de la cabecera. Asi corregir la fecha de un documento no mueve
  retroactivamente mercaderia que ya fue despachada.
- **Los ingresos se fechan por la fecha del lote y las salidas por la fecha en
  que salio el producto**, que no tienen por que coincidir. Cada item de salida
  guarda ademas el lote que consumio.
- La exportacion de CSV la escribe el backend en la carpeta de descargas: el
  webview de Tauri bloquea las descargas por enlace.

## Scripts

- `pnpm dev` — servidor de desarrollo Vite
- `pnpm build` — build del frontend
- `pnpm preview` — previsualizar el build
- `pnpm tauri dev` — aplicacion de escritorio en modo desarrollo
- `pnpm tauri build` — generar el instalador

## Licencia

Este proyecto esta bajo licencia MIT. Ver [LICENSE](LICENSE).
