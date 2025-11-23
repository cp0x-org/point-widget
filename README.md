# 🏴‍☠️ Treasure Widget

A comprehensive crypto portfolio management dashboard built for hackathons, designed to help users track and value their digital assets across multiple protocols and early-stage projects.

## 🌟 What It Does

Treasure Widget is an innovative portfolio tracker that goes beyond traditional crypto portfolio management by allowing users to:

- **Track Multi-Protocol Assets**: Automatically fetch and display asset holdings across different DeFi protocols
- **Manage Project Points & Tokens**: Add and value early-stage project points/tokens that aren't yet listed on exchanges
- **Custom Valuation Models**: Configure FDV-based pricing for unlisted assets using project fundamentals
- **Visual Portfolio Analytics**: Interactive pie charts showing asset distribution and total portfolio value
- **Real-time Data Integration**: Connect with blockchain APIs to fetch live portfolio data

## 🚀 Key Features

### 📊 Portfolio Visualization
- Interactive pie charts powered by Recharts
- Real-time asset distribution across protocols
- Clean, modern UI with responsive design

### 🎯 Project Point Management
- Track points from airdrops, testnets, and early participation
- Custom pricing models based on project FDV and token allocation
- Automatic point price calculations: `(FDV × Token%) ÷ Total Points`

### 💼 Multi-Protocol Support
- Integration with Octav API for cross-chain portfolio data
- Support for Ethereum and other EVM networks
- Automatic asset aggregation and valuation

### 🔧 Advanced Configuration
- Editable project parameters (FDV, token percentage, total points)
- Local storage persistence for custom configurations
- Batch operations for managing multiple projects

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.3.1 with React 19.0.0
- **Styling**: Tailwind CSS with custom animations
- **Charts**: Recharts for data visualization
- **API Integration**: Axios for HTTP requests
- **State Management**: React hooks with localStorage persistence
- **Blockchain**: Ethers.js for web3 integration
- **UI Components**: Radix UI primitives with custom styling

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. Clone the repository: