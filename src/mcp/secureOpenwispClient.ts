import {
  McpConnectionConfig,
  OpenWispDevice,
  OpenWispTemplate,
  OpenWispTopology,
  OpenWispUser,
  OpenWispOrganization,
  OpenWispRadiusSession,
} from '../types';
import {
  MOCK_DEVICES,
  MOCK_TEMPLATES,
  MOCK_TOPOLOGIES,
  MOCK_USERS,
  MOCK_ORGANIZATIONS,
  MOCK_RADIUS_SESSIONS,
} from '../data/mockOpenwisp';
import {
  fetchAndPreviewDeviceConfig,
} from './uciParser';

type ToolResult = { data: any; isMock: boolean; rawStatus: number; endpoint: string; method: string };

const toolEndpoints: Record<string, { endpoint: string; method: string }> = {
  openwisp_obtain_token: { endpoint: '/api/v1/users/token/', method: 'POST' },
  openwisp_list_users: { endpoint: '/api/v1/users/user/', method: 'GET' },
  openwisp_get_user: { endpoint: '/api/v1/users/user/{id}/', method: 'GET' },
  openwisp_create_user: { endpoint: '/api/v1/users/user/', method: 'POST' },
  openwisp_delete_user: { endpoint: '/api/v1/users/user/{id}/', method: 'DELETE' },
  openwisp_list_organizations: { endpoint: '/api/v1/users/organization/', method: 'GET' },

  openwisp_list_devices: { endpoint: '/api/v1/controller/device/', method: 'GET' },
  openwisp_get_device: { endpoint: '/api/v1/controller/device/{id}/', method: 'GET' },
  openwisp_create_device: { endpoint: '/api/v1/controller/device/', method: 'POST' },
  openwisp_update_device: { endpoint: '/api/v1/controller/device/{id}/', method: 'PATCH' },
  openwisp_delete_device: { endpoint: '/api/v1/controller/device/{id}/', method: 'DELETE' },
  openwisp_activate_device: { endpoint: '/api/v1/controller/device/{id}/activate/', method: 'POST' },
  openwisp_deactivate_device: { endpoint: '/api/v1/controller/device/{id}/deactivate/', method: 'POST' },
  openwisp_get_device_config: { endpoint: '/api/v1/controller/device/{id}/configuration/', method: 'GET' },
  openwisp_get_device_templates: { endpoint: '/api/v1/controller/device/{id}/', method: 'GET' },
  openwisp_assign_template: { endpoint: '/api/v1/controller/device/{id}/', method: 'PATCH' },
  openwisp_unassign_template: { endpoint: '/api/v1/controller/device/{id}/', method: 'PATCH' },
  openwisp_preview_device_config: { endpoint: '/api/v1/controller/device/{id}/configuration/', method: 'GET' },
  openwisp_list_device_connections: { endpoint: '/api/v1/controller/device/{id}/connection/', method: 'GET' },
  openwisp_create_device_connection: { endpoint: '/api/v1/controller/device/{id}/connection/', method: 'POST' },
  openwisp_get_device_connection: { endpoint: '/api/v1/controller/device/{device_id}/connection/{connection_id}/', method: 'GET' },
  openwisp_update_device_connection: { endpoint: '/api/v1/controller/device/{device_id}/connection/{connection_id}/', method: 'PUT' },
  openwisp_patch_device_connection: { endpoint: '/api/v1/controller/device/{device_id}/connection/{connection_id}/', method: 'PATCH' },
  openwisp_delete_device_connection: { endpoint: '/api/v1/controller/device/{device_id}/connection/{connection_id}/', method: 'DELETE' },
  openwisp_list_credentials: { endpoint: '/api/v1/connection/credential/', method: 'GET' },
  openwisp_create_credential: { endpoint: '/api/v1/connection/credential/', method: 'POST' },
  openwisp_get_credential: { endpoint: '/api/v1/connection/credential/{id}/', method: 'GET' },
  openwisp_update_credential: { endpoint: '/api/v1/connection/credential/{id}/', method: 'PUT' },
  openwisp_patch_credential: { endpoint: '/api/v1/connection/credential/{id}/', method: 'PATCH' },
  openwisp_delete_credential: { endpoint: '/api/v1/connection/credential/{id}/', method: 'DELETE' },
  openwisp_list_device_groups: { endpoint: '/api/v1/controller/group/', method: 'GET' },
  openwisp_create_device_group: { endpoint: '/api/v1/controller/group/', method: 'POST' },
  openwisp_get_device_group: { endpoint: '/api/v1/controller/group/{id}/', method: 'GET' },
  openwisp_update_device_group: { endpoint: '/api/v1/controller/group/{id}/', method: 'PUT' },
  openwisp_get_device_group_from_cert: { endpoint: '/api/v1/controller/cert/{common_name}/group/', method: 'GET' },
  openwisp_get_device_location: { endpoint: '/api/v1/controller/device/{id}/location/', method: 'GET' },
  openwisp_create_device_location: { endpoint: '/api/v1/controller/device/{id}/location/', method: 'PUT' },
  openwisp_update_device_location: { endpoint: '/api/v1/controller/device/{id}/location/', method: 'PUT' },
  openwisp_delete_device_location: { endpoint: '/api/v1/controller/device/{id}/location/', method: 'DELETE' },
  openwisp_get_device_coordinates: { endpoint: '/api/v1/controller/device/{id}/coordinates/', method: 'GET' },
  openwisp_update_device_coordinates: { endpoint: '/api/v1/controller/device/{id}/coordinates/', method: 'PUT' },
  openwisp_get_organization_geo_settings: { endpoint: '/api/v1/controller/organization/{organization_pk}/geo-settings/', method: 'GET' },
  openwisp_update_organization_geo_settings: { endpoint: '/api/v1/controller/organization/{organization_pk}/geo-settings/', method: 'PUT' },
  openwisp_patch_organization_geo_settings: { endpoint: '/api/v1/controller/organization/{organization_pk}/geo-settings/', method: 'PATCH' },
  openwisp_list_locations: { endpoint: '/api/v1/controller/location/', method: 'GET' },
  openwisp_create_location: { endpoint: '/api/v1/controller/location/', method: 'POST' },
  openwisp_get_location: { endpoint: '/api/v1/controller/location/{pk}/', method: 'GET' },
  openwisp_update_location: { endpoint: '/api/v1/controller/location/{pk}/', method: 'PUT' },
  openwisp_delete_location: { endpoint: '/api/v1/controller/location/{pk}/', method: 'DELETE' },
  openwisp_list_location_devices: { endpoint: '/api/v1/controller/location/{id}/device/', method: 'GET' },
  openwisp_list_location_geojson: { endpoint: '/api/v1/controller/location/geojson/', method: 'GET' },
  openwisp_list_location_indoor_coordinates: { endpoint: '/api/v1/controller/location/{id}/indoor-coordinates/', method: 'GET' },
  openwisp_list_floorplans: { endpoint: '/api/v1/controller/floorplan/', method: 'GET' },
  openwisp_create_floorplan: { endpoint: '/api/v1/controller/floorplan/', method: 'POST' },
  openwisp_get_floorplan: { endpoint: '/api/v1/controller/floorplan/{pk}/', method: 'GET' },
  openwisp_update_floorplan: { endpoint: '/api/v1/controller/floorplan/{pk}/', method: 'PUT' },
  openwisp_delete_floorplan: { endpoint: '/api/v1/controller/floorplan/{pk}/', method: 'DELETE' },
  openwisp_list_templates: { endpoint: '/api/v1/controller/template/', method: 'GET' },
  openwisp_get_template: { endpoint: '/api/v1/controller/template/{id}/', method: 'GET' },
  openwisp_get_template_configuration: { endpoint: '/api/v1/controller/template/{id}/configuration/', method: 'GET' },
  openwisp_create_template: { endpoint: '/api/v1/controller/template/', method: 'POST' },
  openwisp_update_template: { endpoint: '/api/v1/controller/template/{id}/', method: 'PUT' },
  openwisp_patch_template: { endpoint: '/api/v1/controller/template/{id}/', method: 'PATCH' },
  openwisp_delete_template: { endpoint: '/api/v1/controller/template/{id}/', method: 'DELETE' },
  openwisp_list_vpns: { endpoint: '/api/v1/controller/vpn/', method: 'GET' },
  openwisp_create_vpn: { endpoint: '/api/v1/controller/vpn/', method: 'POST' },
  openwisp_get_vpn: { endpoint: '/api/v1/controller/vpn/{id}/', method: 'GET' },
  openwisp_get_vpn_configuration: { endpoint: '/api/v1/controller/vpn/{id}/configuration/', method: 'GET' },
  openwisp_update_vpn: { endpoint: '/api/v1/controller/vpn/{id}/', method: 'PUT' },
  openwisp_patch_vpn: { endpoint: '/api/v1/controller/vpn/{id}/', method: 'PATCH' },
  openwisp_delete_vpn: { endpoint: '/api/v1/controller/vpn/{id}/', method: 'DELETE' },
  openwisp_list_cas: { endpoint: '/api/v1/controller/ca/', method: 'GET' },
  openwisp_create_ca: { endpoint: '/api/v1/controller/ca/', method: 'POST' },
  openwisp_get_ca: { endpoint: '/api/v1/controller/ca/{id}/', method: 'GET' },
  openwisp_update_ca: { endpoint: '/api/v1/controller/ca/{id}/', method: 'PUT' },
  openwisp_patch_ca: { endpoint: '/api/v1/controller/ca/{id}/', method: 'PATCH' },
  openwisp_download_ca_crl: { endpoint: '/api/v1/controller/ca/{id}/crl/', method: 'GET' },
  openwisp_delete_ca: { endpoint: '/api/v1/controller/ca/{id}/', method: 'DELETE' },
  openwisp_renew_ca: { endpoint: '/api/v1/controller/ca/{id}/renew/', method: 'POST' },
  openwisp_list_certs: { endpoint: '/api/v1/controller/cert/', method: 'GET' },
  openwisp_create_cert: { endpoint: '/api/v1/controller/cert/', method: 'POST' },
  openwisp_get_cert: { endpoint: '/api/v1/controller/cert/{id}/', method: 'GET' },
  openwisp_update_cert: { endpoint: '/api/v1/controller/cert/{id}/', method: 'PUT' },
  openwisp_patch_cert: { endpoint: '/api/v1/controller/cert/{id}/', method: 'PATCH' },
  openwisp_delete_cert: { endpoint: '/api/v1/controller/cert/{id}/', method: 'DELETE' },
  openwisp_renew_cert: { endpoint: '/api/v1/controller/cert/{id}/renew/', method: 'POST' },
  openwisp_revoke_cert: { endpoint: '/api/v1/controller/cert/{id}/revoke/', method: 'POST' },

  openwisp_list_topologies: { endpoint: '/api/v1/network-topology/topology/', method: 'GET' },
  openwisp_get_topology: { endpoint: '/api/v1/network-topology/topology/{id}/', method: 'GET' },
  openwisp_list_nodes: { endpoint: '/api/v1/network-topology/node/', method: 'GET' },
  openwisp_list_links: { endpoint: '/api/v1/network-topology/link/', method: 'GET' },

  openwisp_list_radius_sessions: { endpoint: '/api/v1/radius/accounting/', method: 'GET' },
  openwisp_get_radius_usage: { endpoint: '/api/v1/radius/usage/', method: 'GET' },
};

function replaceParams(template: string, args: Record<string, any>): string {
  return template.replace(/\{([^}]+)\}/g, (_, key) => encodeURIComponent(String(args[key] ?? '')));
}

function getPathParamNames(template: string): string[] {
  return Array.from(template.matchAll(/\{([^}]+)\}/g), (match) => match[1]);
}

function withoutPathParams(template: string, args: Record<string, any>): Record<string, any> {
  const pathParams = new Set(getPathParamNames(template));
  return Object.fromEntries(Object.entries(args).filter(([key, value]) => !pathParams.has(key) && value !== undefined));
}

function cleanBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '');
}

function headersFor(token: string, includeAuth: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (includeAuth && token) {
    headers.Authorization = token.startsWith('Bearer ') || token.startsWith('Token ') ? token : `Bearer ${token}`;
  }
  return headers;
}

function pickQuery(args: Record<string, any>, map: Record<string, string>): URLSearchParams {
  const query = new URLSearchParams();
  for (const [argName, queryName] of Object.entries(map)) {
    const value = args[argName];
    if (value !== undefined && value !== null && value !== '') {
      query.set(queryName, String(value));
    }
  }
  return query;
}

/**
 * Merge new template ids into the device's existing ordered list.
 * - `position` (0-based): insert the new ids at that index; `undefined` appends.
 * - Without a position, existing order is preserved and new IDs are appended.
 * - With a position, requested IDs are moved/inserted there in the given order.
 */
function normalizeTemplateIds(ids: unknown, argumentName: string): string[] {
  if (!Array.isArray(ids) || ids.some((id) => typeof id !== 'string' || id.length === 0)) {
    throw new Error(`${argumentName} must be an array of non-empty template IDs`);
  }
  return [...new Set(ids)];
}

function mergeTemplates(current: string[], newIds: string[], position?: number): string[] {
  const existing = [...new Set(current)];
  const requested = [...new Set(newIds)];
  if (position === undefined) {
    return [...existing, ...requested.filter((id) => !existing.includes(id))];
  }
  if (!Number.isFinite(position)) {
    throw new Error('position must be a finite number');
  }

  const remaining = existing.filter((id) => !requested.includes(id));
  const index = Math.min(Math.max(0, Math.trunc(position)), remaining.length);
  return [...remaining.slice(0, index), ...requested, ...remaining.slice(index)];
}

function pickDeviceFilters(args: Record<string, any>): URLSearchParams {
  return pickQuery(args, {
    organization: 'organization',
    organization_slug: 'organization_slug',
    backend: 'config__backend',
    status: 'config__status',
    template: 'config__templates',
    group: 'group',
    with_geo: 'with_geo',
    geo_is_estimated: 'geo_is_estimated',
    created: 'created',
    created_gte: 'created__gte',
    created_lt: 'created__lt',
    search: 'search',
    page: 'page',
    page_size: 'page_size',
  });
}

function pickTemplateFilters(args: Record<string, any>): URLSearchParams {
  return pickQuery(args, {
    organization: 'organization',
    organization_slug: 'organization_slug',
    backend: 'backend',
    type: 'type',
    default: 'default',
    required: 'required',
    created: 'created',
    created_gte: 'created__gte',
    created_lt: 'created__lt',
    search: 'search',
    page: 'page',
    page_size: 'page_size',
  });
}

function requestFromTool(toolName: string, args: Record<string, any>): { urlPath: string; method: string; body?: unknown; query?: URLSearchParams } {
  const tool = toolEndpoints[toolName];
  if (!tool) throw new Error(`Unknown OpenWISP MCP tool: ${toolName}`);

  const urlPath = replaceParams(tool.endpoint, args);
  const payload = withoutPathParams(tool.endpoint, args);

  if (tool.method === 'GET') {
    return {
      urlPath,
      method: tool.method,
      query: new URLSearchParams(Object.entries(payload).map(([key, value]) => [key, String(value)])),
    };
  }

  if (tool.method === 'DELETE') {
    return { urlPath, method: tool.method };
  }

  return { urlPath, method: tool.method, body: payload };
}

async function requestJson(
  url: string,
  method: string,
  token: string,
  body?: unknown
): Promise<{ json: any; status: number }> {
  const res = await fetch(url, {
    method,
    headers: headersFor(token, true),
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let parsed: any = text;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = { rawText: text };
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${parsed.detail || parsed.message || text}`);
  }
  return { json: parsed, status: res.status };
}

async function patchDeviceTemplates(
  deviceId: string,
  token: string,
  baseUrl: string,
  operation: 'assign' | 'unassign',
  templateIds: string[],
  position?: number
): Promise<{ json: any; status: number }> {
  const deviceUrl = `${cleanBaseUrl(baseUrl)}/api/v1/controller/device/${encodeURIComponent(deviceId)}/`;
  const { json: device } = await requestJson(deviceUrl, 'GET', token);
  if (!device || typeof device !== 'object' || !('config' in device)) {
    throw new Error('OpenWISP device response did not include config; refusing to overwrite template assignments');
  }

  const config = device.config && typeof device.config === 'object' ? device.config : {};
  const current = config.templates ?? [];
  if (!Array.isArray(current) || current.some((id: unknown) => typeof id !== 'string')) {
    throw new Error('OpenWISP device config.templates was not a string array; refusing to overwrite template assignments');
  }

  const uniqueCurrent = [...new Set(current)];
  const updated = operation === 'assign'
    ? mergeTemplates(uniqueCurrent, templateIds, position)
    : uniqueCurrent.filter((id: string) => !templateIds.includes(id));

  return requestJson(deviceUrl, 'PATCH', token, {
    config: { templates: updated },
  });
}

function livePayload(toolName: string, args: Record<string, any>): { urlPath: string; method: string; body?: unknown; query?: URLSearchParams } {
  switch (toolName) {
    case 'openwisp_list_devices':
      return { urlPath: '/api/v1/controller/device/', method: 'GET', query: pickDeviceFilters(args) };
    case 'openwisp_update_device': {
      const body: Record<string, any> = { ...args };
      delete body.id;
      if (body.templates !== undefined) {
        body.config = { ...(body.config || {}), templates: body.templates };
        delete body.templates;
      }
      return { urlPath: `/api/v1/controller/device/${encodeURIComponent(String(args.id))}/`, method: 'PATCH', body };
    }
    case 'openwisp_execute_device_command':
      return {
        urlPath: `/api/v1/controller/device/${encodeURIComponent(String(args.device_id))}/command/`,
        method: 'POST',
        body: { type: args.type, input: args.type === 'custom' ? { command: args.command } : args.input ?? {} },
      };
    case 'openwisp_list_templates':
      return { urlPath: '/api/v1/controller/template/', method: 'GET', query: pickTemplateFilters(args) };
    case 'openwisp_list_device_groups':
      return {
        urlPath: '/api/v1/controller/group/',
        method: 'GET',
        query: pickQuery(args, {
          organization: 'organization',
          organization_slug: 'organization_slug',
          empty: 'empty',
          search: 'search',
          page: 'page',
          page_size: 'page_size',
        }),
      };
    case 'openwisp_list_topologies':
      return {
        urlPath: '/api/v1/network-topology/topology/',
        method: 'GET',
        query: pickQuery(args, { organization: 'organization', search: 'search', page: 'page', page_size: 'page_size' }),
      };
    case 'openwisp_list_nodes':
      return {
        urlPath: '/api/v1/network-topology/node/',
        method: 'GET',
        query: pickQuery(args, { topology: 'topology', organization: 'organization', search: 'search', page: 'page', page_size: 'page_size' }),
      };
    case 'openwisp_list_links':
      return {
        urlPath: '/api/v1/network-topology/link/',
        method: 'GET',
        query: pickQuery(args, { topology: 'topology', status: 'status', organization: 'organization', search: 'search', page: 'page', page_size: 'page_size' }),
      };
    case 'openwisp_list_radius_sessions':
      return {
        urlPath: '/api/v1/radius/accounting/',
        method: 'GET',
        query: pickQuery(args, {
          username: 'username',
          calling_station_id: 'calling_station_id',
          organization: 'organization',
          page: 'page',
          page_size: 'page_size',
        }),
      };
    case 'openwisp_get_radius_usage':
      return {
        urlPath: '/api/v1/radius/usage/',
        method: 'GET',
        query: pickQuery(args, { organization: 'organization', username: 'username' }),
      };
    case 'openwisp_get_device_templates':
      return requestFromTool(toolName, args);
    case 'openwisp_preview_device_config':
      return {
        urlPath: `/api/v1/controller/device/${encodeURIComponent(String(args.id))}/configuration/`,
        method: 'GET',
      };
    default:
      return requestFromTool(toolName, args);
  }
}

function filterBySearch<T extends Record<string, any>>(items: T[], search: string | undefined, fields: Array<keyof T>): T[] {
  if (!search) return items;
  const term = search.toLowerCase();
  return items.filter((item) => fields.some((field) => String(item[field] ?? '').toLowerCase().includes(term)));
}

function mockGenericData(toolName: string, args: Record<string, any>): ToolResult {
  const tool = toolEndpoints[toolName];
  if (!tool) {
    throw new Error(`Unknown OpenWISP MCP tool: ${toolName}`);
  }

  const endpoint = replaceParams(tool.endpoint, args);
  const payload = withoutPathParams(tool.endpoint, args);
  const identifier = args.id ?? args.pk ?? args.device_id ?? args.command_id ?? args.connection_id ?? args.credential_id ?? args.common_name ?? 'mock';

  if (tool.method === 'GET') {
    return {
      data: tool.endpoint.includes('{') ? { id: identifier, ...payload } : { results: [] },
      isMock: true,
      rawStatus: 200,
      endpoint,
      method: tool.method,
    };
  }

  if (tool.method === 'POST') {
    return {
      data: { id: `mock-${toolName}`, ...payload },
      isMock: true,
      rawStatus: 201,
      endpoint,
      method: tool.method,
    };
  }

  if (tool.method === 'DELETE') {
    return {
      data: { deleted: true, id: identifier },
      isMock: true,
      rawStatus: 204,
      endpoint,
      method: tool.method,
    };
  }

  return {
    data: { id: identifier, ...payload },
    isMock: true,
    rawStatus: 200,
    endpoint,
    method: tool.method,
  };
}

function executeMockApiCall(toolName: string, args: Record<string, any>): ToolResult {
  switch (toolName) {
    case 'openwisp_obtain_token':
      return { data: { token: 'mock-token', username: args.username || 'admin', expires_in: 86400 }, isMock: true, rawStatus: 200, endpoint: '/api/v1/users/token/', method: 'POST' };
    case 'openwisp_list_users':
      return { data: { results: filterBySearch([...MOCK_USERS], args.search, ['username', 'email', 'first_name', 'last_name']) }, isMock: true, rawStatus: 200, endpoint: '/api/v1/users/user/', method: 'GET' };
    case 'openwisp_get_user':
      return { data: MOCK_USERS.find((u) => u.id === args.id) || null, isMock: true, rawStatus: 200, endpoint: '/api/v1/users/user/{id}/', method: 'GET' };
    case 'openwisp_create_user':
      return { data: { ...args, id: `usr-${MOCK_USERS.length + 1}`, date_joined: new Date().toISOString() }, isMock: true, rawStatus: 201, endpoint: '/api/v1/users/user/', method: 'POST' };
    case 'openwisp_delete_user':
      return { data: { deleted: args.id }, isMock: true, rawStatus: 204, endpoint: '/api/v1/users/user/{id}/', method: 'DELETE' };
    case 'openwisp_list_organizations':
      return { data: { results: filterBySearch([...MOCK_ORGANIZATIONS], args.search, ['name', 'slug']) }, isMock: true, rawStatus: 200, endpoint: '/api/v1/users/organization/', method: 'GET' };
    case 'openwisp_list_devices':
      return { data: { results: [...MOCK_DEVICES] }, isMock: true, rawStatus: 200, endpoint: '/api/v1/controller/device/', method: 'GET' };
    case 'openwisp_get_device':
      return { data: MOCK_DEVICES.find((d) => d.id === args.id) || null, isMock: true, rawStatus: 200, endpoint: '/api/v1/controller/device/{id}/', method: 'GET' };
    case 'openwisp_create_device':
      return { data: { ...args, id: `dev-${MOCK_DEVICES.length + 1}`, status: 'offline', created: new Date().toISOString(), modified: new Date().toISOString() }, isMock: true, rawStatus: 201, endpoint: '/api/v1/controller/device/', method: 'POST' };
    case 'openwisp_update_device':
      return { data: { ...MOCK_DEVICES.find((d) => d.id === args.id), ...args }, isMock: true, rawStatus: 200, endpoint: '/api/v1/controller/device/{id}/', method: 'PATCH' };
    case 'openwisp_delete_device':
      return { data: { deleted: args.id }, isMock: true, rawStatus: 204, endpoint: '/api/v1/controller/device/{id}/', method: 'DELETE' };
    case 'openwisp_activate_device':
      return { data: { id: args.id, status: 'online' }, isMock: true, rawStatus: 200, endpoint: '/api/v1/controller/device/{id}/activate/', method: 'POST' };
    case 'openwisp_deactivate_device':
      return { data: { id: args.id, status: 'offline' }, isMock: true, rawStatus: 200, endpoint: '/api/v1/controller/device/{id}/deactivate/', method: 'POST' };
    case 'openwisp_get_device_config':
      return { data: { device_id: args.id, config: { templates: [] }, tarball: 'mock' }, isMock: true, rawStatus: 200, endpoint: '/api/v1/controller/device/{id}/configuration/', method: 'GET' };
    case 'openwisp_get_device_templates': {
      const device = MOCK_DEVICES.find((d) => d.id === args.id);
      return {
        data: {
          id: device?.id ?? args.id,
          name: device?.name ?? 'Unknown',
          templates: device?.config?.templates ?? device?.templates ?? [],
        },
        isMock: true,
        rawStatus: 200,
        endpoint: '/api/v1/controller/device/{id}/',
        method: 'GET',
      };
    }
    case 'openwisp_assign_template': {
      const device = MOCK_DEVICES.find((d) => d.id === args.id);
      const current: string[] = device?.config?.templates ?? device?.templates ?? [];
      const templateIds = normalizeTemplateIds(args.templateIds, 'templateIds');
      const merged = mergeTemplates(current, templateIds, args.position);
      return {
        data: {
          id: device?.id ?? args.id,
          name: device?.name ?? 'Unknown',
          config: { templates: merged, status: 'modified', backend: 'netjsonconfig.OpenWrt' },
        },
        isMock: true,
        rawStatus: 200,
        endpoint: '/api/v1/controller/device/{id}/',
        method: 'PATCH',
      };
    }
    case 'openwisp_unassign_template': {
      const device = MOCK_DEVICES.find((d) => d.id === args.id);
      const current: string[] = device?.config?.templates ?? device?.templates ?? [];
      const remove = new Set(normalizeTemplateIds(args.unassign, 'unassign'));
      const merged = current.filter((t) => !remove.has(t));
      return {
        data: {
          id: device?.id ?? args.id,
          name: device?.name ?? 'Unknown',
          config: { templates: merged, status: 'modified', backend: 'netjsonconfig.OpenWrt' },
        },
        isMock: true,
        rawStatus: 200,
        endpoint: '/api/v1/controller/device/{id}/',
        method: 'PATCH',
      };
    }
    case 'openwisp_preview_device_config': {
      const device = MOCK_DEVICES.find((d) => d.id === args.id);
      const templates = device?.config?.templates ?? device?.templates ?? [];
      // Minimal representative UCI (etc/config/*) mirroring the real tarball layout,
      // keyed by package name so the agent sees the same shape as the live endpoint.
      const packages: Record<string, { raw: string; config: Record<string, any> }> = {
        firewall: {
          raw: "# netjsonconfig.OpenWrt rendered config\nconfig rule 'forward'\n  option target 'ACCEPT'\n",
          config: { rule: { forward: { target: 'ACCEPT' } } },
        },
        network: {
          raw: "# netjsonconfig.OpenWrt rendered config\nconfig interface 'lan'\n  option type 'bridge'\n  option ipaddr '192.168.1.1'\n  list dns '192.168.1.1'\n",
          config: { interface: { lan: { type: 'bridge', ipaddr: '192.168.1.1', dns: ['192.168.1.1'] } } },
        },
        system: {
          raw: "# netjsonconfig.OpenWrt rendered config\nconfig timeserver 'ntp'\n  option server 'pool.ntp.org'\n",
          config: { timeserver: { ntp: { server: 'pool.ntp.org' } } },
        },
      };
      if (args.package) {
        const filtered = packages[args.package];
        return {
          data: {
            deviceId: device?.id ?? args.id,
            status: filtered ? 'ok' : 'missing',
            backend: 'netjsonconfig.OpenWrt',
            config: filtered ?? { package: args.package, raw: '', config: {} },
          },
          isMock: true,
          rawStatus: 200,
          endpoint: '/api/v1/controller/device/{id}/configuration/',
          method: 'GET',
        };
      }
      return {
        data: {
          deviceId: device?.id ?? args.id,
          status: 'ok',
          backend: 'netjsonconfig.OpenWrt',
          templates,
          config: packages,
        },
        isMock: true,
        rawStatus: 200,
        endpoint: '/api/v1/controller/device/{id}/configuration/',
        method: 'GET',
      };
    }
    case 'openwisp_list_device_commands':
      return { data: { results: [] }, isMock: true, rawStatus: 200, endpoint: '/api/v1/controller/device/{device_id}/command/', method: 'GET' };
    case 'openwisp_execute_device_command':
      return { data: { id: 'cmd-001', device_id: args.device_id, type: args.type, input: args.type === 'custom' ? { command: args.command } : args.input ?? {} }, isMock: true, rawStatus: 201, endpoint: '/api/v1/controller/device/{device_id}/command/', method: 'POST' };
    case 'openwisp_get_device_command':
      return { data: { id: args.command_id, device_id: args.device_id, type: 'custom', status: 'queued' }, isMock: true, rawStatus: 200, endpoint: '/api/v1/controller/device/{device_id}/command/{command_id}/', method: 'GET' };
    case 'openwisp_list_templates':
      return { data: { results: [...MOCK_TEMPLATES] }, isMock: true, rawStatus: 200, endpoint: '/api/v1/controller/template/', method: 'GET' };
    case 'openwisp_get_template':
      return { data: MOCK_TEMPLATES.find((t) => t.id === args.id) || null, isMock: true, rawStatus: 200, endpoint: '/api/v1/controller/template/{id}/', method: 'GET' };
    case 'openwisp_create_template':
      return { data: { ...args, id: `tpl-${MOCK_TEMPLATES.length + 1}`, created: new Date().toISOString() }, isMock: true, rawStatus: 201, endpoint: '/api/v1/controller/template/', method: 'POST' };
    case 'openwisp_list_topologies':
      return { data: { results: [...MOCK_TOPOLOGIES] }, isMock: true, rawStatus: 200, endpoint: '/api/v1/network-topology/topology/', method: 'GET' };
    case 'openwisp_get_topology':
      return { data: MOCK_TOPOLOGIES.find((t) => t.id === args.id) || null, isMock: true, rawStatus: 200, endpoint: '/api/v1/network-topology/topology/{id}/', method: 'GET' };
    case 'openwisp_list_nodes':
      return { data: { results: MOCK_TOPOLOGIES.flatMap((t) => t.nodes || []) }, isMock: true, rawStatus: 200, endpoint: '/api/v1/network-topology/node/', method: 'GET' };
    case 'openwisp_list_links':
      return { data: { results: MOCK_TOPOLOGIES.flatMap((t) => t.links || []) }, isMock: true, rawStatus: 200, endpoint: '/api/v1/network-topology/link/', method: 'GET' };
    case 'openwisp_list_radius_sessions':
      return { data: { results: [...MOCK_RADIUS_SESSIONS] }, isMock: true, rawStatus: 200, endpoint: '/api/v1/radius/accounting/', method: 'GET' };
    case 'openwisp_get_radius_usage':
      return { data: { total_sessions: MOCK_RADIUS_SESSIONS.length, total_down: MOCK_RADIUS_SESSIONS.reduce((a, s) => a + s.acct_input_octets, 0) }, isMock: true, rawStatus: 200, endpoint: '/api/v1/radius/usage/', method: 'GET' };
    default:
      return mockGenericData(toolName, args);
  }
}

export async function executeOpenWispApiCall(toolName: string, args: Record<string, any>, config: McpConnectionConfig): Promise<ToolResult> {
  if (config.useMockSandbox) {
    return executeMockApiCall(toolName, args);
  }

  const tool = toolEndpoints[toolName];
  if (!tool) {
    throw new Error(`Unknown OpenWISP MCP tool: ${toolName}`);
  }

  if (toolName === 'openwisp_assign_template' || toolName === 'openwisp_unassign_template') {
    const deviceId = String(args.id ?? '');
    if (!deviceId) throw new Error('id is required');
    const operation = toolName === 'openwisp_assign_template' ? 'assign' : 'unassign';
    const templateIds = normalizeTemplateIds(
      operation === 'assign' ? args.templateIds : args.unassign,
      operation === 'assign' ? 'templateIds' : 'unassign'
    );
    const result = await patchDeviceTemplates(
      deviceId,
      config.apiToken,
      config.baseUrl,
      operation,
      templateIds,
      args.position
    );
    return {
      data: result.json,
      isMock: false,
      rawStatus: result.status,
      endpoint: `/api/v1/controller/device/${encodeURIComponent(deviceId)}/`,
      method: 'PATCH',
    };
  }

  const payload = livePayload(toolName, args);
  const baseUrl = cleanBaseUrl(config.baseUrl);
  const query = payload.query?.toString() ? `?${payload.query.toString()}` : '';
  const url = `${baseUrl}${payload.urlPath}${query}`;

  if (toolName === 'openwisp_preview_device_config') {
    const preview = await fetchAndPreviewDeviceConfig(String(args.id), url, config.apiToken, args.package);
    return { data: preview, isMock: false, rawStatus: 200, endpoint: payload.urlPath, method: payload.method };
  }

  const { json, status } = await requestJson(url, payload.method, config.apiToken, payload.body);
  return {
    data: json,
    isMock: false,
    rawStatus: status,
    endpoint: payload.urlPath,
    method: payload.method,
  };
}
