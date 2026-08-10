# OpenWISP Model Context Protocol (MCP) Server

Eine standalone, performante **Model Context Protocol (MCP)** Server-Implementierung für die [OpenWISP REST API](https://openwisp.io/docs/dev/users/user/rest-api.html).

Dieser MCP-Server ermöglicht KI-Assistenten (z.B. in **McpHub**, **Claude Desktop**, **Cursor**, **VS Code**) die direkte Steuerung, Überwachung und Konfiguration von OpenWISP-Netzwerk-Controllern, Geräten, Templates, Topologien und RADIUS-Sitzungen.

Entwickelt für die einfache Bereitstellung in [McpHub (samanhappy/mcphub)](https://github.com/samanhappy/mcphub).

---

## 🚀 Highlights

* **Kein UI-Overhead**: Reiner, leichtgewichtiger Backend-Server ohne Frontend.
* **Dual Transport Support**:
  * **STDIO Transport**: Für die lokale Integration z.B. via `npx` oder CLI in McpHub / Claude Desktop.
  * **Streamable SSE (Server-Sent Events) & HTTP JSON-RPC 2.0**: Für Docker-, Remote- und Cloud-Run-Deployments.
* **Vollständige OpenWISP REST API Abdeckung**:
  * **Benutzer & Authentifizierung**: Bearer-Token abrufen, Benutzer verwalten & auflisten.
  * **Controller & Geräte**: Router, Access Points und Switches registrieren, aktualisieren, löschen und NetJSON-Konfigurationen abrufen.
  * **Templates**: Reusable Konfigurations-Templates für WLAN (SAE/WPA3), VPN (WireGuard/OpenVPN) & System.
  * **Netzwerk-Topologie**: Mesh-Topologien (OLSR, Batman-adv), Nodes und Links abfragen.
  * **RADIUS & Hotspot**: Aktive WLAN-Accounting-Sitzungen und Bandbreitennutzung überwachen.
* **Integrierter Mock Sandbox-Modus**: Sofort einsatzbereit zum Testen ohne laufende OpenWISP-Instanz.

---

## 🛠️ Installation & Build

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
Der Build-Prozess bündelt den TypeScript-Server in ein optimiertes CommonJS-Bundle (`dist/server.cjs`):
```bash
npm run build
```

### 3. Server starten

#### Produktionsmodus (HTTP & SSE Server)
```bash
npm run start
```
Der HTTP-Server läuft auf Port `3000` (über `PORT` Umgebungsvariable anpassbar).

#### Entwicklungsmodus
```bash
npm run dev
```

#### STDIO CLI Modus (für direkte MCP-Client Einbindung)
```bash
npm run mcp
```

---

## ⚙️ Umgebungsvariablen (Environment Variables)

Die Verbindung zur OpenWISP-Instanz wird über Umgebungsvariablen oder HTTP-Header gesteuert:

| Variable | Beschreibung | Standardwert |
| :--- | :--- | :--- |
| `OPENWISP_BASE_URL` (oder `OPENWISP_URL`) | Die Basis-URL der OpenWISP Controller Instanz (z.B. `https://openwisp.example.com`) | `""` (schaltet Sandbox ein) |
| `OPENWISP_API_TOKEN` (oder `OPENWISP_TOKEN`) | OpenWISP API Bearer Token | `""` |
| `OPENWISP_MOCK_SANDBOX` | Wenn `true`, werden Antworten aus dem Sandbox-Modus zurückgegeben | `true` (wenn URL leer) |
| `PORT` | Der Server-Port | `3000` |

---

## 📦 Deployment in McpHub (`samanhappy/mcphub`)

McpHub unterstützt sowohl lokale **STDIO-Kommandos** als auch **Remote SSE-Endpunkte**.

### Option A: McpHub mit STDIO Transport

Füge den folgenden Server-Eintrag in deine McpHub-Konfiguration (`mcp_settings.json` oder `.vscode/mcp.json`) ein:

```json
{
  "mcpServers": {
    "openwisp-mcp-server": {
      "command": "npx",
      "args": ["-y", "@openwisp/mcp-server"],
      "env": {
        "OPENWISP_BASE_URL": "https://deine-openwisp-instanz.com",
        "OPENWISP_API_TOKEN": "DEIN_OPENWISP_BEARER_TOKEN",
        "OPENWISP_MOCK_SANDBOX": "false"
      }
    }
  }
}
```

### Option B: McpHub mit Remote SSE Transport

Wenn dieser Server z.B. in Docker, Cloud Run oder auf einem VPS gehostet wird:

```json
{
  "mcpServers": {
    "openwisp-mcp-remote": {
      "url": "https://dein-mcp-server.example.com/sse",
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
  openwisp-mcp-server:
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

## 📡 HTTP API & MCP Transport Endpunkte

| Methode | Endpunkt | Beschreibung |
| :--- | :--- | :--- |
| `GET` | `/` | Reines JSON-Metadaten-Dokument mit Serverstatus, MCP-Protokollversion & Tool-Übersicht. |
| `GET` | `/health` | Healthcheck Endpoint für Container & Load Balancer. |
| `POST` | `/mcp` | MCP JSON-RPC 2.0 Request-Handler (`tools/list`, `tools/call`, `initialize`, etc.). |
| `GET` | `/sse` | Streamable Server-Sent Events (SSE) Transport für McpHub Remote Proxying. |
| `GET` | `/tools` | Liste aller definierten OpenWISP-Tools inklusive Schemas. |
| `POST` | `/execute` | Direkte HTTP-Ausführung eines Tools zum schnellen manuellen Testen. |

---

## 📑 Verfügbare OpenWISP MCP Tools

| Tool-Name | Kategorie | HTTP Method & OpenWISP API Endpunkt | Beschreibung |
| :--- | :--- | :--- | :--- |
| `openwisp_obtain_token` | Users & Auth | `POST /api/v1/users/token/` | API-Bearer-Token über Benutzernamen & Passwort abrufen. |
| `openwisp_list_users` | Users & Auth | `GET /api/v1/users/user/` | Benutzerkonten in OpenWISP auflisten & suchen. |
| `openwisp_get_user` | Users & Auth | `GET /api/v1/users/user/{id}/` | Details zu einem bestimmten Benutzer abrufen. |
| `openwisp_create_user` | Users & Auth | `GET /api/v1/users/user/` | Neues Benutzerkonto anlegen. |
| `openwisp_delete_user` | Users & Auth | `DELETE /api/v1/users/user/{id}/` | Benutzerkonto löschen. |
| `openwisp_list_organizations` | Organizations | `GET /api/v1/users/organization/` | Mandantenfähige Organisationen auflisten. |
| `openwisp_list_devices` | Devices & Controller | `GET /api/v1/controller/device/` | Network Devices (OpenWrt Router, APs) auflisten/filtern. |
| `openwisp_get_device` | Devices & Controller | `GET /api/v1/controller/device/{id}/` | Gerätetechnische Details, MAC, IP & Status abrufen. |
| `openwisp_create_device` | Devices & Controller | `POST /api/v1/controller/device/` | Neues Gerät im OpenWISP Controller registrieren. |
| `openwisp_update_device` | Devices & Controller | `PATCH /api/v1/controller/device/{id}/` | Geräteeigenschaften oder zugewiesene Templates aktualisieren. |
| `openwisp_delete_device` | Devices & Controller | `DELETE /api/v1/controller/device/{id}/` | Geräteregistrierung entfernen. |
| `openwisp_get_device_config`| Devices & Controller | `GET /api/v1/controller/device/{id}/configuration/` | Generierte NetJSON-Konfigurationsdateien herunterladen. |
| `openwisp_list_device_groups`| Devices & Controller | `GET /api/v1/controller/device-group/` | Gerätegruppen auflisten. |
| `openwisp_list_templates` | Templates | `GET /api/v1/controller/template/` | Konfigurations-Templates (WLAN, VPN, Firewall) auflisten. |
| `openwisp_get_template` | Templates | `GET /api/v1/controller/template/{id}/` | Details & NetJSON Config eines Templates abrufen. |
| `openwisp_create_template` | Templates | `POST /api/v1/controller/template/` | Neues wiederverwendbares NetJSON-Template erstellen. |
| `openwisp_list_topologies` | Network Topology | `GET /api/v1/network-topology/topology/` | Erfasste Mesh-Topologien auflisten. |
| `openwisp_get_topology` | Network Topology | `GET /api/v1/network-topology/topology/{id}/` | Topologie-Graph mit Nodes & Links abrufen. |
| `openwisp_list_nodes` | Network Topology | `GET /api/v1/network-topology/node/` | Knotenpunkte in einer Topologie auflisten. |
| `openwisp_list_links` | Network Topology | `GET /api/v1/network-topology/link/` | Verbindungen (Links) & Metriken in einer Topologie auflisten. |
| `openwisp_list_radius_sessions`| RADIUS & WiFi | `GET /api/v1/radius/accounting/` | RADIUS Accounting-Sitzungen von WLAN-Gästen auflisten. |
| `openwisp_get_radius_usage` | RADIUS & WiFi | `GET /api/v1/radius/usage/` | Aggregierte Bandbreitennutzung abrufen. |

---

## 📜 Lizenz

Apache-2.0 License.
