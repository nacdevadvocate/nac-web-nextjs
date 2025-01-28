"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FaBars,
  FaTimes,
  FaAngleDown,
  FaHome,
  FaLocationArrow,
  FaShieldAlt,
  FaEye,
  FaSimCard,
  FaMobileAlt,
  FaCheckCircle,
  FaBell,
  FaTrafficLight,
  FaMapMarkedAlt,
} from "react-icons/fa";
import TokenModal from "./TokenModal";
import ModalDevice from "./ModalDevice";
import { useLocalStorageBase64 } from "@/hooks/useLocalStorage64";

interface Token {
  name: string;
  token: string;
}

const Navbar: React.FC = () => {
  const [tokens] = useLocalStorageBase64<Token[]>("tokens", []);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isModalOpenDevices, setModalOpenDevices] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [notificationCount] = useState(0); // Example notification count
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const apiButtonRef = useRef<HTMLSpanElement | null>(null); // Reference for the API button

  // Close the dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Ensure dropdown is closed only when clicking outside of the dropdown and the API button
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        apiButtonRef.current &&
        !apiButtonRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [tokenText, setTokenText] = useState("Add Token");

  useEffect(() => {
    console.log({ tokens });
    if (tokens.length > 0) {
      setTokenText("Update Token");
    }
  }, [tokens]);

  // Handle API Dropdown toggle and closing it when a link is clicked
  const handleDropdownToggle = () => {
    setDropdownOpen((prev) => !prev); // Toggle dropdown open/close
  };

  const handleLinkClick = () => {
    setDropdownOpen(false); // Close dropdown when any link is clicked
  };

  return (
    <nav className="bg-gray-800 text-white font-work-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <span className="text-2xl font-bold flex items-center cursor-pointer">
                {/* <FaShieldAlt className="w-6 h-6 mr-2 text-teal-400" /> */}
                NaC APIs
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/">
              <span className="flex items-center hover:text-teal-400 cursor-pointer">
                <FaHome className="mr-2" />
                Home
              </span>
            </Link>

            {/* API Dropdown */}
            <div className="relative">
              <span
                ref={apiButtonRef} // Assign the reference to the "API" button
                className="flex items-center hover:text-teal-400 cursor-pointer"
                onClick={handleDropdownToggle} // Toggle the dropdown on click
              >
                APIs
                <FaAngleDown className="ml-2" />
              </span>
              {isDropdownOpen && (
                <div
                  ref={dropdownRef}
                  className="absolute left-0 mt-4 bg-gray-700 w-56 rounded-md shadow-lg z-10"
                >
                  <ul className="flex flex-col">
                    <li>
                      <Link
                        href="/location-retrieval"
                        onClick={handleLinkClick}
                      >
                        <span className="flex items-center px-4 py-2 hover:bg-gray-600 cursor-pointer">
                          <FaLocationArrow className="w-5 h-5 mr-3" />
                          Location Retrieval
                        </span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/location-verification"
                        onClick={handleLinkClick}
                      >
                        <span className="flex items-center px-4 py-2 hover:bg-gray-600 cursor-pointer">
                          <FaShieldAlt className="w-5 h-5 mr-3" />
                          Location Verification
                        </span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/qod" onClick={handleLinkClick}>
                        <span className="flex items-center px-4 py-2 hover:bg-gray-600 cursor-pointer">
                          <FaEye className="w-5 h-5 mr-3" />
                          QoD
                        </span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/sim-swap" onClick={handleLinkClick}>
                        <span className="flex items-center px-4 py-2 hover:bg-gray-600 cursor-pointer">
                          <FaSimCard className="w-5 h-5 mr-3" />
                          Sim Swap
                        </span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/device-status" onClick={handleLinkClick}>
                        <span className="flex items-center px-4 py-2 hover:bg-gray-600 cursor-pointer">
                          <FaMobileAlt className="w-5 h-5 mr-3" />
                          Device Status
                        </span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/number-verification"
                        onClick={handleLinkClick}
                      >
                        <span className="flex items-center px-4 py-2 hover:bg-gray-600 cursor-pointer">
                          <FaCheckCircle className="w-5 h-5 mr-3" />
                          Number Verification
                        </span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/congestion-insights"
                        onClick={handleLinkClick}
                      >
                        <span className="flex items-center px-4 py-2 hover:bg-gray-600 cursor-pointer">
                          <FaTrafficLight className="w-5 h-5 mr-3" />
                          Congestion Insights
                        </span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/geofencing" onClick={handleLinkClick}>
                        <span className="flex items-center px-4 py-2 hover:bg-gray-600 cursor-pointer">
                          <FaMapMarkedAlt className="w-5 h-5 mr-3" />
                          Geofencing
                        </span>
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Notification Icon with Badge */}
            <div className="relative">
              <FaBell className="w-6 h-6 text-white cursor-pointer" />
              {notificationCount > 0 && (
                <span className="absolute bottom-3 left-3 bg-red-600 text-white text-xs rounded-full px-2 py-1 min-w-[18px] h-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </div>

            {/* Add Token Button */}
            <button
              onClick={() => setModalOpenDevices(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
            >
              Devices
            </button>

            {/* Add Token Button */}
            <button
              onClick={() => setModalOpen(true)}
              className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded"
            >
              {tokenText}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Notification Icon with Badge for Mobile */}
            <div className="relative">
              <FaBell className="w-6 h-6 text-white cursor-pointer" />
              {notificationCount > 0 && (
                <span className="absolute bottom-3 left-3 bg-red-600 text-white text-xs rounded-full px-2 py-1 min-w-[18px] h-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="w-6 h-6 text-white" />
              ) : (
                <FaBars className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-700 text-white">
          <ul className="space-y-4 p-4">
            <li>
              <Link href="/">
                <span className="flex items-center hover:text-teal-400 cursor-pointer">
                  <FaHome className="mr-3" />
                  Home
                </span>
              </Link>
            </li>
            <li>
              <div className="border-t border-gray-600 pt-2">
                <p className="font-semibold">APIs</p>
                <ul className="mt-2 space-y-2">
                  <li>
                    <Link href="/location-retrieval" onClick={handleLinkClick}>
                      <span className="flex items-center px-4 py-2 hover:bg-gray-600 cursor-pointer">
                        <FaLocationArrow className="mr-3" />
                        Location Retrieval
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/location-verification"
                      onClick={handleLinkClick}
                    >
                      <span className="flex items-center px-4 py-2 hover:bg-gray-600 cursor-pointer">
                        <FaShieldAlt className="mr-3" />
                        Location Verification
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/qod" onClick={handleLinkClick}>
                      <span className="flex items-center px-4 py-2 hover:bg-gray-600 cursor-pointer">
                        <FaEye className="mr-3" />
                        QoD
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/sim-swap" onClick={handleLinkClick}>
                      <span className="flex items-center px-4 py-2 hover:bg-gray-600 cursor-pointer">
                        <FaSimCard className="mr-3" />
                        Sim Swap
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/device-status" onClick={handleLinkClick}>
                      <span className="flex items-center px-4 py-2 hover:bg-gray-600 cursor-pointer">
                        <FaMobileAlt className="mr-3" />
                        Device Status
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/number-verification" onClick={handleLinkClick}>
                      <span className="flex items-center px-4 py-2 hover:bg-gray-600 cursor-pointer">
                        <FaCheckCircle className="mr-3" />
                        Number Verification
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/congestion-insights" onClick={handleLinkClick}>
                      <span className="flex items-center px-4 py-2 hover:bg-gray-600 cursor-pointer">
                        <FaTrafficLight className="w-5 h-5 mr-3" />
                        Congestion Insights
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/geofencing" onClick={handleLinkClick}>
                      <span className="flex items-center px-4 py-2 hover:bg-gray-600 cursor-pointer">
                        <FaMapMarkedAlt className="w-5 h-5 mr-3" />
                        Geofencing
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>
            </li>
            {/* Add Devices Button for Mobile */}
            <li>
              <button
                onClick={() => setModalOpenDevices(true)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
              >
                Devices
              </button>
            </li>
            {/* Add Token Button for Mobile */}
            <li>
              <button
                onClick={() => setModalOpen(true)}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded"
              >
                {tokenText}
              </button>
            </li>
          </ul>
        </div>
      )}

      {/* Animated Modal */}
      {isModalOpen && (
        <TokenModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)} // Close modal when the user interacts
        />
      )}

      {isModalOpenDevices && (
        <ModalDevice
          isOpen={isModalOpenDevices}
          onClose={() => setModalOpenDevices(false)} // Close modal when the user interacts
        />
      )}
    </nav>
  );
};

export default Navbar;
