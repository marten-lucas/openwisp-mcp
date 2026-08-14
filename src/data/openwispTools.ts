import { McpToolDefinition } from '../types';

export const OPENWISP_MCP_TOOLS: McpToolDefinition[] = [
  // ---------------- AUTH & USERS ----------------
  {
    name: 'openwisp_obtain_token',
    category: 'Users & Auth',
    description: 'Obtain an API bearer token using OpenWISP username and password credentials.',
    endpoint: '/api/v1/users/token/',
    method: 'POST',
    parameters: [
      { name: 'username', type: 'string', description: 'OpenWISP admin or user username', required: true },
      { name: 'password', type: 'string', description: 'User password', required: true }
    ],
    sampleArguments: { username: 'admin', password: 'password123' }
  },
  {
    name: 'openwisp_list_users',
    category: 'Users & Auth',
    description: 'List user accounts in OpenWISP with support for pagination and search.',
    endpoint: '/api/v1/users/user/',
    method: 'GET',
    parameters: [
      { name: 'organization', type: 'string', description: 'Filter users by organization ID or slug', required: false },
      { name: 'search', type: 'string', description: 'Search term for username, email, or full name', required: false },
      { name: 'page', type: 'number', description: 'Page number for paginated results', required: false, default: 1 },
      { name: 'page_size', type: 'number', description: 'Number of records per page', required: false, default: 20 }
    ],
    sampleArguments: { page: 1, page_size: 10 }
  },
  {
    name: 'openwisp_get_user',
    category: 'Users & Auth',
    description: 'Retrieve detailed information for a specific OpenWISP user by ID.',
    endpoint: '/api/v1/users/user/{id}/',
    method: 'GET',
    parameters: [
      { name: 'id', type: 'string', description: 'UUID or ID of the user', required: true }
    ],
    sampleArguments: { id: 'usr-001' }
  },
  {
    name: 'openwisp_create_user',
    category: 'Users & Auth',
    description: 'Create a new user in OpenWISP with role and organization permissions.',
    endpoint: '/api/v1/users/user/',
    method: 'POST',
    parameters: [
      { name: 'username', type: 'string', description: 'Unique username for the account', required: true },
      { name: 'email', type: 'string', description: 'Email address', required: true },
      { name: 'first_name', type: 'string', description: 'First name', required: false },
      { name: 'last_name', type: 'string', description: 'Last name', required: false },
      { name: 'password', type: 'string', description: 'Account password', required: true },
      { name: 'is_active', type: 'boolean', description: 'Whether the account is active', required: false, default: true },
      { name: 'is_staff', type: 'boolean', description: 'Admin/staff privileges flag', required: false, default: false }
    ],
    sampleArguments: {
      username: 'johndoe',
      email: 'john.doe@example.com',
      first_name: 'John',
      last_name: 'Doe',
      password: 'SecurePass123!',
      is_active: true
    }
  },
  {
    name: 'openwisp_delete_user',
    category: 'Users & Auth',
    description: 'Delete a user account from OpenWISP.',
    endpoint: '/api/v1/users/user/{id}/',
    method: 'DELETE',
    parameters: [
      { name: 'id', type: 'string', description: 'UUID or ID of the user to remove', required: true }
    ],
    sampleArguments: { id: 'usr-003' }
  },

  // ---------------- ORGANIZATIONS ----------------
  {
    name: 'openwisp_list_organizations',
    category: 'Organizations',
    description: 'List multi-tenant organizations managed within OpenWISP.',
    endpoint: '/api/v1/users/organization/',
    method: 'GET',
    parameters: [
      { name: 'search', type: 'string', description: 'Filter by organization name or slug', required: false }
    ],
    sampleArguments: {}
  },

  // ---------------- DEVICES & CONTROLLER ----------------
  {
    name: 'openwisp_list_devices',
    category: 'Devices & Controller',
    description: 'List registered network devices (OpenWrt routers, access points, switches) in OpenWISP Controller.',
    endpoint: '/api/v1/controller/device/',
    method: 'GET',
    parameters: [
      { name: 'organization', type: 'string', description: 'Organization ID filter', required: false },
      { name: 'organization_slug', type: 'string', description: 'Organization slug filter', required: false },
      { name: 'backend', type: 'string', description: 'Configuration backend filter (e.g. netjsonconfig.OpenWrt)', required: false },
      { name: 'status', type: 'string', description: 'Configuration status filter (e.g. modified, applied, error)', required: false },
      { name: 'template', type: 'string', description: 'Filter by configuration template ID', required: false },
      { name: 'group', type: 'string', description: 'Filter by device group ID', required: false },
      { name: 'with_geo', type: 'boolean', description: 'Filter devices that have a location object', required: false },
      { name: 'geo_is_estimated', type: 'boolean', description: 'Filter devices with estimated geo location', required: false },
      { name: 'search', type: 'string', description: 'Search by device name, MAC address, IP, or model', required: false },
      { name: 'page', type: 'number', description: 'Page number', required: false, default: 1 },
      { name: 'page_size', type: 'number', description: 'Page size', required: false, default: 20 },
    ],
    sampleArguments: { page: 1, page_size: 20 }
  },
  {
    name: 'openwisp_get_device',
    category: 'Devices & Controller',
    description: 'Get details, MAC address, model, status, and IP address for a specific device.',
    endpoint: '/api/v1/controller/device/{id}/',
    method: 'GET',
    parameters: [
      { name: 'id', type: 'string', description: 'Device UUID or ID', required: true }
    ],
    sampleArguments: { id: 'dev-001' }
  },
  {
    name: 'openwisp_create_device',
    category: 'Devices & Controller',
    description: 'Register a new network device in OpenWISP Controller.',
    endpoint: '/api/v1/controller/device/',
    method: 'POST',
    parameters: [
      { name: 'name', type: 'string', description: 'Friendly device name (e.g. Gateway-Berlin-01)', required: true },
      { name: 'mac', type: 'string', description: 'Hardware MAC Address (e.g. 00:11:22:33:44:55)', required: true },
      { name: 'organization', type: 'string', description: 'Organization ID or slug', required: true },
      { name: 'model', type: 'string', description: 'Hardware model (e.g. GL.iNet GL-AR750S or TP-Link Archer C7)', required: false },
      { name: 'system', type: 'string', description: 'Operating system backend (e.g. OpenWrt)', required: false, default: 'OpenWrt' }
    ],
    sampleArguments: {
      name: 'AP-Office-North',
      mac: '00:1B:44:11:3A:B7',
      organization: 'default',
      model: 'GL.iNet GL-AXT1800'
    }
  },
  {
    name: 'openwisp_update_device',
    category: 'Devices & Controller',
    description: 'Update network device metadata, assigned organization, or templates.',
    endpoint: '/api/v1/controller/device/{id}/',
    method: 'PATCH',
    parameters: [
      { name: 'id', type: 'string', description: 'Device UUID or ID', required: true },
      { name: 'name', type: 'string', description: 'Updated device name', required: false },
      { name: 'templates', type: 'array', description: 'List of template UUIDs to assign to this device under config.templates', required: false }
    ],
    sampleArguments: { id: 'dev-001', name: 'AP-Office-Main-Updated' }
  },
  {
    name: 'openwisp_delete_device',
    category: 'Devices & Controller',
    description: 'Delete a network device registration from OpenWISP Controller.',
    endpoint: '/api/v1/controller/device/{id}/',
    method: 'DELETE',
    parameters: [
      { name: 'id', type: 'string', description: 'Device UUID or ID to delete', required: true }
    ],
    sampleArguments: { id: 'dev-003' }
  },
  {
    name: 'openwisp_activate_device',
    category: 'Devices & Controller',
    description: 'Activate a deactivated device so it can reconnect and receive configuration.',
    endpoint: '/api/v1/controller/device/{id}/activate/',
    method: 'POST',
    parameters: [
      { name: 'id', type: 'string', description: 'Device UUID or ID to activate', required: true }
    ],
    sampleArguments: { id: 'dev-003' }
  },
  {
    name: 'openwisp_deactivate_device',
    category: 'Devices & Controller',
    description: 'Deactivate a device before deletion or maintenance.',
    endpoint: '/api/v1/controller/device/{id}/deactivate/',
    method: 'POST',
    parameters: [
      { name: 'id', type: 'string', description: 'Device UUID or ID to deactivate', required: true }
    ],
    sampleArguments: { id: 'dev-003' }
  },
  {
    name: 'openwisp_get_device_config',
    category: 'Devices & Controller',
    description: 'Generate and download compiled NetJSON configuration for a device.',
    endpoint: '/api/v1/controller/device/{id}/configuration/',
    method: 'GET',
    parameters: [
      { name: 'id', type: 'string', description: 'Device UUID or ID', required: true }
    ],
    sampleArguments: { id: 'dev-001' }
  },
  {
    name: 'openwisp_list_device_commands',
    category: 'Devices & Controller',
    description: 'List commands previously issued to a device.',
    endpoint: '/api/v1/controller/device/{device_id}/command/',
    method: 'GET',
    parameters: [
      { name: 'device_id', type: 'string', description: 'Device UUID or ID', required: true }
    ],
    sampleArguments: { device_id: 'dev-001' }
  },
  {
    name: 'openwisp_execute_device_command',
    category: 'Devices & Controller',
    description: 'Execute a command on a device, such as reboot or a custom shell command.',
    endpoint: '/api/v1/controller/device/{device_id}/command/',
    method: 'POST',
    parameters: [
      { name: 'device_id', type: 'string', description: 'Device UUID or ID', required: true },
      { name: 'type', type: 'string', description: 'Command type', required: true, enum: ['reboot', 'custom'] },
      { name: 'command', type: 'string', description: 'Custom command when type is custom', required: false }
    ],
    sampleArguments: { device_id: 'dev-001', type: 'custom', command: 'uptime' }
  },
  {
    name: 'openwisp_get_device_command',
    category: 'Devices & Controller',
    description: 'Get details for a previously executed device command.',
    endpoint: '/api/v1/controller/device/{device_id}/command/{command_id}/',
    method: 'GET',
    parameters: [
      { name: 'device_id', type: 'string', description: 'Device UUID or ID', required: true },
      { name: 'command_id', type: 'string', description: 'Command UUID or ID', required: true }
    ],
    sampleArguments: { device_id: 'dev-001', command_id: 'cmd-001' }
  },
  {
    name: 'openwisp_list_device_groups',
    category: 'Devices & Controller',
    description: 'List device groups created for organizing network hardware.',
    endpoint: '/api/v1/controller/group/',
    method: 'GET',
    parameters: [
      { name: 'organization', type: 'string', description: 'Organization ID filter', required: false },
      { name: 'organization_slug', type: 'string', description: 'Organization slug filter', required: false },
      { name: 'empty', type: 'boolean', description: 'Filter empty groups', required: false },
      { name: 'search', type: 'string', description: 'Search by group name', required: false },
      { name: 'page', type: 'number', description: 'Page number', required: false, default: 1 },
      { name: 'page_size', type: 'number', description: 'Page size', required: false, default: 20 }
    ],
    sampleArguments: {}
  },
  {
    name: 'openwisp_create_device_group',
    category: 'Devices & Controller',
    description: 'Create a new device group.',
    endpoint: '/api/v1/controller/group/',
    method: 'POST',
    parameters: [
      { name: 'name', type: 'string', description: 'Group name', required: true },
      { name: 'organization', type: 'string', description: 'Organization ID or slug', required: false },
      { name: 'organization_slug', type: 'string', description: 'Organization slug', required: false }
    ],
    sampleArguments: { name: 'HQ Routers' }
  },
  {
    name: 'openwisp_get_device_group',
    category: 'Devices & Controller',
    description: 'Get details for a device group.',
    endpoint: '/api/v1/controller/group/{id}/',
    method: 'GET',
    parameters: [{ name: 'id', type: 'string', description: 'Group UUID or ID', required: true }],
    sampleArguments: { id: 'grp-001' }
  },
  {
    name: 'openwisp_update_device_group',
    category: 'Devices & Controller',
    description: 'Update a device group.',
    endpoint: '/api/v1/controller/group/{id}/',
    method: 'PUT',
    parameters: [
      { name: 'id', type: 'string', description: 'Group UUID or ID', required: true },
      { name: 'name', type: 'string', description: 'Updated group name', required: false },
      { name: 'organization', type: 'string', description: 'Organization ID or slug', required: false }
    ],
    sampleArguments: { id: 'grp-001', name: 'HQ Routers' }
  },
  {
    name: 'openwisp_get_device_group_from_cert',
    category: 'Devices & Controller',
    description: 'Resolve the device group linked to a certificate common name.',
    endpoint: '/api/v1/controller/cert/{common_name}/group/',
    method: 'GET',
    parameters: [
      { name: 'common_name', type: 'string', description: 'Certificate common name', required: true },
      { name: 'org', type: 'string', description: 'Optional comma-separated organization slugs', required: false }
    ],
    sampleArguments: { common_name: 'router-01.example.net' }
  },
  {
    name: 'openwisp_list_device_connections',
    category: 'Devices & Controller',
    description: 'List connections for a device.',
    endpoint: '/api/v1/controller/device/{id}/connection/',
    method: 'GET',
    parameters: [{ name: 'id', type: 'string', description: 'Device UUID or ID', required: true }],
    sampleArguments: { id: 'dev-001' }
  },
  {
    name: 'openwisp_create_device_connection',
    category: 'Devices & Controller',
    description: 'Create a connection for a device.',
    endpoint: '/api/v1/controller/device/{id}/connection/',
    method: 'POST',
    parameters: [
      { name: 'id', type: 'string', description: 'Device UUID or ID', required: true },
      { name: 'name', type: 'string', description: 'Connection name', required: true },
      { name: 'credential', type: 'string', description: 'Credential UUID', required: false }
    ],
    sampleArguments: { id: 'dev-001', name: 'lan0' }
  },
  {
    name: 'openwisp_get_device_connection',
    category: 'Devices & Controller',
    description: 'Get details for a specific device connection.',
    endpoint: '/api/v1/controller/device/{device_id}/connection/{connection_id}/',
    method: 'GET',
    parameters: [
      { name: 'device_id', type: 'string', description: 'Device UUID or ID', required: true },
      { name: 'connection_id', type: 'string', description: 'Connection UUID or ID', required: true }
    ],
    sampleArguments: { device_id: 'dev-001', connection_id: 'conn-001' }
  },
  {
    name: 'openwisp_update_device_connection',
    category: 'Devices & Controller',
    description: 'Replace a device connection definition.',
    endpoint: '/api/v1/controller/device/{device_id}/connection/{connection_id}/',
    method: 'PUT',
    parameters: [
      { name: 'device_id', type: 'string', description: 'Device UUID or ID', required: true },
      { name: 'connection_id', type: 'string', description: 'Connection UUID or ID', required: true }
    ],
    sampleArguments: { device_id: 'dev-001', connection_id: 'conn-001' }
  },
  {
    name: 'openwisp_patch_device_connection',
    category: 'Devices & Controller',
    description: 'Partially update a device connection.',
    endpoint: '/api/v1/controller/device/{device_id}/connection/{connection_id}/',
    method: 'PATCH',
    parameters: [
      { name: 'device_id', type: 'string', description: 'Device UUID or ID', required: true },
      { name: 'connection_id', type: 'string', description: 'Connection UUID or ID', required: true }
    ],
    sampleArguments: { device_id: 'dev-001', connection_id: 'conn-001' }
  },
  {
    name: 'openwisp_delete_device_connection',
    category: 'Devices & Controller',
    description: 'Delete a device connection.',
    endpoint: '/api/v1/controller/device/{device_id}/connection/{connection_id}/',
    method: 'DELETE',
    parameters: [
      { name: 'device_id', type: 'string', description: 'Device UUID or ID', required: true },
      { name: 'connection_id', type: 'string', description: 'Connection UUID or ID', required: true }
    ],
    sampleArguments: { device_id: 'dev-001', connection_id: 'conn-001' }
  },
  {
    name: 'openwisp_list_credentials',
    category: 'Devices & Controller',
    description: 'List connection credentials.',
    endpoint: '/api/v1/connection/credential/',
    method: 'GET',
    parameters: [
      { name: 'search', type: 'string', description: 'Search credentials by name', required: false }
    ],
    sampleArguments: {}
  },
  {
    name: 'openwisp_create_credential',
    category: 'Devices & Controller',
    description: 'Create a connection credential.',
    endpoint: '/api/v1/connection/credential/',
    method: 'POST',
    parameters: [
      { name: 'name', type: 'string', description: 'Credential name', required: true },
      { name: 'username', type: 'string', description: 'Username', required: false },
      { name: 'password', type: 'string', description: 'Password or secret', required: false }
    ],
    sampleArguments: { name: 'Default SSH' }
  },
  {
    name: 'openwisp_get_credential',
    category: 'Devices & Controller',
    description: 'Get a connection credential.',
    endpoint: '/api/v1/connection/credential/{id}/',
    method: 'GET',
    parameters: [{ name: 'id', type: 'string', description: 'Credential UUID or ID', required: true }],
    sampleArguments: { id: 'cred-001' }
  },
  {
    name: 'openwisp_update_credential',
    category: 'Devices & Controller',
    description: 'Replace a connection credential.',
    endpoint: '/api/v1/connection/credential/{id}/',
    method: 'PUT',
    parameters: [{ name: 'id', type: 'string', description: 'Credential UUID or ID', required: true }],
    sampleArguments: { id: 'cred-001' }
  },
  {
    name: 'openwisp_patch_credential',
    category: 'Devices & Controller',
    description: 'Partially update a connection credential.',
    endpoint: '/api/v1/connection/credential/{id}/',
    method: 'PATCH',
    parameters: [{ name: 'id', type: 'string', description: 'Credential UUID or ID', required: true }],
    sampleArguments: { id: 'cred-001' }
  },
  {
    name: 'openwisp_delete_credential',
    category: 'Devices & Controller',
    description: 'Delete a connection credential.',
    endpoint: '/api/v1/connection/credential/{id}/',
    method: 'DELETE',
    parameters: [{ name: 'id', type: 'string', description: 'Credential UUID or ID', required: true }],
    sampleArguments: { id: 'cred-001' }
  },
  {
    name: 'openwisp_get_device_location',
    category: 'Geo & Locations',
    description: 'Get a device location object.',
    endpoint: '/api/v1/controller/device/{id}/location/',
    method: 'GET',
    parameters: [{ name: 'id', type: 'string', description: 'Device UUID or ID', required: true }],
    sampleArguments: { id: 'dev-001' }
  },
  {
    name: 'openwisp_create_device_location',
    category: 'Geo & Locations',
    description: 'Assign a location object to a device.',
    endpoint: '/api/v1/controller/device/{id}/location/',
    method: 'PUT',
    parameters: [
      { name: 'id', type: 'string', description: 'Device UUID or ID', required: true },
      { name: 'location', type: 'string', description: 'Location UUID or ID', required: true }
    ],
    sampleArguments: { id: 'dev-001', location: 'loc-001' }
  },
  {
    name: 'openwisp_update_device_location',
    category: 'Geo & Locations',
    description: 'Update the location assigned to a device.',
    endpoint: '/api/v1/controller/device/{id}/location/',
    method: 'PUT',
    parameters: [
      { name: 'id', type: 'string', description: 'Device UUID or ID', required: true },
      { name: 'location', type: 'string', description: 'Location UUID or ID', required: true }
    ],
    sampleArguments: { id: 'dev-001', location: 'loc-001' }
  },
  {
    name: 'openwisp_delete_device_location',
    category: 'Geo & Locations',
    description: 'Remove the location from a device.',
    endpoint: '/api/v1/controller/device/{id}/location/',
    method: 'DELETE',
    parameters: [{ name: 'id', type: 'string', description: 'Device UUID or ID', required: true }],
    sampleArguments: { id: 'dev-001' }
  },
  {
    name: 'openwisp_get_device_coordinates',
    category: 'Geo & Locations',
    description: 'Get device coordinates for a geocoded device.',
    endpoint: '/api/v1/controller/device/{id}/coordinates/',
    method: 'GET',
    parameters: [
      { name: 'id', type: 'string', description: 'Device UUID or ID', required: true },
      { name: 'key', type: 'string', description: 'Coordinate access key', required: true }
    ],
    sampleArguments: { id: 'dev-001' }
  },
  {
    name: 'openwisp_update_device_coordinates',
    category: 'Geo & Locations',
    description: 'Update device coordinates.',
    endpoint: '/api/v1/controller/device/{id}/coordinates/',
    method: 'PUT',
    parameters: [
      { name: 'id', type: 'string', description: 'Device UUID or ID', required: true },
      { name: 'key', type: 'string', description: 'Coordinate access key', required: false }
    ],
    sampleArguments: { id: 'dev-001' }
  },
  {
    name: 'openwisp_get_organization_geo_settings',
    category: 'Geo & Locations',
    description: 'Get organization geo settings.',
    endpoint: '/api/v1/controller/organization/{organization_pk}/geo-settings/',
    method: 'GET',
    parameters: [{ name: 'organization_pk', type: 'string', description: 'Organization UUID or ID', required: true }],
    sampleArguments: { organization_pk: 'org-001' }
  },
  {
    name: 'openwisp_update_organization_geo_settings',
    category: 'Geo & Locations',
    description: 'Replace organization geo settings.',
    endpoint: '/api/v1/controller/organization/{organization_pk}/geo-settings/',
    method: 'PUT',
    parameters: [{ name: 'organization_pk', type: 'string', description: 'Organization UUID or ID', required: true }],
    sampleArguments: { organization_pk: 'org-001' }
  },
  {
    name: 'openwisp_patch_organization_geo_settings',
    category: 'Geo & Locations',
    description: 'Partially update organization geo settings.',
    endpoint: '/api/v1/controller/organization/{organization_pk}/geo-settings/',
    method: 'PATCH',
    parameters: [{ name: 'organization_pk', type: 'string', description: 'Organization UUID or ID', required: true }],
    sampleArguments: { organization_pk: 'org-001' }
  },
  {
    name: 'openwisp_list_locations',
    category: 'Geo & Locations',
    description: 'List controller locations.',
    endpoint: '/api/v1/controller/location/',
    method: 'GET',
    parameters: [
      { name: 'organization', type: 'string', description: 'Organization ID filter', required: false },
      { name: 'organization_slug', type: 'string', description: 'Organization slug filter', required: false },
      { name: 'search', type: 'string', description: 'Search by location name or address', required: false }
    ],
    sampleArguments: {}
  },
  {
    name: 'openwisp_create_location',
    category: 'Geo & Locations',
    description: 'Create a controller location.',
    endpoint: '/api/v1/controller/location/',
    method: 'POST',
    parameters: [
      { name: 'name', type: 'string', description: 'Location name', required: true },
      { name: 'organization', type: 'string', description: 'Organization ID or slug', required: false }
    ],
    sampleArguments: { name: 'Berlin Office' }
  },
  {
    name: 'openwisp_get_location',
    category: 'Geo & Locations',
    description: 'Get location details.',
    endpoint: '/api/v1/controller/location/{pk}/',
    method: 'GET',
    parameters: [{ name: 'pk', type: 'string', description: 'Location UUID or ID', required: true }],
    sampleArguments: { pk: 'loc-001' }
  },
  {
    name: 'openwisp_update_location',
    category: 'Geo & Locations',
    description: 'Replace location details.',
    endpoint: '/api/v1/controller/location/{pk}/',
    method: 'PUT',
    parameters: [{ name: 'pk', type: 'string', description: 'Location UUID or ID', required: true }],
    sampleArguments: { pk: 'loc-001' }
  },
  {
    name: 'openwisp_delete_location',
    category: 'Geo & Locations',
    description: 'Delete a controller location.',
    endpoint: '/api/v1/controller/location/{pk}/',
    method: 'DELETE',
    parameters: [{ name: 'pk', type: 'string', description: 'Location UUID or ID', required: true }],
    sampleArguments: { pk: 'loc-001' }
  },
  {
    name: 'openwisp_list_location_devices',
    category: 'Geo & Locations',
    description: 'List devices deployed at a location.',
    endpoint: '/api/v1/controller/location/{id}/device/',
    method: 'GET',
    parameters: [{ name: 'id', type: 'string', description: 'Location UUID or ID', required: true }],
    sampleArguments: { id: 'loc-001' }
  },
  {
    name: 'openwisp_list_location_geojson',
    category: 'Geo & Locations',
    description: 'List locations in GeoJSON format.',
    endpoint: '/api/v1/controller/location/geojson/',
    method: 'GET',
    parameters: [
      { name: 'organization_id', type: 'string', description: 'Organization ID filter', required: false },
      { name: 'organization_slug', type: 'string', description: 'Organization slug filter', required: false }
    ],
    sampleArguments: {}
  },
  {
    name: 'openwisp_list_location_indoor_coordinates',
    category: 'Geo & Locations',
    description: 'List indoor coordinates for a location.',
    endpoint: '/api/v1/controller/location/{id}/indoor-coordinates/',
    method: 'GET',
    parameters: [
      { name: 'id', type: 'string', description: 'Location UUID or ID', required: true },
      { name: 'floor', type: 'number', description: 'Floor number filter', required: false }
    ],
    sampleArguments: { id: 'loc-001' }
  },
  {
    name: 'openwisp_list_floorplans',
    category: 'Geo & Locations',
    description: 'List indoor floor plans.',
    endpoint: '/api/v1/controller/floorplan/',
    method: 'GET',
    parameters: [
      { name: 'organization', type: 'string', description: 'Organization ID filter', required: false },
      { name: 'organization_slug', type: 'string', description: 'Organization slug filter', required: false }
    ],
    sampleArguments: {}
  },
  {
    name: 'openwisp_create_floorplan',
    category: 'Geo & Locations',
    description: 'Create a floor plan.',
    endpoint: '/api/v1/controller/floorplan/',
    method: 'POST',
    parameters: [
      { name: 'name', type: 'string', description: 'Floor plan name', required: true },
      { name: 'organization', type: 'string', description: 'Organization ID or slug', required: false }
    ],
    sampleArguments: { name: 'Headquarters Floor 1' }
  },
  {
    name: 'openwisp_get_floorplan',
    category: 'Geo & Locations',
    description: 'Get floor plan details.',
    endpoint: '/api/v1/controller/floorplan/{pk}/',
    method: 'GET',
    parameters: [{ name: 'pk', type: 'string', description: 'Floor plan UUID or ID', required: true }],
    sampleArguments: { pk: 'fp-001' }
  },
  {
    name: 'openwisp_update_floorplan',
    category: 'Geo & Locations',
    description: 'Replace a floor plan.',
    endpoint: '/api/v1/controller/floorplan/{pk}/',
    method: 'PUT',
    parameters: [{ name: 'pk', type: 'string', description: 'Floor plan UUID or ID', required: true }],
    sampleArguments: { pk: 'fp-001' }
  },
  {
    name: 'openwisp_delete_floorplan',
    category: 'Geo & Locations',
    description: 'Delete a floor plan.',
    endpoint: '/api/v1/controller/floorplan/{pk}/',
    method: 'DELETE',
    parameters: [{ name: 'pk', type: 'string', description: 'Floor plan UUID or ID', required: true }],
    sampleArguments: { pk: 'fp-001' }
  },

  // ---------------- TEMPLATES ----------------
  {
    name: 'openwisp_list_templates',
    category: 'Templates',
    description: 'List OpenWISP configuration templates (VPN, WiFi SSIDs, Firewall, Network rules).',
    endpoint: '/api/v1/controller/template/',
    method: 'GET',
    parameters: [
      { name: 'organization', type: 'string', description: 'Filter by organization ID or slug', required: false },
      { name: 'organization_slug', type: 'string', description: 'Organization slug filter', required: false },
      { name: 'backend', type: 'string', description: 'Filter by backend (e.g., netjsonconfig.OpenWrt)', required: false },
      { name: 'type', type: 'string', description: 'Template category filter', required: false, enum: ['vpn', 'wireless', 'network', 'system', 'generic'] },
      { name: 'default', type: 'boolean', description: 'Filter default templates', required: false },
      { name: 'required', type: 'boolean', description: 'Filter required templates', required: false },
      { name: 'created', type: 'string', description: 'Exact creation timestamp filter', required: false },
      { name: 'created_gte', type: 'string', description: 'Creation timestamp lower bound', required: false },
      { name: 'created_lt', type: 'string', description: 'Creation timestamp upper bound', required: false },
      { name: 'search', type: 'string', description: 'Search by template name', required: false },
      { name: 'page', type: 'number', description: 'Page number', required: false, default: 1 },
      { name: 'page_size', type: 'number', description: 'Page size', required: false, default: 20 }
    ],
    sampleArguments: { type: 'wireless' }
  },
  {
    name: 'openwisp_get_template',
    category: 'Templates',
    description: 'Get configuration template details including NetJSON config structure.',
    endpoint: '/api/v1/controller/template/{id}/',
    method: 'GET',
    parameters: [
      { name: 'id', type: 'string', description: 'Template UUID', required: true }
    ],
    sampleArguments: { id: 'tpl-wifi-guest' }
  },
  {
    name: 'openwisp_create_template',
    category: 'Templates',
    description: 'Create a reusable configuration template in NetJSON format for OpenWISP devices.',
    endpoint: '/api/v1/controller/template/',
    method: 'POST',
    parameters: [
      { name: 'name', type: 'string', description: 'Template title (e.g. Corporate Guest WiFi)', required: true },
      { name: 'type', type: 'string', description: 'Template type', required: true, enum: ['vpn', 'wireless', 'network', 'system', 'generic'] },
      { name: 'backend', type: 'string', description: 'Config engine backend', required: false, default: 'netjsonconfig.OpenWrt' },
      { name: 'organization', type: 'string', description: 'Organization ID or slug', required: true },
      { name: 'default', type: 'boolean', description: 'Automatically assign to new devices', required: false, default: false },
      { name: 'config', type: 'object', description: 'NetJSON configuration payload object', required: true }
    ],
    sampleArguments: {
      name: 'Guest WPA3 WiFi',
      type: 'wireless',
      backend: 'netjsonconfig.OpenWrt',
      organization: 'default',
      default: false,
      config: {
        wireless: [
          {
            name: 'wlan0',
            ssid: 'Guest-WiFi-OpenWISP',
            encryption: 'sae-mixed',
            key: 'GuestPass2026!'
          }
        ]
      }
    }
  },
  {
    name: 'openwisp_get_template_configuration',
    category: 'Templates',
    description: 'Download the rendered configuration tarball for a template.',
    endpoint: '/api/v1/controller/template/{id}/configuration/',
    method: 'GET',
    parameters: [{ name: 'id', type: 'string', description: 'Template UUID', required: true }],
    sampleArguments: { id: 'tpl-wifi-guest' }
  },
  {
    name: 'openwisp_update_template',
    category: 'Templates',
    description: 'Replace a template.',
    endpoint: '/api/v1/controller/template/{id}/',
    method: 'PUT',
    parameters: [{ name: 'id', type: 'string', description: 'Template UUID', required: true }],
    sampleArguments: { id: 'tpl-wifi-guest' }
  },
  {
    name: 'openwisp_patch_template',
    category: 'Templates',
    description: 'Partially update a template.',
    endpoint: '/api/v1/controller/template/{id}/',
    method: 'PATCH',
    parameters: [{ name: 'id', type: 'string', description: 'Template UUID', required: true }],
    sampleArguments: { id: 'tpl-wifi-guest' }
  },
  {
    name: 'openwisp_delete_template',
    category: 'Templates',
    description: 'Delete a template.',
    endpoint: '/api/v1/controller/template/{id}/',
    method: 'DELETE',
    parameters: [{ name: 'id', type: 'string', description: 'Template UUID', required: true }],
    sampleArguments: { id: 'tpl-wifi-guest' }
  },
  {
    name: 'openwisp_list_vpns',
    category: 'Certificates & VPN',
    description: 'List VPN resources.',
    endpoint: '/api/v1/controller/vpn/',
    method: 'GET',
    parameters: [
      { name: 'backend', type: 'string', description: 'VPN backend', required: false },
      { name: 'subnet', type: 'string', description: 'Subnet ID filter', required: false },
      { name: 'organization', type: 'string', description: 'Organization ID or slug', required: false },
      { name: 'organization_slug', type: 'string', description: 'Organization slug filter', required: false }
    ],
    sampleArguments: {}
  },
  {
    name: 'openwisp_create_vpn',
    category: 'Certificates & VPN',
    description: 'Create a VPN resource.',
    endpoint: '/api/v1/controller/vpn/',
    method: 'POST',
    parameters: [{ name: 'name', type: 'string', description: 'VPN name', required: true }],
    sampleArguments: { name: 'WireGuard Hub' }
  },
  {
    name: 'openwisp_get_vpn',
    category: 'Certificates & VPN',
    description: 'Get VPN details.',
    endpoint: '/api/v1/controller/vpn/{id}/',
    method: 'GET',
    parameters: [{ name: 'id', type: 'string', description: 'VPN UUID or ID', required: true }],
    sampleArguments: { id: 'vpn-001' }
  },
  {
    name: 'openwisp_get_vpn_configuration',
    category: 'Certificates & VPN',
    description: 'Download VPN configuration.',
    endpoint: '/api/v1/controller/vpn/{id}/configuration/',
    method: 'GET',
    parameters: [{ name: 'id', type: 'string', description: 'VPN UUID or ID', required: true }],
    sampleArguments: { id: 'vpn-001' }
  },
  {
    name: 'openwisp_update_vpn',
    category: 'Certificates & VPN',
    description: 'Replace a VPN resource.',
    endpoint: '/api/v1/controller/vpn/{id}/',
    method: 'PUT',
    parameters: [{ name: 'id', type: 'string', description: 'VPN UUID or ID', required: true }],
    sampleArguments: { id: 'vpn-001' }
  },
  {
    name: 'openwisp_patch_vpn',
    category: 'Certificates & VPN',
    description: 'Partially update a VPN resource.',
    endpoint: '/api/v1/controller/vpn/{id}/',
    method: 'PATCH',
    parameters: [{ name: 'id', type: 'string', description: 'VPN UUID or ID', required: true }],
    sampleArguments: { id: 'vpn-001' }
  },
  {
    name: 'openwisp_delete_vpn',
    category: 'Certificates & VPN',
    description: 'Delete a VPN resource.',
    endpoint: '/api/v1/controller/vpn/{id}/',
    method: 'DELETE',
    parameters: [{ name: 'id', type: 'string', description: 'VPN UUID or ID', required: true }],
    sampleArguments: { id: 'vpn-001' }
  },
  {
    name: 'openwisp_list_cas',
    category: 'Certificates & VPN',
    description: 'List certificate authorities.',
    endpoint: '/api/v1/controller/ca/',
    method: 'GET',
    parameters: [],
    sampleArguments: {}
  },
  {
    name: 'openwisp_create_ca',
    category: 'Certificates & VPN',
    description: 'Create or import a certificate authority.',
    endpoint: '/api/v1/controller/ca/',
    method: 'POST',
    parameters: [
      { name: 'name', type: 'string', description: 'CA name', required: true },
      { name: 'certificate', type: 'string', description: 'PEM certificate for import', required: false },
      { name: 'private_key', type: 'string', description: 'PEM private key for import', required: false }
    ],
    sampleArguments: { name: 'Internal CA' }
  },
  {
    name: 'openwisp_get_ca',
    category: 'Certificates & VPN',
    description: 'Get CA details.',
    endpoint: '/api/v1/controller/ca/{id}/',
    method: 'GET',
    parameters: [{ name: 'id', type: 'string', description: 'CA UUID or ID', required: true }],
    sampleArguments: { id: 'ca-001' }
  },
  {
    name: 'openwisp_update_ca',
    category: 'Certificates & VPN',
    description: 'Replace a CA.',
    endpoint: '/api/v1/controller/ca/{id}/',
    method: 'PUT',
    parameters: [{ name: 'id', type: 'string', description: 'CA UUID or ID', required: true }],
    sampleArguments: { id: 'ca-001' }
  },
  {
    name: 'openwisp_patch_ca',
    category: 'Certificates & VPN',
    description: 'Partially update a CA.',
    endpoint: '/api/v1/controller/ca/{id}/',
    method: 'PATCH',
    parameters: [{ name: 'id', type: 'string', description: 'CA UUID or ID', required: true }],
    sampleArguments: { id: 'ca-001' }
  },
  {
    name: 'openwisp_download_ca_crl',
    category: 'Certificates & VPN',
    description: 'Download a CA CRL file.',
    endpoint: '/api/v1/controller/ca/{id}/crl/',
    method: 'GET',
    parameters: [{ name: 'id', type: 'string', description: 'CA UUID or ID', required: true }],
    sampleArguments: { id: 'ca-001' }
  },
  {
    name: 'openwisp_delete_ca',
    category: 'Certificates & VPN',
    description: 'Delete a CA.',
    endpoint: '/api/v1/controller/ca/{id}/',
    method: 'DELETE',
    parameters: [{ name: 'id', type: 'string', description: 'CA UUID or ID', required: true }],
    sampleArguments: { id: 'ca-001' }
  },
  {
    name: 'openwisp_renew_ca',
    category: 'Certificates & VPN',
    description: 'Renew a CA.',
    endpoint: '/api/v1/controller/ca/{id}/renew/',
    method: 'POST',
    parameters: [{ name: 'id', type: 'string', description: 'CA UUID or ID', required: true }],
    sampleArguments: { id: 'ca-001' }
  },
  {
    name: 'openwisp_list_certs',
    category: 'Certificates & VPN',
    description: 'List certificates.',
    endpoint: '/api/v1/controller/cert/',
    method: 'GET',
    parameters: [],
    sampleArguments: {}
  },
  {
    name: 'openwisp_create_cert',
    category: 'Certificates & VPN',
    description: 'Create or import a certificate.',
    endpoint: '/api/v1/controller/cert/',
    method: 'POST',
    parameters: [
      { name: 'name', type: 'string', description: 'Certificate name', required: true },
      { name: 'ca', type: 'string', description: 'CA UUID or ID', required: false },
      { name: 'certificate', type: 'string', description: 'PEM certificate for import', required: false },
      { name: 'private_key', type: 'string', description: 'PEM private key for import', required: false }
    ],
    sampleArguments: { name: 'Device Cert' }
  },
  {
    name: 'openwisp_get_cert',
    category: 'Certificates & VPN',
    description: 'Get certificate details.',
    endpoint: '/api/v1/controller/cert/{id}/',
    method: 'GET',
    parameters: [{ name: 'id', type: 'string', description: 'Certificate UUID or ID', required: true }],
    sampleArguments: { id: 'cert-001' }
  },
  {
    name: 'openwisp_update_cert',
    category: 'Certificates & VPN',
    description: 'Replace a certificate.',
    endpoint: '/api/v1/controller/cert/{id}/',
    method: 'PUT',
    parameters: [{ name: 'id', type: 'string', description: 'Certificate UUID or ID', required: true }],
    sampleArguments: { id: 'cert-001' }
  },
  {
    name: 'openwisp_patch_cert',
    category: 'Certificates & VPN',
    description: 'Partially update a certificate.',
    endpoint: '/api/v1/controller/cert/{id}/',
    method: 'PATCH',
    parameters: [{ name: 'id', type: 'string', description: 'Certificate UUID or ID', required: true }],
    sampleArguments: { id: 'cert-001' }
  },
  {
    name: 'openwisp_delete_cert',
    category: 'Certificates & VPN',
    description: 'Delete a certificate.',
    endpoint: '/api/v1/controller/cert/{id}/',
    method: 'DELETE',
    parameters: [{ name: 'id', type: 'string', description: 'Certificate UUID or ID', required: true }],
    sampleArguments: { id: 'cert-001' }
  },
  {
    name: 'openwisp_renew_cert',
    category: 'Certificates & VPN',
    description: 'Renew a certificate.',
    endpoint: '/api/v1/controller/cert/{id}/renew/',
    method: 'POST',
    parameters: [{ name: 'id', type: 'string', description: 'Certificate UUID or ID', required: true }],
    sampleArguments: { id: 'cert-001' }
  },
  {
    name: 'openwisp_revoke_cert',
    category: 'Certificates & VPN',
    description: 'Revoke a certificate.',
    endpoint: '/api/v1/controller/cert/{id}/revoke/',
    method: 'POST',
    parameters: [{ name: 'id', type: 'string', description: 'Certificate UUID or ID', required: true }],
    sampleArguments: { id: 'cert-001' }
  },

  // ---------------- NETWORK TOPOLOGY ----------------
  {
    name: 'openwisp_list_topologies',
    category: 'Network Topology',
    description: 'List network topologies collected via mesh protocols (OLSR, Batman-adv, WireGuard, OpenVPN).',
    endpoint: '/api/v1/network-topology/topology/',
    method: 'GET',
    parameters: [
      { name: 'organization', type: 'string', description: 'Organization filter', required: false }
    ],
    sampleArguments: {}
  },
  {
    name: 'openwisp_get_topology',
    category: 'Network Topology',
    description: 'Retrieve network topology details including node list, link metrics, and graph connections.',
    endpoint: '/api/v1/network-topology/topology/{id}/',
    method: 'GET',
    parameters: [
      { name: 'id', type: 'string', description: 'Topology UUID', required: true }
    ],
    sampleArguments: { id: 'topo-mesh-01' }
  },
  {
    name: 'openwisp_list_nodes',
    category: 'Network Topology',
    description: 'List nodes (routers/switches/endpoints) participating in a network topology.',
    endpoint: '/api/v1/network-topology/node/',
    method: 'GET',
    parameters: [
      { name: 'topology', type: 'string', description: 'Filter nodes belonging to specific topology ID', required: false }
    ],
    sampleArguments: { topology: 'topo-mesh-01' }
  },
  {
    name: 'openwisp_list_links',
    category: 'Network Topology',
    description: 'List physical or virtual links between nodes in a network topology with link status.',
    endpoint: '/api/v1/network-topology/link/',
    method: 'GET',
    parameters: [
      { name: 'topology', type: 'string', description: 'Filter links belonging to specific topology ID', required: false },
      { name: 'status', type: 'string', description: 'Link status filter', required: false, enum: ['up', 'down', 'all'] }
    ],
    sampleArguments: { status: 'up' }
  },

  // ---------------- RADIUS & WIFI ----------------
  {
    name: 'openwisp_list_radius_sessions',
    category: 'RADIUS & WiFi',
    description: 'List RADIUS authentication and accounting sessions for WiFi hot-spots and captive portals.',
    endpoint: '/api/v1/radius/accounting/',
    method: 'GET',
    parameters: [
      { name: 'username', type: 'string', description: 'Filter RADIUS sessions by end-user username', required: false },
      { name: 'calling_station_id', type: 'string', description: 'Filter by client MAC address', required: false },
      { name: 'page', type: 'number', description: 'Page number', required: false, default: 1 }
    ],
    sampleArguments: { page: 1 }
  },
  {
    name: 'openwisp_get_radius_usage',
    category: 'RADIUS & WiFi',
    description: 'Get aggregated RADIUS bandwidth and session usage metrics for an organization or user.',
    endpoint: '/api/v1/radius/usage/',
    method: 'GET',
    parameters: [
      { name: 'organization', type: 'string', description: 'Organization slug or ID', required: false },
      { name: 'username', type: 'string', description: 'User account filter', required: false }
    ],
    sampleArguments: { organization: 'default' }
  }
];

// Export full tool definitions
export const OPENWISP_FULL_TOOLS: McpToolDefinition[] = OPENWISP_MCP_TOOLS;

// Filter diagnostic tools (read-only GET methods)
export const OPENWISP_DIAGNOSTIC_TOOLS: McpToolDefinition[] = OPENWISP_MCP_TOOLS.filter(
  tool => tool.method === 'GET'
);

// Helper function to get tools by server mode
export function getOpenWispTools(mode: 'diagnostic' | 'full' = 'full'): McpToolDefinition[] {
  if (mode === 'diagnostic') {
    return OPENWISP_DIAGNOSTIC_TOOLS;
  }
  return OPENWISP_FULL_TOOLS;
}
