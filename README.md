# OpenWISP Model Context Protocol (MCP) Server Suite

Eine standalone, performante **Dual Model Context Protocol (MCP)** Server-Implementierung für die [OpenWISP REST API](https://openwisp.io/docs/dev/users/user/rest-api.html).

Ähnlich wie bei [authentik-mcp](https://github.com/cdmx-in/authentik-mcp) stellt dieses Repository **zwei spezialisierte MCP-Server** in einer Codebasis bereit:

1. **`openwisp-mcp-diagnostic` (Read-Only / Diagnostic Server)**
   * Bietet ausschließlich Lese- und Überwachungswerkzeuge (`GET`-Anfragen).
   * Perfekt für sicheres Monitoring, Netzwerk-Audits, Topologie-Prüfung, RADIUS-Sitzungsanalysen und Auskunft durch KI-Assistenten ohne Risiko unbeabsichtigter Netzwerkänderungen.
2. **`openwisp-mcp-full` (Full Management Server)**
   * Bietet vollen Zugriff auf alle Verwaltungsfunktionen (`GET`, `POST`, `PATCH`, `DELETE`).
   * Ermöglicht das Registrieren von Routern/Access Points, Erstellen & Ändern von NetJSON-Templates, Verwalten von Benutzerkonten und Generieren von Tokens.

Entwickelt für die einfache Bereitstellung in [McpHub (samanhappy/mcphub)](https://github.com/samanhappy/mcphub), Claude Desktop, Cursor und VS Code.

---

## ⚡ MCP Server Übersicht

| Server ID | Zweck | Tools | Transports | CLI-Befehl | Remote SSE Endpoint |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`openwisp-mcp-diagnostic`** | Audit & Monitoring (Sicher) | 15 Read-Only Tools (`GET`) | STDIO / SSE / HTTP | `npm run mcp:diagnostic` | `/diagnostic/sse` |
| **`openwisp-mcp-full`** | Vollständiges Netzwerk-Management | 22 Tools (Lesen & Schreiben) | STDIO / SSE / HTTP | `npm run mcp:full` | `/full/sse` |

---

## 🚀 Quickstart & Installation

### Voraussetzungen
* Node.js v18+ oder v20+
* npm

### 1. Repository klonen & Abhängigkeiten installieren
```bash
git clone https://github.com/dein-user/openwisp-mcp-server.git
cd openwisp-mcp-server
npm install
```

### 2. Projekt bauen (Build)
Bündelt den TypeScript-Server in ein optimiertes CommonJS-Bundle (`dist/server.cjs`):
```bash
npm run build
```

### 3. Server starten

#### A. Multi-MCP HTTP & SSE Server starten (Produktion)
```bash
npm run start
```
Der HTTP-Server läuft standardmäßig auf Port `3000` und stellt die SSE-Endpunkte `/diagnostic/sse` und `/full/sse` bereit.

#### B. Entwicklungsmodus
```bash
npm run dev
```

#### C. STDIO CLI Transports starten (für McpHub / Claude Desktop)
```bash
# Diagnostic MCP Server (Read-Only)
npm run mcp:diagnostic

# Full MCP Server (Vollzugriff)
npm run mcp:full

# Auto-Detect via Umgebungsvariable
OPENWISP_MCP_MODE=diagnostic npm run mcp
```

---

## ⚙️ Umgebungsvariablen (Environment Variables)

Die Steuerung erfolgt über Umgebungsvariablen oder HTTP-Header:

| Variable | Beschreibung | Standardwert |
| :--- | :--- | :--- |
| `OPENWISP_BASE_URL` | Basis-URL der OpenWISP Controller Instanz (z.B. `https://openwisp.example.com`) | `""` (schaltet Sandbox ein) |
| `OPENWISP_API_TOKEN` | OpenWISP API Bearer Token | `""` |
| `OPENWISP_MOCK_SANDBOX` | Wenn `true`, werden Mocks verwendet | `true` (wenn URL leer) |
| `OPENWISP_MCP_MODE` | Modus für Standard-Endpunkte (`diagnostic` oder `full`) | `full` |
| `PORT` | Der HTTP-Server-Port | `3000` |

---

## 📦 Konfiguration in McpHub (`samanhappy/mcphub`)

Du kannst wahlweise einen oder beide MCP-Server in deine McpHub / Claude Desktop-Konfiguration einbinden.

### Option A: STDIO Transport (Lokale Ausführung)

Füge folgenden Abschnitt in deine `mcp_settings.json` ein:

```json
{
  "mcpServers": {
    "openwisp-mcp-diagnostic": {
      "command": "npx",
      "args": ["-y", "openwisp-mcp-server", "--diagnostic"],
      "env": {
        "OPENWISP_BASE_URL": "https://deine-openwisp-instanz.com",
        "OPENWISP_API_TOKEN": "DEIN_OPENWISP_BEARER_TOKEN"
      }
    },
    "openwisp-mcp-full": {
      "command": "npx",
      "args": ["-y", "openwisp-mcp-server", "--full"],
      "env": {
        "OPENWISP_BASE_URL": "https://deine-openwisp-instanz.com",
        "OPENWISP_API_TOKEN": "DEIN_OPENWISP_BEARER_TOKEN"
      }
    }
  }
}
```

### Option B: Remote SSE Transport (Server / Container / Cloud)

Wenn der Server gehostet wird:

```json
{
  "mcpServers": {
    "openwisp-mcp-diagnostic": {
      "url": "https://dein-mcp-server.example.com/diagnostic/sse",
      "headers": {
        "x-openwisp-base-url": "https://deine-openwisp-instanz.com",
        "x-openwisp-token": "DEIN_OPENWISP_BEARER_TOKEN"
      }
    },
    "openwisp-mcp-full": {
      "url": "https://dein-mcp-server.example.com/full/sse",
      "headers": {
        "x-openwisp-base-url": "https://deine-openwisp-instanz.com",
        "x-openwisp-token": "DEIN_OPENWISP_BEARER_TOKEN"
      }
    }
  }
}
```

---

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

ENV PORT=3000
ENV NODE_ENV=production
ENV OPENWISP_BASE_URL="https://openwisp.example.com"
ENV OPENWISP_API_TOKEN="YOUR_API_TOKEN"

EXPOSE 3000
CMD ["npm", "run", "start"]
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  openwisp-mcp-suite:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - OPENWISP_BASE_URL=https://openwisp.example.com
      - OPENWISP_API_TOKEN=YOUR_OPENWISP_API_TOKEN
      - OPENWISP_MOCK_SANDBOX=false
    restart: always
```

---

## 📡 HTTP & SSE Endpunkte Übersicht

| Endpunkt | Methode | Modus | Beschreibung |
| :--- | :--- | :--- | :--- |
| `/` | `GET` | Beide | JSON Suite-Metadaten mit Auflistung beider MCP-Server. |
| `/health` | `GET` | System | Healthcheck für Container / Load Balancer. |
| `/diagnostic/sse` | `GET` | Diagnostic | SSE Stream für den Diagnostic MCP Server. |
| `/diagnostic/mcp` | `POST` | Diagnostic | JSON-RPC 2.0 Request-Handler für Read-Only Diagnostic Tools. |
| `/diagnostic/tools` | `GET` | Diagnostic | JSON-Liste der 15 Diagnostic-Tools. |
| `/full/sse` | `GET` | Full | SSE Stream für den Full MCP Server. |
| `/full/mcp` | `POST` | Full | JSON-RPC 2.0 Request-Handler für alle 22 Management Tools. |
| `/full/tools` | `GET` | Full | JSON-Liste aller 22 Management-Tools. |

---

## 🛠️ Tool-Differenzierung (Diagnostic vs. Full)

### Diagnostic Tools (`openwisp-mcp-diagnostic`)
* `openwisp_list_users` (GET)
* `openwisp_get_user` (GET)
* `openwisp_list_organizations` (GET)
* `openwisp_list_devices` (GET)
* `openwisp_get_device` (GET)
* `openwisp_get_device_config` (GET)
* `openwisp_list_device_groups` (GET)
* `openwisp_list_templates` (GET)
* `openwisp_get_template` (GET)
* `openwisp_list_topologies` (GET)
* `openwisp_get_topology` (GET)
* `openwisp_list_nodes` (GET)
* `openwisp_list_links` (GET)
* `openwisp_list_radius_sessions` (GET)
* `openwisp_get_radius_usage` (GET)

### Zusaetzliche Full Tools (`openwisp-mcp-full`)
* `openwisp_obtain_token` (POST)
* `openwisp_create_user` (POST)
* `openwisp_delete_user` (DELETE)
* `openwisp_create_device` (POST)
* `openwisp_update_device` (PATCH)
* `openwisp_delete_device` (DELETE)
* `openwisp_create_template` (POST)

---

## 📜 Lizenz

Apache-2.0 License.
