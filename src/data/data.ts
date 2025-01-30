import { DeviceEntry } from "@/utils/types";

export const deviceStatusTypes = [
  "org.camaraproject.device-status.v0.roaming-status",
  "org.camaraproject.device-status.v0.roaming-on",
  "org.camaraproject.device-status.v0.roaming-off",
  "org.camaraproject.device-status.v0.roaming-change-country",
  "org.camaraproject.device-status.v0.connectivity-data",
  "org.camaraproject.device-status.v0.connectivity-sms",
  "org.camaraproject.device-status.v0.connectivity-disconnected",
];

export const categories = [
  { value: "phone", label: "Phone Number" },
  { value: "qod", label: "QoD Profile" },
  { value: "nai", label: "NAI" },
  { value: "ipv4", label: "IPv4 Address" },
  { value: "ipv6", label: "IPv6 Address" },
];

export const initialDevices: DeviceEntry[] = [
  {
    category: "phone",
    name: "Test",
    value: "+36371234567",
    isInitial: true,
  },
  {
    category: "phone",
    name: "Test",
    value: "+36701234567",
    isInitial: true,
  },
  {
    category: "phone",
    name: "Test",
    value: "+36711234567",
    isInitial: true,
  },
  {
    category: "nai",
    name: "Test",
    value: "testdevice@testcsp.net",
    isInitial: true,
  },
  { category: "qod", name: "QOS_E", value: "QOS_E", isInitial: true },
  { category: "qod", name: "QOS_M", value: "QOS_M", isInitial: true },
  { category: "qod", name: "QOS_S", value: "QOS_S", isInitial: true },
  { category: "qod", name: "QOS_L", value: "QOS_L", isInitial: true },
  {
    category: "qod",
    name: "DOWNLINK_S_UPLINK_S",
    value: "DOWNLINK_S_UPLINK_S",
    isInitial: true,
  },
  {
    category: "qod",
    name: "DOWNLINK_S_UPLINK_M",
    value: "DOWNLINK_S_UPLINK_M",
    isInitial: true,
  },
  {
    category: "qod",
    name: "DOWNLINK_S_UPLINK_L",
    value: "DOWNLINK_S_UPLINK_L",
    isInitial: true,
  },
  {
    category: "qod",
    name: "DOWNLINK_M_UPLINK_S",
    value: "DOWNLINK_M_UPLINK_S",
    isInitial: true,
  },
  {
    category: "qod",
    name: "DOWNLINK_M_UPLINK_M",
    value: "DOWNLINK_M_UPLINK_M",
    isInitial: true,
  },
  {
    category: "qod",
    name: "DOWNLINK_L_UPLINK_S",
    value: "DOWNLINK_L_UPLINK_S",
    isInitial: true,
  },
  {
    category: "qod",
    name: "DOWNLINK_L_UPLINK_M",
    value: "DOWNLINK_L_UPLINK_M",
    isInitial: true,
  },
  {
    category: "qod",
    name: "DOWNLINK_L_UPLINK_L",
    value: "DOWNLINK_L_UPLINK_L",
    isInitial: true,
  },
  {
    category: "ipv4",
    name: "Test",
    value: "192.168.1.1",
    isInitial: true,
  },
  {
    category: "ipv4",
    name: "Test",
    value: "192.168.0.1",
    isInitial: true,
  },
  {
    category: "ipv6",
    name: "Data Center",
    value: "2001:db8::1",
    isInitial: true,
  },
  {
    category: "ipv6",
    name: "Cloud Node",
    value: "2001:db8::2",
    isInitial: true,
  },
];
