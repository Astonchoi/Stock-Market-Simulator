# Stock Market Simulator

A real-time interactive stock market simulator built with React and D3.js that displays dynamic candlestick charts with animated price movements and user controls.

## 🚀 Features

### Interactive Candlestick Chart

- **Real-time animated candlesticks**: Watch price movements unfold with smooth animations
- **Interactive crosshair**: Hover over the chart to see precise price and date information
- **Responsive design**: Works seamlessly on desktop and mobile devices
- **Professional styling**: Dark theme with modern UI components

### Price Simulation Engine

- **Realistic price movements**: Advanced algorithms generate believable stock price patterns
- **Directional bias**: Price movements trend toward target prices with natural variations

### User Controls

- **Price Up Button**: Simulates bullish market conditions with upward price movement
- **Price Down Button**: Simulates bearish market conditions with downward price movement
- **Animation feedback**: Buttons show "Simulating..." status during price animations
- **Smooth transitions**: 400ms delays between candle updates for realistic timing

## 🎮 How to See the Demo

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation & Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/Astonchoi/Stock-Market-Simulator.git
   cd Stock-Market-Simulator
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal)

## ⚙️ Configuration Options

The simulator includes several configurable parameters that can be modified in the source code:

### Price Simulation Settings (`StockMarketSimulator.jsx`, lines 96-98)

```javascript
const period = 5; // Number of days to simulate (default: 5)
const priceChange = 20; // Dollar amount of price change (default: $20)
```

### Initial Data Settings (`priceUtils.js`)

```javascript
// In generateInitialData function
days = 60; // Number of historical days (default: 60)
startingPrice = 100; // Starting stock price (default: $100)
```

### Animation Timing (`StockMarketSimulator.jsx`, line 128)

```javascript
(index + 1) * 400; // Delay between candles in milliseconds (default: 400ms)
```

### Price Volatility (`priceUtils.js`, lines 34-35)

```javascript
const randomMove = getRandom(-8, 8); // Daily price fluctuation range
const drift = (totalPriceChange / periodInDays) * 1.5; // Directional bias strength
```

### Chart Dimensions and Margins (`StockMarketSimulator.jsx`, line 45)

```javascript
const margin = { top: 20, right: 60, bottom: 40, left: 60 };
```

## 🛠️ Technical Stack

- **Frontend**: React 19.1.1 with functional components and hooks
- **Visualization**: D3.js 7.9.0 for advanced chart rendering
- **Styling**: Tailwind CSS 4.1.12 for modern, responsive design
- **Build Tool**: Vite 7.1.2 for fast development and optimized builds
- **Code Quality**: ESLint with React-specific rules

## 📁 Project Structure

```
src/
├── components/
│   └── StockMarketSimulator.jsx    # Main simulator component
├── utils/
│   ├── chartUtils.js               # D3.js chart rendering utilities
│   └── priceUtils.js               # Price generation and calculation logic
├── App.jsx                         # Root application component
├── main.jsx                        # Application entry point
└── index.css                       # Global styles and Tailwind imports
```

## 🚧 Next Steps - Planned Improvements

### Interactive Code-Based Trading

The next major enhancement will be **removing button-based interactions**.

### Example Future Trading Interface

```javascript
// Users will write functions like this instead of clicking buttons
function tradingStrategy(currentPrice, historicalData) {
  // User's custom trading logic here
  if (currentPrice > movingAverage(historicalData, 20)) {
    return { action: "buy", quantity: 100 };
  }
  return { action: "hold" };
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
