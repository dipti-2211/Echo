import React from "react";

const Header = ({ userName, theme, onThemeChange }) => {
  return (
    <header className="bg-deep-grey-light border-b border-grey-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-white">
            Hello,{" "}
            <span className="bg-gradient-to-r from-white to-grey-text bg-clip-text text-transparent">
              {userName}
            </span>
          </h1>
          <p className="text-grey-text text-sm mt-1">
            How can I assist you today?
          </p>
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-deep-grey-dark px-4 py-2 rounded-lg border border-grey-border">
            <span className="text-sm text-grey-text font-medium">Theme:</span>
            <button
              onClick={() => onThemeChange(theme === "grey" ? "oled" : "grey")}
              className="relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
              style={{
                backgroundColor: theme === "grey" ? "#404040" : "#000000",
              }}
            >
              <span
                className={`inline-block w-4 h-4 transform rounded-full bg-white transition-transform ${
                  theme === "oled" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm text-white font-medium">
              {theme === "grey" ? "Grey/Black" : "OLED Black"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
