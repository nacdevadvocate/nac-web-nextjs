"use client";
import Loading from "@/components/Loading";
import Tab from "@/components/Tab";
import Tabs from "@/components/Tabs";
import { useMessage } from "@/contexts/message";
import { CREDENTIALS } from "@/data/credential";
import { useLocalStorageBase64 } from "@/hooks/useLocalStorage64";
import { useSessionStorage } from "@/hooks/useSessionStorage";
import { jsonToTableData } from "@/utils/copy";
import { isAxiosError } from "@/utils/isAxiosError";
import {
  DeviceEntry,
  IPv4Address,
  JsonObject,
  JsonValue,
  SubscriptionQoD,
} from "@/utils/types";
import axios from "axios";
import { useEffect, useState } from "react";
import { BsExclamation } from "react-icons/bs";
import { FaCopy } from "react-icons/fa";

interface FormValues {
  phoneNumber?: string;
  networkAccessIdentifier?: string;
  identifier?: string;
  profileSelect: string;
  duration: number;
  devicePublicIp?: string;
  devicePrivateIp?: string;
  devicePublicPort?: number;
  deviceIpv6?: string;
  appServerIpv4?: string;
  appServerIpv6?: string;
  notificationUrl: string;
  notificationAuthToken?: string;
}

interface SessionData {
  sessionId: string;
  [key: string]: string | number | boolean | undefined; // Add specific fields here as needed
}

interface DataType {
  [key: string]: JsonValue;
}

const QoDPage = () => {
  const [devices] = useLocalStorageBase64<DeviceEntry[]>("devices", []);
  const [selectedToken] = useLocalStorageBase64<string | null>(
    "selectedToken",
    null
  );
  const [, setValue] = useSessionStorage("tab");
  const [identifierType, setIdentifierType] = useState<"phone" | "nai">(
    "phone"
  );
  const { error, success, setError, setSuccess, clearMessages } = useMessage();
  const qodProfiles = devices.filter((device) => device.category === "qod");
  const filteredDevices = devices.filter(
    (device) => device.category === identifierType
  );

  console.log({ error });

  const [formValues, setFormValues] = useState<FormValues>({
    phoneNumber: "",
    networkAccessIdentifier: "",
    identifier: "",
    profileSelect: qodProfiles[0]?.value || "",
    duration: 240,
    devicePublicIp: "",
    devicePrivateIp: "",
    devicePublicPort: 0,
    deviceIpv6: "",
    appServerIpv4: "",
    appServerIpv6: "",
    notificationUrl: "",
    notificationAuthToken: "",
  });

  const [sessionId, setSessionId] = useState<string>("");
  const [viewMode, setViewMode] = useState<"json" | "table">("json");
  const [loading, setLoading] = useState<boolean>(false);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [data, setData] = useState<DataType | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [isMobileView, setIsMobileView] = useState(false);

  // Listen for screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768); // Adjust breakpoint as needed
    };

    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // QoD Profile validation
    if (!formValues.profileSelect) {
      newErrors.profileSelect = "QoD Profile is required";
    }

    // Duration validation
    if (!formValues.duration) {
      newErrors.duration = "Duration is required";
    } else if (formValues.duration <= 0) {
      newErrors.duration = "Duration must be greater than 0";
    }

    // At least one of appServerIpv4 or appServerIpv6
    if (!formValues.appServerIpv4 && !formValues.appServerIpv6) {
      newErrors.applicationServerIP =
        "At least one of Application IPv4 or IPv6 is required";
    }

    // At least one of these fields must be provided
    if (!formValues.identifier) {
      newErrors.deviceInfo =
        "At least one of Phone Number, Network Access Identifier";
    }

    // Set the errors in state
    setErrors(newErrors);

    // Return true if no errors, otherwise false
    return Object.keys(newErrors).length === 0;
  };

  console.log(errors);

  const initialFormValues: FormValues = {
    profileSelect: "QOS_M",
    duration: 180,
    notificationUrl: "",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log({ formValues });

    if (!validateForm()) return console.log("Error hapened");

    console.log("Form submitted:", formValues);

    // Constructing sessData with only defined properties
    const sessData: SubscriptionQoD = {};

    // QoD Profile
    if (formValues.profileSelect) {
      sessData.qosProfile = formValues.profileSelect;
    }

    // Device Information
    if (
      formValues.identifier ||
      formValues.devicePublicIp ||
      formValues.deviceIpv6
    ) {
      sessData.device = {};

      if (formValues.identifier && identifierType === "phone")
        sessData.device.phoneNumber = formValues.identifier;
      if (formValues.identifier && identifierType === "nai")
        sessData.device.networkAccessIdentifier = formValues.identifier;

      const ipv4Address: Partial<IPv4Address> = {};
      if (formValues.devicePublicIp)
        ipv4Address.publicAddress = formValues.devicePublicIp;
      if (formValues.devicePrivateIp)
        ipv4Address.privateAddress = formValues.devicePrivateIp;
      if (formValues.devicePublicPort)
        ipv4Address.publicPort = formValues.devicePublicPort;

      if (Object.keys(ipv4Address).length >= 2) {
        sessData.device.ipv4Address = ipv4Address;
      }

      if (formValues.deviceIpv6) {
        sessData.device.ipv6Address = formValues.deviceIpv6;
      }
    }

    // Application Server Information
    if (formValues.appServerIpv4 || formValues.appServerIpv6) {
      sessData.applicationServer = {};
      if (formValues.appServerIpv4)
        sessData.applicationServer.ipv4Address = formValues.appServerIpv4;
      if (formValues.appServerIpv6)
        sessData.applicationServer.ipv6Address = formValues.appServerIpv6;
    }

    // Webhook Information
    if (formValues.notificationUrl || formValues.notificationAuthToken) {
      sessData.webhook = {};
      if (formValues.notificationUrl)
        sessData.webhook.notificationUrl = formValues.notificationUrl;
      if (formValues.notificationAuthToken)
        sessData.webhook.notificationAuthToken =
          formValues.notificationAuthToken;
    }

    // Duration
    if (formValues.duration) {
      sessData.duration = formValues.duration;
    }

    console.log("Final sessData:", sessData);

    // API Request
    setLoading(true);
    clearMessages();

    try {
      const response = await axios.post(
        `${CREDENTIALS.QOD_URL}/sessions`, // Replace with actual endpoint
        sessData,
        {
          headers: {
            "content-type": "application/json",
            "X-RapidAPI-Key": selectedToken,
            "X-RapidAPI-Host": CREDENTIALS.QOD_HOST,
          },
        }
      );

      if (response.status === 201) {
        setSessionData(response.data);
        setFormValues(initialFormValues); // Reset form
        setSessionId(response.data.sessionId);
        setValue("1"); // Navigate to a new tab or page
      }

      console.log("API Response:", response);
    } catch (error) {
      if (isAxiosError(error)) {
        let errorMessage = "An unexpected error occurred.";

        if (error.response?.data) {
          const { detail, message } = error.response.data;

          if (Array.isArray(detail) && detail.length > 0 && detail[0]?.msg) {
            errorMessage = detail.map((err) => err.msg).join(", ");
          } else if (typeof detail === "string") {
            errorMessage = detail;
          } else if (message) {
            errorMessage = message;
          }
        }

        setError(errorMessage);
      } else {
        console.error("Non-Axios error:", error);
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionData = async () => {
    setLoading(true);
    clearMessages();
    try {
      const response = await axios.get(
        `${CREDENTIALS.QOD_URL}/sessions/${sessionId}`, // Replace with actual endpoint
        {
          headers: {
            "content-type": "application/json",
            "X-RapidAPI-Key": selectedToken,
            "X-RapidAPI-Host": CREDENTIALS.QOD_HOST,
          },
        }
      );

      if (response.status === 200) {
        setData(response.data);
      }

      console.log("API Response:", response);
    } catch (error) {
      if (isAxiosError(error)) {
        let errorMessage = "An unexpected error occurred.";

        if (error.response?.data) {
          const { detail, message } = error.response.data;

          if (Array.isArray(detail) && detail.length > 0 && detail[0]?.msg) {
            errorMessage = detail.map((err) => err.msg).join(", ");
          } else if (typeof detail === "string") {
            errorMessage = detail;
          } else if (message) {
            errorMessage = message;
          }
        }

        setError(errorMessage);
        // showToast(errorMessage, "error", 3000); // Error toast
      } else {
        console.error("Non-Axios error:", error);
        setError("An unexpected error occurred.");
        // showToast("An unexpected error occurred.", "error", 3000); // Error toast
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionsData = async () => {
    setLoading(true);
    clearMessages();
    try {
      const response = await axios.get(
        `${CREDENTIALS.QOD_URL}/sessions`, // Replace with actual endpoint
        {
          headers: {
            "content-type": "application/json",
            "X-RapidAPI-Key": selectedToken,
            "X-RapidAPI-Host": CREDENTIALS.QOD_HOST,
          },
        }
      );

      if (response.status === 200) {
        setData(response.data);
      }

      console.log("API Response:", response);
    } catch (error) {
      if (isAxiosError(error)) {
        let errorMessage = "An unexpected error occurred.";

        if (error.response?.data) {
          const { detail, message } = error.response.data;

          if (Array.isArray(detail) && detail.length > 0 && detail[0]?.msg) {
            errorMessage = detail.map((err) => err.msg).join(", ");
          } else if (typeof detail === "string") {
            errorMessage = detail;
          } else if (message) {
            errorMessage = message;
          }
        }

        setError(errorMessage);
      } else {
        console.error("Non-Axios error:", error);
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteSessionData = async () => {
    setLoading(true);
    clearMessages();
    try {
      const response = await axios.delete(
        `${CREDENTIALS.QOD_URL}/sessions/${sessionId}`, // Replace with actual endpoint
        {
          headers: {
            "content-type": "application/json",
            "X-RapidAPI-Key": selectedToken,
            "X-RapidAPI-Host": CREDENTIALS.QOD_HOST,
          },
        }
      );

      if (response.status === 204) {
        setData(null);
        setSuccess("Session deleted successfully!", 5000);
        setSessionId("");
      }

      console.log("API Response:", response);
    } catch (error) {
      if (isAxiosError(error)) {
        let errorMessage = "An unexpected error occurred.";

        if (error.response?.data) {
          const { detail, message } = error.response.data;

          if (Array.isArray(detail) && detail.length > 0 && detail[0]?.msg) {
            errorMessage = detail.map((err) => err.msg).join(", ");
          } else if (typeof detail === "string") {
            errorMessage = detail;
          } else if (message) {
            errorMessage = message;
          }
        }

        setError(errorMessage);
        // showToast(errorMessage, "error", 3000); // Error toast
      } else {
        console.error("Non-Axios error:", error);
        setError("An unexpected error occurred.");
        // showToast("An unexpected error occurred.", "error", 3000); // Error toast
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to copy JSON to clipboard
  const [copied, setCopied] = useState(false);

  // Function to copy JSON to clipboard
  const copyToClipboard = async (single: boolean) => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(single ? sessionData : data, null, 2)
      );
      setCopied(true); // Set copied to true
      setTimeout(() => setCopied(false), 5000); // Reset after 5 seconds
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const tableData = jsonToTableData(sessionData as JsonObject);

  return (
    <div className="container font-work-sans">
      <h1 className="text-3xl font-bold text-center">
        Quality of Service on Demand
      </h1>

      <Tabs>
        {/* Create session Tab */}
        <Tab label={isMobileView ? "Create" : "Create session"}>
          {/* Error Message */}
          {Object.keys(errors).length > 0 && (
            <div className="p-4 mb-6 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md">
              <div className="flex items-start">
                <BsExclamation className="w-5 h-5 mr-3 text-red-600" />
                <div>
                  <p className="font-semibold">
                    Please fix the following errors:
                  </p>
                  <ul className="list-disc list-inside">
                    {Object.entries(errors).map(([field, message]) => (
                      <li key={field} className="mt-1">
                        {message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Error Message from API */}
          {error && (
            <div className="flex items-center p-4 mb-6 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md">
              <BsExclamation className="w-5 h-5 mr-3 text-red-600" />
              <p className="flex-1">Error: {error}</p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-white p-6 rounded-md"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="identifierType"
                  className="block text-sm font-semibold mb-1"
                >
                  Select Identifier Type
                </label>
                <select
                  id="identifierType"
                  value={identifierType}
                  onChange={(e) => {
                    setIdentifierType(e.target.value as "phone" | "nai");
                    setFormValues((prev) => ({
                      ...prev,
                      identifier: "", // Reset the identifier value
                    }));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="phone">Phone Number</option>
                  <option value="nai">Network Access Identifier (NAI)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="identifier"
                  className="block text-sm font-semibold mb-1"
                >
                  {identifierType === "phone"
                    ? "Phone Numbers"
                    : "Network Access Identifiers (NAIs)"}
                </label>
                {filteredDevices.length > 0 ? (
                  <select
                    id="identifier"
                    name="identifier"
                    value={formValues.identifier}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="" disabled>
                      Select{" "}
                      {identifierType === "phone" ? "Phone Number" : "NAI"}
                    </option>
                    {filteredDevices.map((device, index) => (
                      <option key={index} value={device.value}>
                        {device.name} ({device.value})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No {identifierType === "phone" ? "Phone Number" : "NAI"}{" "}
                    available.
                  </p>
                )}
              </div>

              {/* QoD Profile */}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  QoD Profile
                </label>
                <select
                  name="profileSelect"
                  value={formValues.profileSelect}
                  className="input border border-gray-300 rounded-md w-full p-2"
                  onChange={handleInputChange}
                >
                  {qodProfiles.map((profile) => (
                    <option key={profile.value} value={profile.value}>
                      {profile.value}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Duration
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formValues.duration}
                  onChange={handleInputChange}
                  className="input border border-gray-300 rounded-md w-full p-2"
                  placeholder="180"
                  min={0}
                />
              </div>

              {/* Device IPv4 Public Address */}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Device IPv4 Public Address
                </label>
                <input
                  type="text"
                  name="devicePublicIp"
                  className="input border border-gray-300 rounded-md w-full p-2"
                  value={formValues.devicePublicIp}
                  onChange={handleInputChange}
                  placeholder="233.252.0.2"
                />
              </div>

              {/* Device IPv4 Private Address */}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Device IPv4 Private Address
                </label>
                <input
                  type="text"
                  name="devicePrivateIp"
                  className="input border border-gray-300 rounded-md w-full p-2"
                  value={formValues.devicePrivateIp}
                  onChange={handleInputChange}
                  placeholder="192.0.2.25"
                />
              </div>

              {/* Device Public Port */}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Device Public Port
                </label>
                <input
                  type="number"
                  name="devicePublicPort"
                  className="input border border-gray-300 rounded-md w-full p-2"
                  value={formValues.devicePublicPort}
                  onChange={handleInputChange}
                  placeholder="80"
                />
              </div>

              {/* Device IPv6 Address */}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Device IPv6 Address
                </label>
                <input
                  type="text"
                  name="deviceIpv6"
                  className="input border border-gray-300 rounded-md w-full p-2"
                  value={formValues.deviceIpv6}
                  onChange={handleInputChange}
                  placeholder="2001:db8:1234:5678:9abc:def0:fedc:ba98"
                />
              </div>

              {/* App Server IPv4 Address */}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  App Server IPv4 Address
                </label>
                <input
                  type="text"
                  name="appServerIpv4"
                  className="input border border-gray-300 rounded-md w-full p-2"
                  value={formValues.appServerIpv4}
                  onChange={handleInputChange}
                  placeholder="233.252.0.2"
                />
              </div>

              {/* App Server IPv6 Address */}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  App Server IPv6 Address
                </label>
                <input
                  type="text"
                  name="appServerIpv6"
                  className="input border border-gray-300 rounded-md w-full p-2"
                  value={formValues.appServerIpv6}
                  onChange={handleInputChange}
                  placeholder="2001:db8:1234:5678:9abc:def0:fedc:ba98"
                />
              </div>

              {/* Notification URL */}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Notification URL
                </label>
                <input
                  type="url"
                  name="notificationUrl"
                  className="input border border-gray-300 rounded-md w-full p-2"
                  value={formValues.notificationUrl}
                  onChange={handleInputChange}
                  placeholder="https://notification-server.com"
                />
              </div>

              {/* Notification Auth Token */}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Notification Auth Token
                </label>
                <input
                  type="text"
                  name="notificationAuthToken"
                  className="input border border-gray-300 rounded-md w-full p-2"
                  value={formValues.notificationAuthToken}
                  onChange={handleInputChange}
                  placeholder="c8974e592c2fa383d4a3960714"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              {loading ? (
                <button
                  className="btn bg-blue-500 text-white py-2 px-4 rounded"
                  disabled
                >
                  Creating...
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn bg-blue-500 text-white py-2 px-4 rounded"
                >
                  Create
                </button>
              )}
            </div>
          </form>
        </Tab>

        {/* Extend session Tab */}
        {/* <Tab label={isMobileView ? "Extend" : "Extend session"}>
          <div className="flex space-x-2">
            <input
              type="number"
              className="input"
              placeholder="Provide session ID..."
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
            />
            <button
              className="btn bg-green-500 text-white py-2 px-4 rounded"
              onClick={() => console.log("Extend session")}
            >
              Extend session
            </button>
          </div>
        </Tab> */}

        {/* Get session Tab */}
        <Tab label={isMobileView ? "Get" : "Get session"}>
          {/* Input and Button Section */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 w-full">
            <input
              type="text"
              className="flex-grow sm:basis-4/5 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              onChange={(e) => setSessionId(e.target.value)}
              value={sessionId}
              placeholder="Provide session ID..."
              aria-label="Session ID input"
            />
            <button
              className={`w-full sm:basis-1/5 px-4 py-2 text-white font-semibold rounded-md transition ${
                !sessionId || loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              onClick={fetchSessionData}
              disabled={!sessionId || loading}
              aria-label="Fetch Session"
            >
              {loading ? "Fetching..." : "Get Session"}
            </button>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-center items-center h-52">
              <Loading message="Retrieving session..." />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center p-4 mb-6 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md">
              <BsExclamation className="w-5 h-5 mr-3 text-red-600" />
              <p className="flex-1">Error: {error}</p>
            </div>
          )}

          {/* Session Data Display */}
          {!loading && sessionData && !error && (
            <>
              {/* Toggle Buttons */}
              <div className="flex justify-start items-center gap-4 mb-4">
                <button
                  onClick={() => setViewMode("json")}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    viewMode === "json"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  aria-pressed={viewMode === "json"}
                >
                  Show JSON
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    viewMode === "table"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  aria-pressed={viewMode === "table"}
                >
                  Show Table
                </button>
              </div>

              {/* JSON View */}
              {viewMode === "json" ? (
                <div className="relative bg-gray-100 p-4 rounded-md shadow-md">
                  <h2 className="text-lg font-semibold mb-4">
                    Session in JSON
                  </h2>
                  <button
                    onClick={() => copyToClipboard(true)}
                    className="absolute top-4 right-4 flex items-center text-gray-500 hover:text-gray-700"
                    aria-label="Copy JSON data"
                  >
                    {copied ? (
                      <span className="text-green-600 text-sm font-semibold">
                        Copied!
                      </span>
                    ) : (
                      <FaCopy className="w-5 h-5" />
                    )}
                  </button>
                  <pre className="text-sm bg-gray-50 p-4 rounded-md overflow-x-auto">
                    {JSON.stringify(sessionData, null, 2)}
                  </pre>
                </div>
              ) : (
                // Table View
                <div className="overflow-x-auto">
                  <h2 className="text-lg font-semibold mb-4">
                    Session in Table
                  </h2>
                  <table className="min-w-full border border-gray-300 bg-white shadow-md rounded-md">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                          Key
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, index) => (
                        <tr
                          key={index}
                          className={`${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }`}
                        >
                          <td className="px-6 py-3 text-sm text-gray-700 border-b border-gray-200">
                            {row.key}
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-700 border-b border-gray-200">
                            {String(row.value)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </Tab>

        {/* Get all sessions Tab */}
        <Tab label={isMobileView ? "Get all" : "Get all session"}>
          <div className="text-center mb-4">
            <button
              className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
              onClick={fetchSessionsData}
            >
              Get All Sessions
            </button>
          </div>

          {data && (
            <>
              {/* Toggle View Mode */}
              <div className="flex justify-center space-x-4 mb-4">
                <button
                  onClick={() => setViewMode("json")}
                  className={`${
                    viewMode === "json"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 text-black"
                  } px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none`}
                >
                  Show JSON
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`${
                    viewMode === "table"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 text-black"
                  } px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none`}
                >
                  Show Table
                </button>
              </div>

              {/* JSON View */}
              {viewMode === "json" ? (
                <div className="relative bg-gray-100 p-4 rounded-md shadow-md">
                  <h2 className="text-lg font-semibold mb-4">
                    Session in JSON
                  </h2>
                  <button
                    onClick={() => copyToClipboard(true)}
                    className="absolute top-4 right-4 flex items-center text-gray-500 hover:text-gray-700"
                    aria-label="Copy JSON data"
                  >
                    {copied ? (
                      <span className="text-green-600 text-sm font-semibold">
                        Copied!
                      </span>
                    ) : (
                      <FaCopy className="w-5 h-5" />
                    )}
                  </button>
                  <pre className="text-sm bg-gray-50 p-4 rounded-md overflow-x-auto">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              ) : (
                // Table View
                <>
                  <h2 className="text-xl font-semibold mt-6">
                    Session in Table
                  </h2>
                  {data &&
                    Array.isArray(data) &&
                    data.map((singleData: DataType, index: number) => (
                      <div key={index} className="overflow-x-auto mt-4">
                        <table className="min-w-full border-collapse">
                          <thead>
                            <tr>
                              <th className="border px-4 py-2 text-left">
                                Key
                              </th>
                              <th className="border px-4 py-2 text-left">
                                Value
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {jsonToTableData(singleData).map(
                              (row, rowIndex) => (
                                <tr key={rowIndex}>
                                  <td className="border px-4 py-2">
                                    {row.key}
                                  </td>
                                  <td className="border px-4 py-2">
                                    {String(row.value)}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    ))}
                </>
              )}
            </>
          )}

          {error && (
            <div className="flex items-center p-4 mb-6 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md">
              <BsExclamation className="w-5 h-5 mr-3 text-red-600" />
              <p className="flex-1">Error: {error}</p>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-center items-center h-52">
              <Loading message="Retrieving all sessions...." />
            </div>
          )}
        </Tab>

        {/* Delete session Tab */}
        <Tab label={isMobileView ? "Delete" : "Delete session"}>
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 w-full">
            <input
              type="text"
              className="flex-grow sm:basis-4/5 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              onChange={(e) => setSessionId(e.target.value)}
              value={sessionId}
              placeholder="Provide session ID..."
              aria-label="Session ID input"
            />
            <button
              className={`w-full sm:basis-1/5 px-4 py-2 text-white font-semibold rounded-md transition ${
                !sessionId || loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
              onClick={() => deleteSessionData()}
              disabled={!sessionId || loading}
              aria-label="Fetch Session"
            >
              {loading ? "Deleting..." : "Delete session"}
            </button>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-center items-center h-52">
              <Loading message="Deleting session...." />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center p-4 mb-6 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md">
              <BsExclamation className="w-5 h-5 mr-3 text-red-600" />
              <p className="flex-1">Error: {error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center p-4 mb-6 text-sm text-green-700 bg-green-100 border border-green-200 rounded-md">
              <BsExclamation className="w-5 h-5 mr-3 text-green-600" />
              <p className="flex-1">{success}</p>
            </div>
          )}
        </Tab>
      </Tabs>
    </div>
  );
};

export default QoDPage;
