# JupiTrails 🚀

<div align="center">
  <img src="./public/assets/logo.svg" alt="JupiTrails Logo" width="100" height="100">
  <h3>Visualize and analyze optimal swap routes on Solana using Jupiter's aggregation technology</h3>
  
  <p>
    <strong>React</strong> • <strong>TypeScript</strong> • <strong>Tailwind CSS</strong> • <strong>Solana Web3.js</strong> • <strong>Jupiter API</strong>
  </p>
</div>

## 📝 Project Description

JupiTrails is a modern, intuitive DEX-like swap interface that revolutionizes how users interact with Jupiter Protocol on Solana. By combining real-time route visualization with seamless swap execution, it bridges the gap between complex DeFi operations and user-friendly interfaces.

### 🎯 What Makes JupiTrails Special

JupiTrails transforms Jupiter's powerful aggregation technology into an accessible, visual experience:

- **Route Transparency**: See exactly how your swap travels through different AMMs and liquidity sources
- **Real-time Intelligence**: Automatic route optimization and price updates without manual intervention
- **Educational Value**: Learn about DeFi routing while executing trades
- **Developer-First**: Clean, well-documented code showcasing Jupiter API best practices

## ✨ Features

### Core Functionality

- 🔄 **Real-time Token Swapping** using Jupiter's aggregation protocol
- 📊 **Route Visualization** showing optimal swap paths and intermediary tokens
- 💰 **Live Price Updates** with automatic quote refreshing
- 🎛️ **Advanced Controls** including slippage tolerance and transaction prioritization
- 👛 **Wallet Integration** with multi-wallet support (Phantom, Solflare, Torus, Ledger)
- 📱 **Responsive Design** optimized for both desktop and mobile devices

### Jupiter API Integration

- **Quote API**: Real-time price calculations and route optimization
- **Swap API**: Transaction building and execution
- **Token List API**: Dynamic token discovery with popular tokens
- **Price API**: USD pricing for enhanced user experience

### Technical Highlights

- **Automatic Route Fetching**: Routes update automatically when tokens or amounts change
- **Decimal Input Handling**: Robust input validation for precise amount entry
- **Transaction Status Tracking**: Real-time updates from submission to confirmation
- **Error Handling**: Comprehensive error management with user-friendly messages
- **Performance Optimization**: Debounced API calls and efficient state management

## 🏗️ Technical Architecture

### Frontend Stack

- **React 18** with TypeScript for type safety
- **Tailwind CSS** for modern, responsive styling
- **Lucide React** for consistent iconography
- **Vite** for fast development and optimized builds

### Blockchain Integration

- **Solana Web3.js** for blockchain interactions
- **Solana Wallet Adapter** for multi-wallet support
- **Jupiter APIs** for swap functionality and token data
- **Helius RPC** for reliable blockchain connectivity

### Project Structure

```
src/
├── components/           # React components
│   ├── ControlPanel.tsx     # Main swap interface
│   ├── TokenSelector.tsx    # Token selection dropdown
│   ├── RouteDiagram.tsx     # Route visualization
│   └── JupiterVisualizer.tsx # Main app component
├── services/            # API integrations
│   ├── jupiterApi.ts       # Jupiter API functions
│   └── tokenApi.ts         # Token data fetching
├── types/               # TypeScript definitions
│   └── jupiter.ts          # Jupiter-specific types
├── utils/               # Utility functions
│   ├── jupiter.ts          # Jupiter data processing
│   └── transaction.ts      # Transaction handling
└── constants/           # App configuration
    └── tokens.ts           # Token definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Solana wallet (Phantom recommended)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/jupitrails.git
   cd jupitrails
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   # Jupiter API Configuration
   VITE_JUPITER_API_BASE=https://lite-api.jup.ag/

   # Helius RPC Configuration
   VITE_HELIUS_API_KEY=your_helius_api_key_here
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## 🌐 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**

   - Go to [vercel.com](https://vercel.com/)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy!

3. **Environment Variables in Vercel**
   - `VITE_JUPITER_API_BASE`: `https://lite-api.jup.ag/`
   - `VITE_HELIUS_API_KEY`: Your Helius API key

## 🏆 Project Highlights

### Innovation & Creativity

JupiTrails introduces several unique features to the Jupiter ecosystem:

- **Interactive Route Visualization**: First-of-its-kind visual representation of swap paths, showing how trades flow through different AMMs and liquidity sources
- **Intelligent Auto-Updates**: Smart system that automatically fetches new routes when conditions change, eliminating manual "refresh" actions
- **Jupiter-Themed Design System**: Custom gradient design language that reflects Jupiter's visual identity while maintaining excellent usability
- **Educational Interface**: Users can learn about DeFi routing mechanics while executing real trades

### Technical Excellence

- **Modular Architecture**: Clean, maintainable TypeScript codebase with clear separation of concerns
- **Optimized Performance**: Debounced API calls, efficient state management, and minimal re-renders
- **Robust Error Handling**: Comprehensive error management with user-friendly feedback
- **Production Ready**: Full testing suite, proper TypeScript types, and deployment-ready configuration

### User Experience Innovation

- **Zero-Configuration Setup**: Works out of the box with any Solana wallet
- **Responsive Excellence**: Seamless experience across desktop, tablet, and mobile devices
- **Real-time Feedback**: Live transaction status tracking from submission to confirmation
- **Accessibility First**: Proper contrast ratios, keyboard navigation, and screen reader support

### Ecosystem Impact

- **Open Source Contribution**: Reusable components and patterns for the Jupiter developer community
- **Educational Resource**: Comprehensive documentation and code examples for learning Jupiter API integration
- **Developer Tool**: Professional-grade interface that other projects can learn from and build upon
- **Innovation Catalyst**: Demonstrates advanced possibilities within the Jupiter ecosystem

## 🔗 Links

- **Live Demo**: [Deployed on Vercel](your-vercel-link-here)
- **GitHub Repository**: [Source Code](https://github.com/your-username/jupitrails)
- **Jupiter Protocol**: [jup.ag](https://jup.ag)

## 👨‍💻 About This Project

JupiTrails showcases the incredible potential of Jupiter Protocol's APIs through a beautifully crafted, production-ready interface. Every feature has been thoughtfully designed to demonstrate both technical excellence and user experience innovation.

**Why JupiTrails Matters:**

- Proves that DeFi can be both powerful and user-friendly
- Provides a foundation for other developers to build upon
- Demonstrates advanced Jupiter API integration patterns
- Contributes meaningful open-source tools to the Solana ecosystem

---

<div align="center">
  <img src="./public/assets/jupiter-logo.svg" alt="Jupiter Protocol" width="24" height="24">
  <p><em>Powered by Jupiter Protocol</em></p>
</div>
