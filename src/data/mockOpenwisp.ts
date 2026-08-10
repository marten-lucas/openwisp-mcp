import {
  OpenWispDevice,
  OpenWispTemplate,
  OpenWispTopology,
  OpenWispUser,
  OpenWispOrganization,
  OpenWispRadiusSession
} from '../types';

export const MOCK_ORGANIZATIONS: OpenWispOrganization[] = [
  { id: 'org-01', name: 'Default Organization', slug: 'default', created: '2025-01-10T08:00:00Z' },
  { id: 'org-02', name: 'Berlin Campus Network', slug: 'berlin-campus', created: '2025-03-15T10:30:00Z' },
  { id: 'org-03', name: 'Munich Branch Offices', slug: 'munich-branch', created: '2025-05-20T14:15:00Z' }
];

export const MOCK_USERS: OpenWispUser[] = [
  {
    id: 'usr-001',
    username: 'admin',
    email: 'admin@openwisp.org',
    first_name: 'System',
    last_name: 'Administrator',
    is_active: true,
    is_staff: true,
    organizations: ['default', 'berlin-campus', 'munich-branch'],
    date_joined: '2025-01-10T08:00:00Z'
  },
  {
    id: 'usr-002',
    username: 'netops_berlin',
    email: 'netops@berlin.openwisp.org',
    first_name: 'Hans',
    last_name: 'Müller',
    is_active: true,
    is_staff: false,
    organizations: ['berlin-campus'],
    date_joined: '2025-04-01T09:12:00Z'
  },
  {
    id: 'usr-003',
    username: 'wifi_support',
    email: 'support@munich.openwisp.org',
    first_name: 'Anna',
    last_name: 'Schmidt',
    is_active: true,
    is_staff: false,
    organizations: ['munich-branch'],
    date_joined: '2025-06-18T11:45:00Z'
  }
];

export const MOCK_TEMPLATES: OpenWispTemplate[] = [
  {
    id: 'tpl-wifi-corp',
    name: 'Corporate WPA3 Enterprise WiFi',
    backend: 'netjsonconfig.OpenWrt',
    type: 'wireless',
    organization: 'default',
    default: true,
    required: false,
    config: {
      wireless: [
        {
          name: 'radio0',
          hwmode: '11ax',
          htmode: 'HE80',
          channel: 'auto'
        },
        {
          name: 'wlan0',
          device: 'radio0',
          mode: 'ap',
          ssid: 'OpenWISP-Corporate',
          encryption: 'wpa3',
          isolate: '0'
        }
      ]
    },
    created: '2025-02-01T12:00:00Z'
  },
  {
    id: 'tpl-vpn-wireguard',
    name: 'HQ WireGuard Tunnel Mesh',
    backend: 'netjsonconfig.OpenWrt',
    type: 'vpn',
    organization: 'berlin-campus',
    default: false,
    required: true,
    config: {
      wireguard: {
        private_key: '===SECRET_WG_KEY===',
        listen_port: 51820,
        peers: [
          {
            public_key: '928fkaJ29f...=',
            allowed_ips: ['10.200.0.0/16'],
            endpoint: 'vpn.openwisp.io:51820'
          }
        ]
      }
    },
    created: '2025-03-10T15:30:00Z'
  },
  {
    id: 'tpl-guest-captive',
    name: 'Hotspot Captive Portal (RADIUS)',
    backend: 'netjsonconfig.OpenWrt',
    type: 'generic',
    organization: 'default',
    default: false,
    required: false,
    config: {
      coova_chilli: {
        radius_server: 'radius.openwisp.org',
        radius_secret: 'OpenWispRadiusSecret2026',
        uam_server: 'https://login.openwisp.org'
      }
    },
    created: '2025-04-20T09:00:00Z'
  }
];

export const MOCK_DEVICES: OpenWispDevice[] = [
  {
    id: 'dev-001',
    name: 'GW-Berlin-HQ-01',
    mac: '00:11:22:33:44:55',
    model: 'GL.iNet GL-AXT1800 Slate AX',
    ip_address: '192.168.1.1',
    organization: 'berlin-campus',
    status: 'online',
    last_ip: '198.51.100.22',
    hardware: 'Qualcomm IPQ6018',
    os: 'OpenWrt 23.05.2',
    system: 'OpenWrt',
    created: '2025-02-15T10:00:00Z',
    modified: '2026-08-09T18:30:00Z',
    templates: ['tpl-wifi-corp', 'tpl-vpn-wireguard'],
    location: {
      latitude: 52.5200,
      longitude: 13.4050,
      address: 'Alexanderplatz 1, 10178 Berlin, Germany'
    }
  },
  {
    id: 'dev-002',
    name: 'AP-Munich-Floor2-West',
    mac: '00:1B:44:A1:B2:C3',
    model: 'TP-Link Archer C7 v5',
    ip_address: '192.168.10.45',
    organization: 'munich-branch',
    status: 'online',
    last_ip: '203.0.113.88',
    hardware: 'Atheros QCA9563',
    os: 'OpenWrt 22.03.5',
    system: 'OpenWrt',
    created: '2025-05-22T14:20:00Z',
    modified: '2026-08-09T20:12:00Z',
    templates: ['tpl-wifi-corp', 'tpl-guest-captive'],
    location: {
      latitude: 48.1371,
      longitude: 11.5761,
      address: 'Marienplatz 8, 80331 München, Germany'
    }
  },
  {
    id: 'dev-003',
    name: 'Router-Outdoor-Mesh-03',
    mac: '00:80:48:66:77:88',
    model: 'Ubiquiti UniFi AP AC Mesh',
    ip_address: '10.200.5.12',
    organization: 'default',
    status: 'warning',
    last_ip: '198.51.100.99',
    hardware: 'Atheros QCA9563',
    os: 'OpenWrt 23.05.0',
    system: 'OpenWrt',
    created: '2025-06-01T11:00:00Z',
    modified: '2026-08-09T22:05:00Z',
    templates: ['tpl-vpn-wireguard'],
    location: {
      latitude: 52.5163,
      longitude: 13.3777,
      address: 'Brandenburger Tor, Berlin, Germany'
    }
  }
];

export const MOCK_TOPOLOGIES: OpenWispTopology[] = [
  {
    id: 'topo-mesh-01',
    label: 'Berlin Mesh Backbone (OLSRv2)',
    parser: 'olsr',
    strategy: 'fetch',
    organization: 'berlin-campus',
    nodes_count: 3,
    links_count: 3,
    created: '2025-03-01T12:00:00Z',
    nodes: [
      { id: 'node-01', label: 'GW-Berlin-HQ-01', addresses: ['10.200.0.1', '192.168.1.1'], organization: 'berlin-campus' },
      { id: 'node-02', label: 'AP-Munich-Floor2-West', addresses: ['10.200.0.2', '192.168.10.45'], organization: 'munich-branch' },
      { id: 'node-03', label: 'Router-Outdoor-Mesh-03', addresses: ['10.200.0.3'], organization: 'default' }
    ],
    links: [
      { id: 'link-01', source: 'node-01', target: 'node-02', cost: 1.05, status: 'up', organization: 'berlin-campus' },
      { id: 'link-02', source: 'node-02', target: 'node-03', cost: 1.42, status: 'up', organization: 'default' },
      { id: 'link-03', source: 'node-01', target: 'node-03', cost: 2.15, status: 'down', organization: 'berlin-campus' }
    ]
  }
];

export const MOCK_RADIUS_SESSIONS: OpenWispRadiusSession[] = [
  {
    id: 'rad-101',
    username: 'guest_user_8912',
    calling_station_id: 'A4:C3:F0:11:22:33',
    framed_ip_address: '10.50.0.104',
    acct_start_time: '2026-08-10T00:15:00Z',
    acct_input_octets: 154829381, // ~154 MB down
    acct_output_octets: 28491029,  // ~28 MB up
    organization: 'default'
  },
  {
    id: 'rad-102',
    username: 'emp_h_mueller',
    calling_station_id: 'C8:2A:14:88:99:AA',
    framed_ip_address: '10.50.0.118',
    acct_start_time: '2026-08-09T22:00:00Z',
    acct_input_octets: 8429104821, // ~8.4 GB down
    acct_output_octets: 1294810294, // ~1.2 GB up
    organization: 'berlin-campus'
  }
];
