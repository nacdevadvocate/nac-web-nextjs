"use client";
import { FaFacebook, FaLinkedin, FaYoutube, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-4">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto">
        <div className="text-lg font-bold">NaC</div>
        <div className="flex space-x-4">
          <a href="https://linkedin.com" target="_blank" rel="noreferrer">
            <FaLinkedin size={24} />
          </a>
          <a href="https://facebook.com" target="_blank" rel="noreferrer">
            <FaFacebook size={24} />
          </a>
          <a href="https://youtube.com" target="_blank" rel="noreferrer">
            <FaYoutube size={24} />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer">
            <FaInstagram size={24} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
