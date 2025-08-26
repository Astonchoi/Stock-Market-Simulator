import React from "react";
import StockMarketSimulator from "./components/StockMarketSimulator";
import "./App.css";

/**
 * Main App Component
 * Renders the Stock Market Simulator with a clean, modern layout
 */
function App() {
  return (
    <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center font-sans p-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header Section */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Stock Market Simulator
          </h1>
          <p className="text-lg text-gray-400">
            Click the buttons to see the price action unfold in real-time.
          </p>
        </header>

        {/* Main Stock Market Simulator Component */}
        <StockMarketSimulator />
      </div>

      {/* Footer */}
      <footer className="text-center text-gray-500 mt-8 text-sm">
        <p>Built with React & D3.js</p>
      </footer>
    </div>
  );
}

export default App;
