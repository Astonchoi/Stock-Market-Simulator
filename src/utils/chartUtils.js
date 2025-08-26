/**
 * D3.js chart utilities for rendering candlestick charts
 */
import * as d3 from "d3";

/**
 * Calculate stable y-domain for the chart that doesn't change during animation
 * @param {Array} data - Array of candle data points
 * @returns {Array} [minPrice, maxPrice] domain for y-axis
 */
export const calculateYDomain = (data) => {
  const allHigh = data.map((d) => d.high);
  const allLow = data.map((d) => d.low);
  const minPrice = d3.min(allLow);
  const maxPrice = d3.max(allHigh);
  const padding = (maxPrice - minPrice) * 0.1; // 10% padding
  return [Math.max(0.01, minPrice - padding), maxPrice + padding];
};

/**
 * Initialize the SVG chart structure
 * @param {Object} svg - D3 selection of SVG element
 * @param {number} width - Chart width
 * @param {number} height - Chart height
 * @param {Object} margin - Chart margins
 */
export const initializeChart = (svg, width, height, margin) => {
  // Clear any existing content
  svg.selectAll("*").remove();

  // Set SVG dimensions
  svg.attr("width", width).attr("height", height);

  // Create main group with margins
  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Add axis groups
  g.append("g").attr("class", "x-axis");
  g.append("g").attr("class", "y-axis");
  g.append("g").attr("class", "grid");
  g.append("g").attr("class", "candles-container");

  // Add crosshair elements
  const crosshair = g
    .append("g")
    .attr("class", "crosshair")
    .style("display", "none");

  crosshair
    .append("line")
    .attr("class", "crosshair-x")
    .attr("stroke", "#6b7280")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "3,3");

  crosshair
    .append("line")
    .attr("class", "crosshair-y")
    .attr("stroke", "#6b7280")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "3,3");

  crosshair
    .append("rect")
    .attr("class", "price-label-bg")
    .attr("fill", "#1f2937")
    .attr("rx", 2)
    .attr("ry", 2)
    .attr("height", 20);

  crosshair
    .append("text")
    .attr("class", "price-label")
    .attr("fill", "white")
    .attr("font-size", "12px")
    .attr("text-anchor", "middle");

  return g;
};

/**
 * Setup mouse interactions for crosshair
 * @param {Object} svg - D3 selection of SVG element
 * @param {Object} g - D3 selection of main group
 * @param {Object} xScale - D3 x scale
 * @param {Object} yScale - D3 y scale
 * @param {number} innerWidth - Chart inner width
 * @param {number} innerHeight - Chart inner height
 */
export const setupCrosshair = (
  svg,
  g,
  xScale,
  yScale,
  innerWidth,
  innerHeight
) => {
  svg.on("mousemove", (event) => {
    const gNode = g.node();
    if (!gNode) return;

    const [mx, my] = d3.pointer(event, gNode);

    if (mx >= 0 && mx <= innerWidth && my >= 0 && my <= innerHeight) {
      const crosshair = g.select(".crosshair");
      crosshair.style("display", null);

      // Update crosshair lines
      crosshair
        .select(".crosshair-x")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", my)
        .attr("y2", my);

      crosshair
        .select(".crosshair-y")
        .attr("x1", mx)
        .attr("x2", mx)
        .attr("y1", 0)
        .attr("y2", innerHeight);

      // Update price label
      const price = yScale.invert(my).toFixed(2);
      const labelX = Math.min(innerWidth - 30, Math.max(30, mx));

      crosshair
        .select(".price-label")
        .attr("transform", `translate(${labelX}, ${my - 5})`)
        .text(price);

      crosshair
        .select(".price-label-bg")
        .attr("transform", `translate(${labelX - 25}, ${my - 15})`)
        .attr("width", 50);
    } else {
      g.select(".crosshair").style("display", "none");
    }
  });

  svg.on("mouseleave", () => g.select(".crosshair").style("display", "none"));
};

/**
 * Update chart axes with smooth transitions
 * @param {Object} g - D3 selection of main group
 * @param {Object} xScale - D3 x scale
 * @param {Object} yScale - D3 y scale
 * @param {Array} data - Chart data for x-axis ticks
 * @param {number} innerWidth - Chart inner width
 * @param {number} innerHeight - Chart inner height
 */
export const updateAxes = (
  g,
  xScale,
  yScale,
  data,
  innerWidth,
  innerHeight
) => {
  // Create axes
  const xAxis = d3
    .axisBottom(xScale)
    .tickFormat(d3.timeFormat("%b %d"))
    .tickValues(
      xScale.domain().filter((d, i) => i % Math.ceil(data.length / 8) === 0)
    );

  const yAxis = d3
    .axisRight(yScale)
    .ticks(8)
    .tickFormat((d) => `$${d.toFixed(0)}`);

  const gridAxis = d3
    .axisLeft(yScale)
    .tickSize(-innerWidth)
    .tickFormat("")
    .ticks(8);

  // Update axes with transitions
  g.select(".x-axis")
    .attr("transform", `translate(0, ${innerHeight})`)
    .transition()
    .duration(300)
    .call(xAxis)
    .selectAll("text")
    .style("fill", "#9ca3af")
    .style("font-size", "12px");

  g.select(".y-axis")
    .attr("transform", `translate(${innerWidth}, 0)`)
    .transition()
    .duration(300)
    .call(yAxis)
    .selectAll("text")
    .style("fill", "#9ca3af")
    .style("font-size", "12px");

  g.select(".grid")
    .transition()
    .duration(300)
    .call(gridAxis)
    .selectAll("line")
    .attr("stroke", "rgba(255, 255, 255, 0.1)")
    .attr("stroke-width", 0.5);
};

/**
 * Render candlestick data on the chart
 * @param {Object} g - D3 selection of main group
 * @param {Array} data - Candlestick data
 * @param {Object} xScale - D3 x scale
 * @param {Object} yScale - D3 y scale
 * @param {boolean} isAnimating - Whether to animate new candles
 */
export const renderCandles = (g, data, xScale, yScale, isAnimating = false) => {
  // D3 Data Join for candles
  const candles = g
    .select(".candles-container")
    .selectAll("g.candle")
    .data(data, (d) => d.date);

  // EXIT old candles
  candles.exit().transition().duration(200).style("opacity", 0).remove();

  // UPDATE existing candles
  candles.attr("transform", (d) => `translate(${xScale(d.date)}, 0)`);

  candles
    .selectAll("line.wick")
    .attr("x1", xScale.bandwidth() / 2)
    .attr("x2", xScale.bandwidth() / 2)
    .attr("y1", (d) => yScale(d.high))
    .attr("y2", (d) => yScale(d.low))
    .attr("stroke", (d) => (d.open > d.close ? "#ef4444" : "#22c55e"))
    .attr("stroke-width", 1);

  candles
    .selectAll("rect")
    .attr("width", xScale.bandwidth())
    .attr("y", (d) => yScale(Math.max(d.open, d.close)))
    .attr("height", (d) =>
      Math.max(1, Math.abs(yScale(d.open) - yScale(d.close)))
    )
    .attr("fill", (d) => (d.open > d.close ? "#ef4444" : "#22c55e"));

  // ENTER new candles
  const candleEnter = candles
    .enter()
    .append("g")
    .attr("class", "candle")
    .attr("transform", (d) => `translate(${xScale(d.date)}, 0)`);

  // Add wick for new candles
  const wicks = candleEnter
    .append("line")
    .attr("class", "wick")
    .attr("x1", xScale.bandwidth() / 2)
    .attr("x2", xScale.bandwidth() / 2)
    .attr("stroke", (d) => (d.open > d.close ? "#ef4444" : "#22c55e"))
    .attr("stroke-width", 1);

  // Add body for new candles
  const bodies = candleEnter
    .append("rect")
    .attr("x", 0)
    .attr("width", xScale.bandwidth())
    .attr("fill", (d) => (d.open > d.close ? "#ef4444" : "#22c55e"))
    .attr("rx", 1)
    .attr("ry", 1);

  // Handle animation for new candles
  if (!isAnimating) {
    // For initial render, show candles immediately
    wicks.attr("y1", (d) => yScale(d.high)).attr("y2", (d) => yScale(d.low));

    bodies
      .attr("y", (d) => yScale(Math.max(d.open, d.close)))
      .attr("height", (d) =>
        Math.max(1, Math.abs(yScale(d.open) - yScale(d.close)))
      );
  } else {
    // For animated candles, start small and animate
    wicks
      .attr("y1", (d) => yScale(d.open))
      .attr("y2", (d) => yScale(d.open))
      .transition()
      .duration(400)
      .attr("y1", (d) => yScale(d.high))
      .attr("y2", (d) => yScale(d.low));

    bodies
      .attr("y", (d) => yScale(d.open))
      .attr("height", 0)
      .transition()
      .duration(400)
      .attr("y", (d) => yScale(Math.max(d.open, d.close)))
      .attr("height", (d) =>
        Math.max(1, Math.abs(yScale(d.open) - yScale(d.close)))
      );
  }
};
