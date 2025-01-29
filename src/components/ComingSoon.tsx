"use client";
import React from "react";

const ComingSoon: React.FC = () => {
  return (
    <div className="min-h-full flex flex-col justify-center items-center text-gray-800">
      {/* Animated Title */}
      <div className="text-center mb-8">
        <h1
          className="text-5xl md:text-7xl font-extrabold mb-4 text-gray-800"
          style={{
            animation: "fadeIn 2s ease-in-out infinite",
          }}
        >
          We are Almost Ready!
        </h1>
        <p className="text-lg md:text-xl text-gray-600">
          Something exciting is coming your way. Stay tuned for updates!
        </p>
      </div>

      {/* Notify Me Button */}
      {/* <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-md transition-transform transform hover:scale-105"
        onClick={() => alert("Thank you! We’ll notify you when we launch.")}
      >
        Notify Me
      </button> */}

      {/* Add Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          0% {
            opacity: 0.5;
            transform: translateY(10px);
          }
          50% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0.5;
            transform: translateY(10px);
          }
        }
      `}</style>
    </div>
  );
};

export default ComingSoon;
