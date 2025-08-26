/**
 * Stock Market Simulator Component
 * A React component that displays an interactive candlestick chart
 * with animated price movements and user controls
 */
import React, { useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import { generatePriceAction, generateInitialData } from "../utils/priceUtils";
import {
  calculateYDomain,
  initializeChart,
  setupCrosshair,
  updateAxes,
  renderCandles,
} from "../utils/chartUtils";

/**
 * Main StockMarketSimulator component
 * Renders a candlestick chart with controls to simulate price movements
 */
const StockMarketSimulator = () => {
  // State to hold the candlestick data - initialized with 60 days of historical data
  const [data, setData] = useState(() => generateInitialData(60, 100));

  // Animation state to prevent multiple simultaneous animations
  const [isAnimating, setIsAnimating] = useState(false);

  // Store the y-axis domain to prevent jumping during animations
  const [yDomain, setYDomain] = useState(null);

  // Refs for D3 DOM manipulation
  const svgRef = useRef();
  const containerRef = useRef();

  /**
   * Main effect that handles chart rendering and updates
   * Runs whenever data or yDomain changes
   */
  useEffect(() => {
    // Exit early if container or data is not ready
    if (!containerRef.current || data.length === 0) return;

    // Get container dimensions for responsive sizing
    const { width, height } = containerRef.current.getBoundingClientRect();
    const margin = { top: 20, right: 60, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Get D3 selection of SVG element
    const svg = d3.select(svgRef.current);

    // Calculate or use existing y-domain for stable scaling
    const currentYDomain = yDomain || calculateYDomain(data);
    if (!yDomain) {
      setYDomain(currentYDomain);
    }

    // Initialize chart structure if not already done
    let g = svg.select("g");
    if (g.empty()) {
      g = initializeChart(svg, width, height, margin);
    }

    // Create scales for mapping data to screen coordinates
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.date))
      .range([0, innerWidth])
      .padding(0.3);

    const yScale = d3
      .scaleLinear()
      .domain(currentYDomain)
      .range([innerHeight, 0]);

    // Setup interactive crosshair
    setupCrosshair(svg, g, xScale, yScale, innerWidth, innerHeight);

    // Update chart axes with current data
    updateAxes(g, xScale, yScale, data, innerWidth, innerHeight);

    // Render candlestick data
    renderCandles(g, data, xScale, yScale, isAnimating);
  }, [data, yDomain, isAnimating]);

  /**
   * Handles price action simulation when buttons are clicked
   * @param {string} direction - "up" or "down" price movement
   */
  const handlePriceAction = (direction) => {
    // Prevent multiple simultaneous animations
    if (isAnimating) return;

    setIsAnimating(true);

    // Configuration for price simulation
    const period = 5; // Number of days to simulate
    const priceChange = 20; // Dollar amount of price change
    const lastDataPoint = data[data.length - 1];

    // Calculate target price based on direction
    const targetPrice =
      direction === "up"
        ? lastDataPoint.close + priceChange
        : Math.max(0.01, lastDataPoint.close - priceChange);

    // Generate new price action data
    const newPriceAction = generatePriceAction(
      lastDataPoint,
      targetPrice,
      period
    );

    // Calculate new y-domain including future price action to prevent chart jumping
    const futureData = [...data.slice(-50), ...newPriceAction];
    const newYDomain = calculateYDomain(futureData);
    setYDomain(newYDomain);

    // Animate the candles one by one with staggered timing
    newPriceAction.forEach((newDataPoint, index) => {
      setTimeout(() => {
        setData((prevData) => [...prevData.slice(-59), newDataPoint]); // Keep sliding window of 60 candles

        // When the last candle is added, re-enable the buttons
        if (index === newPriceAction.length - 1) {
          setIsAnimating(false);
        }
      }, (index + 1) * 400); // 400ms delay between each new candle
    });
  };

  return (
    <div className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-2xl border border-gray-700">
      {/* Chart Container */}
      <div
        ref={containerRef}
        className="w-full h-64 md:h-96 mb-6 cursor-crosshair bg-gray-900 rounded-lg border border-gray-600"
      >
        <svg ref={svgRef}></svg>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => handlePriceAction("up")}
          disabled={isAnimating}
          className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnimating ? "Simulating..." : "Price Up"}
        </button>
        <button
          onClick={() => handlePriceAction("down")}
          disabled={isAnimating}
          className="px-8 py-3 bg-red-600 text-white font-bold rounded-lg shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnimating ? "Simulating..." : "Price Down"}
        </button>
      </div>
    </div>
  );
};

export default StockMarketSimulator;
