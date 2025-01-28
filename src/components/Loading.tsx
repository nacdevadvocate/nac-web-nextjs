import React from "react";

interface LoadingProps {
  message: string;
}

const Loading: React.FC<LoadingProps> = ({ message }) => {
  return (
    <div className="relative flex justify-center items-center w-16 h-16 rounded-full">
      {/* Outer Circle */}
      <svg className="absolute w-22 h-22 animate-spin-slow" viewBox="0 0 86 86">
        <circle
          className="fill-none stroke-rose-400 stroke-[6px] stroke-dasharray-[62.75,188.25] animate-circle-outer"
          cx="43"
          cy="43"
          r="40"
        ></circle>
        <circle
          className="fill-none stroke-violet-600 stroke-[6px] stroke-dasharray-[62.75,188.25] animate-circle-outer-inner"
          cx="43"
          cy="43"
          r="40"
        ></circle>
      </svg>

      {/* Middle Circle */}
      <svg className="absolute w-15 h-15 animate-spin-slow" viewBox="0 0 60 60">
        <circle
          className="fill-none stroke-gray-300 stroke-[6px] stroke-dasharray-[42.5,127.5] animate-circle-middle"
          cx="30"
          cy="30"
          r="27"
        ></circle>
        <circle
          className="fill-none stroke-violet-600 stroke-[6px] stroke-dasharray-[42.5,127.5] animate-circle-middle-inner"
          cx="30"
          cy="30"
          r="27"
        ></circle>
      </svg>

      {/* Inner Circle */}
      <svg className="absolute w-9 h-9 animate-spin-slow" viewBox="0 0 34 34">
        <circle
          className="fill-none stroke-gray-300 stroke-[6px] stroke-dasharray-[22,66] animate-circle-inner"
          cx="17"
          cy="17"
          r="14"
        ></circle>
        <circle
          className="fill-none stroke-violet-600 stroke-[6px] stroke-dasharray-[22,66] animate-circle-inner-inner"
          cx="17"
          cy="17"
          r="14"
        ></circle>
      </svg>

      {/* Loading Text */}
      <div className="absolute bottom-[-62px] text-center font-medium text-sm text-gray-700">
        <span className="block text-violet-600">{message}</span>
      </div>
    </div>
  );
};

export default Loading;
