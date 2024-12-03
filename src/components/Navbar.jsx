"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar({ logo, menuItems, ctaButton, socialMediaLinks }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-gray-800 text-white">
      <nav className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Left Section: Logo and Menu Items */}
        <div className="flex items-center space-x-6">
          {/* Logo with Link to Home */}
          {logo ? (
            <Link href="/" passHref>
              <img src={logo.src} alt={logo.alt} className="h-10 w-auto" />
            </Link>
          ) : (
            <Link href="/" className="text-lg font-bold">
              LOGO
            </Link>
          )}

          {/* Menu Items */}
          <ul className="hidden sm:flex space-x-6">
            {menuItems &&
              menuItems
                .filter((item) => item.href) // Filter out invalid items
                .map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className="text-white hover:text-blue-400 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
          </ul>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="sm:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>

        {/* Mobile Menu Items */}
        {isMenuOpen && (
          <ul className="absolute top-16 left-0 w-full bg-gray-800 sm:hidden space-y-2 p-4">
            {menuItems &&
              menuItems
                .filter((item) => item.href) // Filter out invalid items
                .map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className="block text-white hover:text-blue-400 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
          </ul>
        )}

        {/* Right Section: CTA Button and Social Media Links */}
        <div className="flex items-center space-x-4">
          {/* Call-to-Action Button */}
          {ctaButton?.href && (
            <Link
              href={ctaButton.href}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              {ctaButton.label}
            </Link>
          )}

          {/* Social Media Links */}
          {Array.isArray(socialMediaLinks) && socialMediaLinks.length > 0 ? (
            <div className="flex space-x-4">
              {socialMediaLinks.map((link, index) => (
                link.href ? ( // Ensure each link has a valid href
                  <a
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-75 transition-opacity"
                  >
                    <img
                      src={link.icon?.src || '/default-icon.png'}
                      alt={link.icon?.alt || 'Social media'}
                      className="h-6 w-6"
                    />
                  </a>
                ) : null
              ))}
            </div>
          ) : (
            <span>No social media links</span>
          )}
        </div>
      </nav>
    </header>
  );
}