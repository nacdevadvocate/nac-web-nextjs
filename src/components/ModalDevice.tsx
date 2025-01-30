import { categories, initialDevices } from "@/data/data";
import { useLocalStorageBase64 } from "@/hooks/useLocalStorage64";
import { DeviceEntry } from "@/utils/types";
import { useState } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ModalDevice: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("phone"); // Default category
  const [devices, setDevices] = useLocalStorageBase64<DeviceEntry[]>(
    "devices",
    initialDevices
  );

  const handleAddDevice = () => {
    if (!category || !name.trim() || !value.trim()) {
      alert("All fields are required.");
      return;
    }

    // Automatically add "+" for phone numbers if missing
    let formattedValue = value.trim();
    if (category === "phone" && !formattedValue.startsWith("+")) {
      console.log("efeew");
      formattedValue = `+${formattedValue}`;
    }

    // Check for duplicates
    const isDuplicate = devices.some(
      (device) => device.category === category && device.value === value
    );
    if (isDuplicate) {
      alert("This device already exists in the list.");
      return;
    }

    const newDevice: DeviceEntry = {
      category,
      name,
      value: formattedValue,
      isInitial: false,
    };
    setDevices([...devices, newDevice]);

    // Reset form
    setCategory("");
    setName("");
    setValue("");
  };

  console.log({ devices });

  // const handleRemoveDevice = (index: number) => {
  //   const newDevices = devices.filter((_, i) => i !== index);
  //   console.log({ newDevices });
  //   setDevices(newDevices);
  // };

  // const filteredDevices = devices.filter(
  //   (device) => device.category === selectedCategory
  // );

  const filteredDevices = devices
    .filter((device) => device.category === selectedCategory)
    .sort((a, b) => {
      // Sort: non-initial devices first, then initial devices
      if (!a.isInitial && b.isInitial) return -1; // Non-initial comes first
      if (a.isInitial && !b.isInitial) return 1; // Initial comes last
      return 0; // Keep relative order for devices in the same group
    });

  const handleRemoveDevice = (deviceToRemove: DeviceEntry) => {
    const newDevices = devices.filter(
      (device) =>
        device.category !== deviceToRemove.category ||
        device.value !== deviceToRemove.value
    );
    setDevices(newDevices);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-lg p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        {/* Add Device Section */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Add Device
        </h2>
        <div className="mb-6">
          {/* Category Selector */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-100 text-gray-800"
          >
            <option value="" disabled>
              Select Category
            </option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Dynamic Input Fields */}
          {category && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-100 text-gray-800"
              />
              <input
                type="text"
                placeholder={`Enter ${
                  categories.find((cat) => cat.value === category)?.label
                }`}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-100 text-gray-800"
              />
              <button
                onClick={handleAddDevice}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
              >
                Add Device
              </button>
            </div>
          )}
        </div>

        {/* Devices Section */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Devices</h2>
        <div>
          {/* Category Selector for Devices */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-100 text-gray-800"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          <h3 className="text-lg font-medium text-gray-700 mb-2">
            {categories.find((cat) => cat.value === selectedCategory)?.label}{" "}
            Devices
          </h3>
          <div className="space-y-6 overflow-y-auto max-h-60 border rounded-lg p-4">
            {filteredDevices.length > 0 ? (
              filteredDevices.map((device, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center px-4 py-3 border rounded-lg bg-gray-50 hover:bg-gray-100"
                >
                  <div>
                    <p className="font-medium text-gray-800">{device.name}</p>
                    <p className="text-gray-600 text-sm">{device.value}</p>
                  </div>
                  {!device.isInitial && (
                    <button
                      onClick={() => handleRemoveDevice(device)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">
                No devices in this category.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalDevice;
