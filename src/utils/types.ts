export interface IPv4Address {
  publicAddress?: string;
  privateAddress?: string;
  publicPort?: number;
}

export interface Device {
  category: string;
  value: string;
  name: string;
  isInitial?: boolean;
}

export interface LocationData {
  lastLocationTime: string;
  area: {
    areaType: "CIRCLE" | string; // Assuming it could also have other area types in the future
    center: {
      latitude: number;
      longitude: number;
    };
    radius: number;
  };
}

export interface CredentialData {
  client_id: string;
  client_secret: string;
}

export interface AuthorizationEndpoints {
  authorization_endpoint: string;
  token_endpoint: string;
  [key: string]: unknown; // Optional, for additional properties
}

export interface SessData {
  device?: {
    phoneNumber?: string;
    networkAccessIdentifier?: string;
    ipv4Address?: IPv4Address;
    ipv6Address?: string;
  };
  webhook?: {
    notificationUrl?: string;
    notificationAuthToken?: string;
  };
  subscriptionExpireTime?: string;
}

export interface DeviceCamara {
  phoneNumber?: string;
  networkAccessIdentifier?: string;
  ipv4Address?: IPv4Address;
  ipv6Address?: string;
}

export interface QueryData {
  device?: DeviceCamara;
  start?: string; // ISO string format
  end?: string; // ISO string format
}

// Define the type for webhook object
interface Webhook {
  notificationUrl?: string;
  notificationAuthToken?: string;
}

// Define the type for the subscriptionDetail
interface SubscriptionDetail {
  device?: DeviceCamara;
  type?: string;
}

// Define the full type for the data structure
export interface Subscription {
  subscriptionDetail?: SubscriptionDetail;
  subscriptionExpireTime?: string;
  webhook?: Webhook;
}

// Define the type for the range (used in ports)
interface PortRange {
  from?: number;
  to?: number;
}

// Define the type for the devicePorts or applicationServerPorts
interface DevicePorts {
  ranges?: PortRange[];
  ports?: number[];
}

// Define the type for the applicationServer
interface ApplicationServer {
  ipv4Address?: string;
  ipv6Address?: string;
}

// Define the main type that combines all the parts
export interface SubscriptionQoD {
  qosProfile?: string;
  device?: DeviceCamara;
  devicePorts?: DevicePorts;
  applicationServer?: ApplicationServer;
  applicationServerPorts?: DevicePorts;
  webhook?: Webhook;
  duration?: number;
}

// Define types for JsonValue and JsonObject
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonValue[];

export interface JsonObject {
  [key: string]: JsonValue;
}
