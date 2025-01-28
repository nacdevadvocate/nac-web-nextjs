"use client";
import { useMessage } from "@/contexts/message";
import { useSessionStorage } from "@/hooks/useSessionStorage";
import React from "react";

interface TabProps {
  label: string;
  children: React.ReactNode;
}

interface TabsProps {
  children: React.ReactElement<TabProps>[];
}

const Tabs: React.FC<TabsProps> = ({ children }) => {
  const [value, setValue] = useSessionStorage("tab", 0);
  const { clearMessages } = useMessage();

  const handleTabClick = (index: number) => {
    clearMessages();
    setValue(index);
  };

  return (
    <>
      {/* Tab Titles */}
      <div className="flex border-b border-gray-300 bg-white mt-6">
        {React.Children.map(children, (child, index) => (
          <button
            key={index}
            className={`flex-1 text-center py-2 font-medium text-sm transition-colors ${
              value === index
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-black border-b-2 border-transparent hover:text-blue-500 hover:border-blue-500"
            }`}
            onClick={() => handleTabClick(index)}
          >
            {child.props.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4 bg-white rounded-lg shadow mt-4">
        {React.Children.map(children, (child, index) =>
          value === index ? child.props.children : null
        )}
      </div>
    </>
  );
};

export default Tabs;
