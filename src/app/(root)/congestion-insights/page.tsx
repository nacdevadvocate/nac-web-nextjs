"use client";
import Loading from "@/components/Loading";
import Tab from "@/components/Tab";
import Tabs from "@/components/Tabs";
import { useMessage } from "@/contexts/message";
import { CREDENTIALS } from "@/data/credential";
import { useLocalStorageBase64 } from "@/hooks/useLocalStorage64";
import { useSessionStorage } from "@/hooks/useSessionStorage";
import { jsonToTableData } from "@/utils/copy";
import { BiCheckCircle } from "react-icons/bi";
import { BsExclamationCircle } from "react-icons/bs";
import { isAxiosError } from "@/utils/isAxiosError";
import {
  Device,
  IPv4Address,
  JsonObject,
  JsonValue,
  QueryData,
  SessData,
} from "@/utils/types";

import axios from "axios";
import { useEffect, useState } from "react";
import { FaCopy } from "react-icons/fa";

interface FormValues {
  phoneNumber?: string;
  networkAccessIdentifier?: string;
  identifier?: string;
  devicePublicIp?: string;
  devicePrivateIp?: string;
  devicePublicPort?: number;
  deviceIpv6?: string;
  subscriptionExpireTime?: string;
  notificationUrl: string;
  notificationAuthToken?: string;
}

interface SubscriptionData {
  subscriptionId: string;
  [key: string]: string | number | boolean | undefined; // Add specific fields here as needed
}

interface DataType {
  [key: string]: JsonValue;
}

const CongestionInsights = () => {
  const [devices] = useLocalStorageBase64<Device[]>("devices", []);
  const [selectedToken] = useLocalStorageBase64<string | null>(
    "selectedToken",
    null
  );
  const [, setValue] = useSessionStorage("tab");
  const [identifierType, setIdentifierType] = useState<"phone" | "nai">(
    "phone"
  );
  const { error, success, setError, setSuccess, clearMessages } = useMessage();
  const filteredDevices = devices.filter(
    (device) => device.category === identifierType
  );

  console.log({ error });

  const [formValues, setFormValues] = useState<FormValues>({
    phoneNumber: "",
    networkAccessIdentifier: "",
    identifier: "",
    devicePublicIp: "",
    devicePrivateIp: "",
    devicePublicPort: 0,
    deviceIpv6: "",
    subscriptionExpireTime: "",
    notificationUrl: "",
    notificationAuthToken: "",
  });

  const [subscriptionId, setSubscriptionId] = useState<string>("");
  const [viewMode, setViewMode] = useState<"json" | "table">("json");
  const [loading, setLoading] = useState<boolean>(false);
  const [subscriptionData, setSubscriptionData] =
    useState<SubscriptionData | null>(null);
  const [data, setData] = useState<DataType | null>(null);
  const [showResponse, setShowResponse] = useState(false);
  const [showQueryResponse, setShowQueryResponse] = useState<Record<
    string,
    unknown
  > | null>(null);
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

  useEffect(() => {
    // Set the initial value of subscriptionExpireTime if needed
    setFormValues((prevValues) => ({
      ...prevValues, // Retain other values
      subscriptionExpireTime: getMinDateTime(), // Initially set to 2 mins ahead
    }));
  }, []);

  // Calculate minimum time: current time + 2 minutes
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 2); // Add 2 minutes
    return now.toISOString().slice(0, 16); // Get the string in format: YYYY-MM-DDTHH:mm
  };

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
    notificationUrl: "",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return console.log("Error happened");

    // Constructing sessData with only defined properties
    const sessData: SessData = {};

    console.log({ formValues });

    // Device Information
    if (
      formValues.identifier ||
      formValues.devicePublicIp ||
      formValues.deviceIpv6
    ) {
      // Initialize device if it doesn't exist
      sessData.device = {};

      console.log({ identifierType, formValues });

      if (formValues.identifier && identifierType === "phone") {
        sessData.device.phoneNumber = formValues.identifier;
      }
      if (formValues.identifier && identifierType === "nai") {
        sessData.device.networkAccessIdentifier = formValues.identifier;
      }

      const ipv4Address: Partial<IPv4Address> = {};
      if (formValues.devicePublicIp) {
        ipv4Address.publicAddress = formValues.devicePublicIp;
      }
      if (formValues.devicePrivateIp) {
        ipv4Address.privateAddress = formValues.devicePrivateIp;
      }
      if (formValues.devicePublicPort) {
        ipv4Address.publicPort = formValues.devicePublicPort;
      }

      if (Object.keys(ipv4Address).length >= 2) {
        sessData.device.ipv4Address = ipv4Address;
      }

      if (formValues.deviceIpv6) {
        sessData.device.ipv6Address = formValues.deviceIpv6;
      }
    }

    // Webhook Information
    if (formValues.notificationUrl || formValues.notificationAuthToken) {
      sessData.webhook = {};
      if (formValues.notificationUrl) {
        sessData.webhook.notificationUrl = formValues.notificationUrl;
      }
      if (formValues.notificationAuthToken) {
        sessData.webhook.notificationAuthToken =
          formValues.notificationAuthToken;
      }
    }

    // Duration
    if (formValues.subscriptionExpireTime) {
      // Ensure that the expire time is in ISO format with time zone (UTC)
      const expireTime = new Date(formValues.subscriptionExpireTime);
      sessData.subscriptionExpireTime = expireTime.toISOString(); // This will include the "Z" at the end for UTC
    }

    console.log("Final sessData:", sessData);

    // API Request
    setLoading(true);
    clearMessages();

    try {
      const response = await axios.post(
        `${CREDENTIALS.CONGESTION_INSIGHT_URL}/subscriptions`, // Replace with actual endpoint
        sessData,
        {
          headers: {
            "content-type": "application/json",
            "X-RapidAPI-Key": selectedToken,
            "X-RapidAPI-Host": CREDENTIALS.CONGESTION_INSIGHT_HOST,
          },
        }
      );

      if (response.status === 201) {
        setSubscriptionData(response.data);
        setFormValues(initialFormValues); // Reset form
        setSubscriptionId(response.data.subscriptionId);
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

  const fetchSubscriptionData = async () => {
    setLoading(true);
    clearMessages();
    try {
      const response = await axios.get(
        `${CREDENTIALS.CONGESTION_INSIGHT_URL}/subscriptions/${subscriptionId}`, // Replace with actual endpoint
        {
          headers: {
            "content-type": "application/json",
            "X-RapidAPI-Key": selectedToken,
            "X-RapidAPI-Host": CREDENTIALS.CONGESTION_INSIGHT_HOST,
          },
        }
      );

      if (response.status === 200) {
        setSubscriptionData(response.data);
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
        `${CREDENTIALS.CONGESTION_INSIGHT_URL}/subscriptions`, // Replace with actual endpoint
        {
          headers: {
            "content-type": "application/json",
            "X-RapidAPI-Key": selectedToken,
            "X-RapidAPI-Host": CREDENTIALS.CONGESTION_INSIGHT_HOST,
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
        `${CREDENTIALS.CONGESTION_INSIGHT_URL}/subscriptions/${subscriptionId}`, // Replace with actual endpoint
        {
          headers: {
            "content-type": "application/json",
            "X-RapidAPI-Key": selectedToken,
            "X-RapidAPI-Host": CREDENTIALS.CONGESTION_INSIGHT_HOST,
          },
        }
      );

      if (response.status === 204) {
        setData(null);
        setSuccess("Subscription deleted successfully!", 5000);
        setSubscriptionId("");
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

  const requestQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowResponse(false);

    if (!validateForm()) return console.log("Error happened");
    setLoading(true);

    console.log("Form submitted:", formValues);

    // Constructing sessData with only defined properties
    const sessData: QueryData = {};

    // Device Information
    if (
      formValues.identifier ||
      formValues.devicePublicIp ||
      formValues.deviceIpv6
    ) {
      // Initialize device if it doesn't exist
      if (!sessData.device) {
        sessData.device = {};
      }

      if (formValues.identifier && identifierType === "phone") {
        sessData.device.phoneNumber = formValues.identifier;
      }
      if (formValues.identifier && identifierType === "nai") {
        sessData.device.networkAccessIdentifier = formValues.identifier;
      }
    }

    console.log("Final sessData:", sessData);

    // API Request
    clearMessages();

    try {
      const response = await axios.post(
        `${CREDENTIALS.CONGESTION_INSIGHT_URL}/query`, // Replace with actual endpoint
        sessData,
        {
          headers: {
            "content-type": "application/json",
            "X-RapidAPI-Key": selectedToken,
            "X-RapidAPI-Host": CREDENTIALS.CONGESTION_INSIGHT_HOST,
          },
        }
      );

      if (response.status === 200) {
        setShowQueryResponse(response.data);
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
      setShowResponse(true);
      setLoading(false);
    }
  };

  // Function to copy JSON to clipboard
  const [copied, setCopied] = useState(false);

  // Function to copy JSON to clipboard
  const copyToClipboard = async (single: boolean) => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(single ? subscriptionData : data, null, 2)
      );
      setCopied(true); // Set copied to true
      setTimeout(() => setCopied(false), 5000); // Reset after 5 seconds
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const tableData = jsonToTableData(subscriptionData as JsonObject);

  return (
    <div className="container font-work-sans">
      <h1 className="text-3xl font-bold text-center">Congestion Insights</h1>

      <Tabs>
        {/* Create Subscriptions Tab */}
        <Tab label={isMobileView ? "Create" : "Create subscription"}>
          {/* Error Message */}
          {Object.keys(errors).length > 0 && (
            <div className="p-4 mb-6 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md">
              <div className="flex items-start">
                <BsExclamationCircle className="w-5 h-5 mr-3 text-red-600" />
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
              <BsExclamationCircle className="w-5 h-5 mr-3 text-red-600" />
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

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Expiry Date
                </label>
                <input
                  type="datetime-local"
                  name="subscriptionExpireTime"
                  value={formValues.subscriptionExpireTime}
                  onChange={handleInputChange}
                  className="input border border-gray-300 rounded-md w-full p-2"
                  placeholder="YYYY-MM-DDTHH:mm"
                  min={getMinDateTime()} // Set min attribute dynamically to 2 mins ahead
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
              {/* <div>
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
              </div> */}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto" // Added w-full for mobile
                disabled={loading} // Disable button when loading
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </Tab>

        {/* Get Subscription Tab */}
        <Tab label={isMobileView ? "Get" : "Get subscription"}>
          {/* Input and Button Section */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 w-full">
            <input
              type="text"
              className="flex-grow sm:basis-4/5 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              onChange={(e) => setSubscriptionId(e.target.value)}
              value={subscriptionId}
              placeholder="Provide subscription ID..."
              aria-label="Subscription ID input"
            />
            <button
              className={`w-full sm:basis-1/5 px-4 py-2 text-white font-semibold rounded-md transition ${
                !subscriptionId || loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              onClick={fetchSubscriptionData}
              disabled={!subscriptionId || loading}
              aria-label="Fetch Subscription"
            >
              {loading ? "Fetching..." : "Get Subscription"}
            </button>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-center items-center h-52">
              <Loading message="Retrieving subscription..." />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center p-4 mb-6 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md">
              <BsExclamationCircle className="w-5 h-5 mr-3 text-red-600" />
              <p className="flex-1">Error: {error}</p>
            </div>
          )}

          {/* Subscription Data Display */}
          {!loading && subscriptionData && !error && (
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
                    Subscription in JSON
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
                    {JSON.stringify(subscriptionData, null, 2)}
                  </pre>
                </div>
              ) : (
                // Table View
                <div className="overflow-x-auto">
                  <h2 className="text-lg font-semibold mb-4">
                    Subscription in Table
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

        {/* Get all Subscriptions Tab */}
        <Tab label={isMobileView ? "Get all" : "Get subscriptions"}>
          <div className="text-center mb-4">
            <button
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
              onClick={fetchSessionsData}
            >
              Get All Subscriptions
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
                    Subscription in JSON
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
                    Subscription in Table
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
              <BsExclamationCircle className="w-5 h-5 mr-3 text-red-600" />
              <p className="flex-1">Error: {error}</p>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-center items-center h-52">
              <Loading message="Retrieving all subscriptions...." />
            </div>
          )}
        </Tab>

        {/* Delete Subscriptions Tab */}
        <Tab label={isMobileView ? "Delete" : "Delete subscription"}>
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 w-full">
            <input
              type="text"
              className="flex-grow sm:basis-4/5 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              onChange={(e) => setSubscriptionId(e.target.value)}
              value={subscriptionId}
              placeholder="Provide subscription ID..."
              aria-label="Subscription ID input"
            />
            <button
              className={`w-full sm:basis-1/5 px-4 py-2 text-white font-semibold rounded-md transition ${
                !subscriptionId || loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
              onClick={() => deleteSessionData()}
              disabled={!subscriptionId || loading}
              aria-label="Fetch Subscription"
            >
              {loading ? "Deleting..." : "Delete subscription"}
            </button>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-center items-center h-52">
              <Loading message="Deleting subscription...." />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center p-4 mb-6 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md">
              <BsExclamationCircle className="w-5 h-5 mr-3 text-red-600" />
              <p className="flex-1">Error: {error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center p-4 mb-6 text-sm text-green-700 bg-green-100 border border-green-200 rounded-md">
              <BiCheckCircle className="w-5 h-5 mr-3 text-green-600" />
              <p className="flex-1">{success}</p>
            </div>
          )}
        </Tab>

        {/* Query Tab */}
        <Tab label={isMobileView ? "Query" : "Query"}>
          {/* Error Message */}
          {Object.keys(errors).length > 0 && (
            <div className="p-4 mb-6 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md">
              <div className="flex items-start">
                <BsExclamationCircle className="w-5 h-5 mr-3 text-red-600" />
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
          <form
            onSubmit={requestQuery}
            className="space-y-6 bg-white p-6 rounded-md"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="identifierTypeConnectivity"
                  className="block text-sm font-semibold mb-1"
                >
                  Select Identifier Type
                </label>
                <select
                  id="identifierTypeConnectivity"
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
                  htmlFor="identifierConnectivity"
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
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto"
                disabled={loading} // Disable button when loading
              >
                {loading ? "Checking..." : "Query"}
              </button>
            </div>
          </form>
          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-center items-center h-52">
              <Loading message="Checking...." />
            </div>
          )}

          {/* Animated Response Section */}
          {showResponse && (
            <div
              className={`mt-2 p-2 rounded-lg transition-all duration-500 ease-in-out transform ${
                showResponse ? "opacity-100 scale-100" : "opacity-0 scale-95"
              } bg-white`}
            >
              {error ? (
                <p className="text-red-600 font-semibold text-center text-lg">
                  {error}
                </p>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-gray-800 text-center mb-4">
                    Raw Response:
                  </h2>
                  <pre className="bg-gray-100 text-gray-800 p-4 rounded-md overflow-x-auto">
                    {JSON.stringify(showQueryResponse, null, 2)}
                  </pre>
                </>
              )}
            </div>
          )}
        </Tab>
      </Tabs>
    </div>
  );
};

export default CongestionInsights;
