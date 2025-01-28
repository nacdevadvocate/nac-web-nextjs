"use client";
import React from "react";
import Link from "next/link";
import {
  FaLocationArrow,
  FaShieldAlt,
  FaEye,
  FaSimCard,
  FaMobileAlt,
  FaCheckCircle,
  FaTrafficLight,
  FaMapMarkedAlt,
} from "react-icons/fa";

const Home: React.FC = () => {
  const routes = [
    {
      path: "/location-retrieval",
      icon: <FaLocationArrow className="text-green-500 w-8 h-8 mb-2" />,
      name: "Location Retrieval",
      color: "bg-green-100 hover:bg-green-200",
    },
    {
      path: "/location-verification",
      icon: <FaShieldAlt className="text-yellow-500 w-8 h-8 mb-2" />,
      name: "Location Verification",
      color: "bg-yellow-100 hover:bg-yellow-200",
    },
    {
      path: "/qod",
      icon: <FaEye className="text-purple-500 w-8 h-8 mb-2" />,
      name: "QoD",
      color: "bg-purple-100 hover:bg-purple-200",
    },
    {
      path: "/sim-swap",
      icon: <FaSimCard className="text-red-500 w-8 h-8 mb-2" />,
      name: "Sim Swap",
      color: "bg-red-100 hover:bg-red-200",
    },
    {
      path: "/device-status",
      icon: <FaMobileAlt className="text-pink-500 w-8 h-8 mb-2" />,
      name: "Device Status",
      color: "bg-pink-100 hover:bg-pink-200",
    },
    {
      path: "/number-verification",
      icon: <FaCheckCircle className="text-indigo-500 w-8 h-8 mb-2" />,
      name: "Number Verification",
      color: "bg-indigo-100 hover:bg-indigo-200",
    },
    {
      path: "/congestion-insights",
      icon: <FaTrafficLight className="text-orange-500 w-8 h-8 mb-2" />,
      name: "Congestion Insights",
      color: "bg-orange-100 hover:bg-orange-200",
    },
    {
      path: "/geofencing",
      icon: <FaMapMarkedAlt className="text-teal-500 w-8 h-8 mb-2" />,
      name: "Geofencing",
      color: "bg-teal-100 hover:bg-teal-200",
    },
  ];

  return (
    <div className="bg-white text-gray-800 flex flex-col justify-between font-work-sans">
      {/* Top Section */}
      <div className="flex justify-center items-center flex-col py-20">
        <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">
          Welcome to Nokia&apos;s Network as Code
        </h2>
        <p className="text-gray-600 text-center max-w-2xl">
          Nokia&apos;s Network as Code, a platform empowering you to develop
          applications that seamlessly integrate with the network and unlock the
          potential to create something new, amazing and powerful.
        </p>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-6 pb-20">
        {routes.map((route) => (
          <Link href={route.path} key={route.name}>
            <div
              className={`group ${route.color} p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 cursor-pointer`}
            >
              <div className="flex justify-center">{route.icon}</div>
              <h3 className="text-xl font-semibold text-center mt-4 text-gray-800 group-hover:text-gray-900 whitespace-nowrap">
                {route.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;
