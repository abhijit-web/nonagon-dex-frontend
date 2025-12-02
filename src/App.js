import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Zap, Lock, DollarSign, Activity, BarChart3, Bot, Wallet, PiggyBank } from 'lucide-react';

export default function NonagonPrototype() {
  const [activeTab, setActiveTab] = useState('trading');
  const [balance, setBalance] = useState({ 
    usdc: 10000, 
    usdt: 10000, 
    n9g: 5000,
    dai: 8000,
    eth: 5
  });
  const [orderbook, setOrderbook] = useState({ bids: [], asks: [] });
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [hftEnabled, setHftEnabled] = useState(false);
  const [hftProfit, setHftProfit] = useState(0);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [selectedPair, setSelectedPair] = useState('USDC/USDT');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [stakedTokens, setStakedTokens] = useState({ 
    n9g: 0, 
    usdc: 0, 
    usdt: 0,
    dai: 0,
    eth: 0
  });
  const [lockPeriod, setLockPeriod] = useState(0);
  const [lendingPools, setLendingPools] = useState({
    usdc: { supplied: 0, borrowed: 0, supplyAPY: 4.5, borrowAPY: 6.8 },
    usdt: { supplied: 0, borrowed: 0, supplyAPY: 4.2, borrowAPY: 6.5 },
    n9g: { supplied: 0, borrowed: 0, supplyAPY: 12.5, borrowAPY: 15.2 },
    dai: { supplied: 0, borrowed: 0, supplyAPY: 4.8, borrowAPY: 7.1 },
    eth: { supplied: 0, borrowed: 0, supplyAPY: 3.2, borrowAPY: 4.5 }
  });
  const [collateralEnabled, setCollateralEnabled] = useState({
    usdc: false, usdt: false, n9g: false, dai: false, eth: false
  });

  // Generate realistic orderbook
  useEffect(() => {
    const generateOrderbook = () => {
      const midPrice = 0.9998;
      const bids = [];
      const asks = [];
      
      for (let i = 0; i < 10; i++) {
        bids.push({
          price: (midPrice - (i * 0.0001)).toFixed(4),
          amount: Math.floor(Math.random() * 50000) + 10000,
          total: 0
        });
        asks.push({
          price: (midPrice + (i * 0.0001)).toFixed(4),
          amount: Math.floor(Math.random() * 50000) + 10000,
          total: 0
        });
      }
      
      setOrderbook({ bids, asks });
    };

    generateOrderbook();
    const interval = setInterval(generateOrderbook, 3000);
    return () => clearInterval(interval);
  }, [selectedPair]);

  // HFT Bot simulation
  useEffect(() => {
    if (hftEnabled) {
      const hftInterval = setInterval(() => {
        const profit = Math.random() * 5 + 2; // $2-7 per trade
        setHftProfit(prev => prev + profit);
        setTotalEarnings(prev => prev + profit);
        
        // Add to trade history
        const trades = ['Market Making', 'Arbitrage', 'Spread Capture', 'Statistical Arb'];
        setTradeHistory(prev => [{
          time: new Date().toLocaleTimeString(),
          strategy: trades[Math.floor(Math.random() * trades.length)],
          profit: profit.toFixed(2),
          pair: selectedPair
        }, ...prev].slice(0, 20));
      }, 5000); // Execute trade every 5 seconds
      
      return () => clearInterval(hftInterval);
    }
  }, [hftEnabled, selectedPair]);

  // Staking rewards simulation
  useEffect(() => {
    const totalStaked = stakedTokens.n9g * 1.2 + stakedTokens.usdc + stakedTokens.usdt + stakedTokens.dai + stakedTokens.eth * 3000;
    if (totalStaked > 0) {
      const rewardInterval = setInterval(() => {
        const baseAPY = 0.15; // 15% base
        const multiplier = 1 + (lockPeriod / 365) * 0.8;
        
        // Calculate rewards for each token
        const n9gReward = stakedTokens.n9g * ((baseAPY * multiplier) / 365);
        const stablecoinAPY = (baseAPY * multiplier * 0.5) / 365;
        const usdcReward = stakedTokens.usdc * stablecoinAPY;
        const usdtReward = stakedTokens.usdt * stablecoinAPY;
        const daiReward = stakedTokens.dai * stablecoinAPY;
        const ethReward = stakedTokens.eth * 3000 * ((baseAPY * multiplier * 0.4) / 365);
        
        const totalReward = n9gReward + usdcReward + usdtReward + daiReward + ethReward;
        setTotalEarnings(prev => prev + totalReward);
      }, 2000); // Update every 2 seconds for demo
      
      return () => clearInterval(rewardInterval);
    }
  }, [stakedTokens, lockPeriod]);

  // Lending interest accumulation
  useEffect(() => {
    const lendingInterval = setInterval(() => {
      let supplyInterest = 0;
      let borrowInterest = 0;
      
      Object.keys(lendingPools).forEach(token => {
        const price = token === 'eth' ? 3000 : token === 'n9g' ? 1.2 : 1;
        supplyInterest += (lendingPools[token].supplied * price * lendingPools[token].supplyAPY) / (365 * 100);
        borrowInterest += (lendingPools[token].borrowed * price * lendingPools[token].borrowAPY) / (365 * 100);
      });
      
      const netInterest = supplyInterest - borrowInterest;
      setTotalEarnings(prev => prev + netInterest);
    }, 2000);
    
    return () => clearInterval(lendingInterval);
  }, [lendingPools]);

  const executeTrade = (side, price, amount) => {
    const fee = side === 'maker' ? -0.0001 : 0.0003; // Maker rebate or taker fee
    const total = price * amount;
    const feeAmount = total * Math.abs(fee);
    
    if (side === 'buy') {
      if (balance.usdt >= total + feeAmount) {
        setBalance(prev => ({
          ...prev,
          usdt: prev.usdt - total - feeAmount,
          usdc: prev.usdc + amount
        }));
        
        const profit = fee < 0 ? feeAmount : -feeAmount;
        setTotalEarnings(prev => prev + profit);
        
        setTradeHistory(prev => [{
          time: new Date().toLocaleTimeString(),
          strategy: 'Manual Trade',
          profit: profit.toFixed(2),
          pair: selectedPair
        }, ...prev].slice(0, 20));
      }
    }
  };

  const stakeTokens = (amount, token) => {
    const tokenKey = token.toLowerCase();
    if (balance[tokenKey] >= amount && amount > 0) {
      setBalance(prev => ({ ...prev, [tokenKey]: prev[tokenKey] - amount }));
      setStakedTokens(prev => ({ ...prev, [tokenKey]: prev[tokenKey] + amount }));
    }
  };

  const unstakeTokens = (token) => {
    const tokenKey = token.toLowerCase();
    const amount = stakedTokens[tokenKey];
    if (amount > 0) {
      setBalance(prev => ({ ...prev, [tokenKey]: prev[tokenKey] + amount }));
      setStakedTokens(prev => ({ ...prev, [tokenKey]: 0 }));
    }
  };

  const calculateAPY = () => {
    const baseAPY = 15;
    const lockMultiplier = 1 + (lockPeriod / 365) * 0.8;
    return (baseAPY * lockMultiplier).toFixed(1);
  };

  const connectWallet = async (walletType) => {
    // Simulate wallet connection
    setShowWalletModal(false);
    
    // Generate mock wallet address
    const mockAddress = `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`;
    setWalletAddress(mockAddress);
    
    // Simulate loading balances from blockchain
    setTimeout(() => {
      setWalletConnected(true);
      // Update balances with "real" wallet data
      setBalance({
        usdc: Math.floor(Math.random() * 50000) + 5000,
        usdt: Math.floor(Math.random() * 50000) + 5000,
        n9g: Math.floor(Math.random() * 10000) + 1000,
        dai: Math.floor(Math.random() * 40000) + 3000,
        eth: Math.floor(Math.random() * 10) + 2
      });
    }, 1500);
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress('');
    setBalance({ usdc: 10000, usdt: 10000, n9g: 5000, dai: 8000, eth: 5 });
  };

  // Lending Protocol Functions
  const supplyAsset = (token, amount) => {
    const tokenKey = token.toLowerCase();
    if (balance[tokenKey] >= amount && amount > 0) {
      setBalance(prev => ({ ...prev, [tokenKey]: prev[tokenKey] - amount }));
      setLendingPools(prev => ({
        ...prev,
        [tokenKey]: { ...prev[tokenKey], supplied: prev[tokenKey].supplied + amount }
      }));
    }
  };

  const withdrawAsset = (token, amount) => {
    const tokenKey = token.toLowerCase();
    if (lendingPools[tokenKey].supplied >= amount && amount > 0) {
      setLendingPools(prev => ({
        ...prev,
        [tokenKey]: { ...prev[tokenKey], supplied: prev[tokenKey].supplied - amount }
      }));
      setBalance(prev => ({ ...prev, [tokenKey]: prev[tokenKey] + amount }));
    }
  };

  const borrowAsset = (token, amount) => {
    const tokenKey = token.toLowerCase();
    const borrowingPower = calculateBorrowingPower();
    const newBorrowTotal = calculateTotalBorrowed() + amount;
    
    if (newBorrowTotal <= borrowingPower * 0.75 && amount > 0) { // 75% LTV
      setLendingPools(prev => ({
        ...prev,
        [tokenKey]: { ...prev[tokenKey], borrowed: prev[tokenKey].borrowed + amount }
      }));
      setBalance(prev => ({ ...prev, [tokenKey]: prev[tokenKey] + amount }));
    }
  };

  const repayAsset = (token, amount) => {
    const tokenKey = token.toLowerCase();
    if (balance[tokenKey] >= amount && lendingPools[tokenKey].borrowed >= amount && amount > 0) {
      setBalance(prev => ({ ...prev, [tokenKey]: prev[tokenKey] - amount }));
      setLendingPools(prev => ({
        ...prev,
        [tokenKey]: { ...prev[tokenKey], borrowed: prev[tokenKey].borrowed - amount }
      }));
    }
  };

  const toggleCollateral = (token) => {
    setCollateralEnabled(prev => ({ ...prev, [token]: !prev[token] }));
  };

  const calculateBorrowingPower = () => {
    let total = 0;
    Object.keys(lendingPools).forEach(token => {
      if (collateralEnabled[token]) {
        const ltv = token === 'eth' ? 0.80 : token === 'n9g' ? 0.65 : 0.85; // LTV ratios
        const price = token === 'eth' ? 3000 : token === 'n9g' ? 1.2 : 1;
        total += lendingPools[token].supplied * price * ltv;
      }
    });
    return total;
  };

  const calculateTotalSupplied = () => {
    return Object.keys(lendingPools).reduce((sum, token) => {
      const price = token === 'eth' ? 3000 : token === 'n9g' ? 1.2 : 1;
      return sum + (lendingPools[token].supplied * price);
    }, 0);
  };

  const calculateTotalBorrowed = () => {
    return Object.keys(lendingPools).reduce((sum, token) => {
      const price = token === 'eth' ? 3000 : token === 'n9g' ? 1.2 : 1;
      return sum + (lendingPools[token].borrowed * price);
    }, 0);
  };

  const calculateHealthFactor = () => {
    const totalBorrowed = calculateTotalBorrowed();
    if (totalBorrowed === 0) return 999;
    const borrowingPower = calculateBorrowingPower();
    return (borrowingPower / totalBorrowed).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 mb-6 shadow-2xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">NonagonChain DEX</h1>
              <p className="text-purple-100">High-Frequency Stablecoin Trading Protocol</p>
            </div>
            
            {/* Wallet Connection Button */}
            <div>
              {!walletConnected ? (
                <button
                  onClick={() => setShowWalletModal(true)}
                  className="flex items-center gap-2 bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-all shadow-lg"
                >
                  <Wallet size={20} />
                  Connect Wallet
                </button>
              ) : (
                <div className="bg-white/10 backdrop-blur px-6 py-3 rounded-lg">
                  <div className="text-purple-200 text-xs mb-1">Connected</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white font-mono font-semibold">{walletAddress}</span>
                    <button
                      onClick={disconnectWallet}
                      className="ml-2 text-purple-200 hover:text-white text-xs"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur rounded-lg p-3">
              <div className="text-purple-200 text-sm">Total Earnings</div>
              <div className="text-2xl font-bold text-white">${totalEarnings.toFixed(2)}</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3">
              <div className="text-purple-200 text-sm">Total Staked</div>
              <div className="text-2xl font-bold text-white">${(stakedTokens.n9g * 1.2 + stakedTokens.usdc + stakedTokens.usdt).toFixed(0)}</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3">
              <div className="text-purple-200 text-sm">Current APY</div>
              <div className="text-2xl font-bold text-green-400">{calculateAPY()}%</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3">
              <div className="text-purple-200 text-sm">HFT Profit</div>
              <div className="text-2xl font-bold text-yellow-400">${hftProfit.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'trading', label: 'Orderbook Trading', icon: BarChart3 },
            { id: 'lending', label: 'Lend & Borrow', icon: PiggyBank },
            { id: 'staking', label: 'Stake & Earn', icon: Lock },
            { id: 'hft', label: 'HFT Bot', icon: Bot },
            { id: 'portfolio', label: 'Portfolio', icon: DollarSign }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2">
            {activeTab === 'trading' && <TradingPanel orderbook={orderbook} executeTrade={executeTrade} selectedPair={selectedPair} setSelectedPair={setSelectedPair} />}
            {activeTab === 'lending' && <LendingPanel balance={balance} lendingPools={lendingPools} collateralEnabled={collateralEnabled} supplyAsset={supplyAsset} withdrawAsset={withdrawAsset} borrowAsset={borrowAsset} repayAsset={repayAsset} toggleCollateral={toggleCollateral} calculateBorrowingPower={calculateBorrowingPower} calculateTotalSupplied={calculateTotalSupplied} calculateTotalBorrowed={calculateTotalBorrowed} calculateHealthFactor={calculateHealthFactor} />}
            {activeTab === 'staking' && <StakingPanel balance={balance} stakedTokens={stakedTokens} lockPeriod={lockPeriod} setLockPeriod={setLockPeriod} stakeTokens={stakeTokens} unstakeTokens={unstakeTokens} calculateAPY={calculateAPY} />}
            {activeTab === 'hft' && <HFTPanel hftEnabled={hftEnabled} setHftEnabled={setHftEnabled} hftProfit={hftProfit} />}
            {activeTab === 'portfolio' && <PortfolioPanel balance={balance} stakedTokens={stakedTokens} totalEarnings={totalEarnings} />}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <BalanceCard balance={balance} />
            <TradeHistory trades={tradeHistory} />
          </div>
        </div>

        {/* Wallet Connection Modal */}
        {showWalletModal && (
          <WalletModal 
            onClose={() => setShowWalletModal(false)} 
            onConnect={connectWallet} 
          />
        )}
      </div>
    </div>
  );
}

function TradingPanel({ orderbook, executeTrade, selectedPair, setSelectedPair }) {
  const [orderAmount, setOrderAmount] = useState(1000);

  return (
    <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Orderbook Trading</h2>
        <select 
          value={selectedPair}
          onChange={(e) => setSelectedPair(e.target.value)}
          className="bg-slate-700 text-white px-4 py-2 rounded-lg"
        >
          <option>USDC/USDT</option>
          <option>DAI/USDC</option>
          <option>FRAX/USDT</option>
          <option>BUSD/USDC</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Asks */}
        <div>
          <h3 className="text-red-400 font-semibold mb-3">Asks (Sell Orders)</h3>
          <div className="space-y-1">
            {orderbook.asks.slice(0, 8).reverse().map((ask, i) => (
              <div key={i} className="flex justify-between text-sm bg-red-900/20 p-2 rounded hover:bg-red-900/40 cursor-pointer" onClick={() => executeTrade('buy', parseFloat(ask.price), orderAmount)}>
                <span className="text-red-400">{ask.price}</span>
                <span className="text-gray-300">{ask.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bids */}
        <div>
          <h3 className="text-green-400 font-semibold mb-3">Bids (Buy Orders)</h3>
          <div className="space-y-1">
            {orderbook.bids.slice(0, 8).map((bid, i) => (
              <div key={i} className="flex justify-between text-sm bg-green-900/20 p-2 rounded hover:bg-green-900/40 cursor-pointer" onClick={() => executeTrade('sell', parseFloat(bid.price), orderAmount)}>
                <span className="text-green-400">{bid.price}</span>
                <span className="text-gray-300">{bid.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Input */}
      <div className="bg-slate-700 p-4 rounded-lg">
        <label className="text-gray-300 text-sm block mb-2">Order Amount (USDC)</label>
        <input
          type="number"
          value={orderAmount}
          onChange={(e) => setOrderAmount(parseFloat(e.target.value))}
          className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg mb-4"
        />
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => executeTrade('buy', parseFloat(orderbook.asks[0]?.price || 1), orderAmount)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-all"
          >
            Market Buy
          </button>
          <button
            onClick={() => executeTrade('sell', parseFloat(orderbook.bids[0]?.price || 1), orderAmount)}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-all"
          >
            Market Sell
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Fee: Taker 0.03% | Maker -0.01% (rebate)</p>
      </div>
    </div>
  );
}

function StakingPanel({ balance, stakedTokens, lockPeriod, setLockPeriod, stakeTokens, unstakeTokens, calculateAPY }) {
  const [stakeInput, setStakeInput] = useState(1000);
  const [selectedToken, setSelectedToken] = useState('N9G');

  const getMaxBalance = () => {
    switch(selectedToken) {
      case 'N9G': return balance.n9g;
      case 'USDC': return balance.usdc;
      case 'USDT': return balance.usdt;
      default: return 0;
    }
  };

  const getTokenAPY = () => {
    const baseAPY = calculateAPY();
    switch(selectedToken) {
      case 'N9G': return baseAPY;
      case 'USDC': return (parseFloat(baseAPY) * 0.5).toFixed(1); // 50% of N9G APY
      case 'USDT': return (parseFloat(baseAPY) * 0.5).toFixed(1); // 50% of N9G APY
      default: return baseAPY;
    }
  };

  return (
    <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-6">Stake & Earn</h2>

      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-xl mb-6">
        <div className="text-center">
          <div className="text-purple-200 mb-2">Current APY for {selectedToken}</div>
          <div className="text-5xl font-bold text-white mb-2">{getTokenAPY()}%</div>
          <div className="text-purple-200 text-sm">Lock for higher rewards</div>
        </div>
      </div>

      <div className="bg-slate-700 p-6 rounded-xl mb-6">
        <label className="text-gray-300 text-sm block mb-2">Select Token to Stake</label>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={() => setSelectedToken('N9G')}
            className={`py-3 px-4 rounded-lg font-semibold transition-all ${
              selectedToken === 'N9G'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
            }`}
          >
            N9G
          </button>
          <button
            onClick={() => setSelectedToken('USDC')}
            className={`py-3 px-4 rounded-lg font-semibold transition-all ${
              selectedToken === 'USDC'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
            }`}
          >
            USDC
          </button>
          <button
            onClick={() => setSelectedToken('USDT')}
            className={`py-3 px-4 rounded-lg font-semibold transition-all ${
              selectedToken === 'USDT'
                ? 'bg-green-600 text-white'
                : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
            }`}
          >
            USDT
          </button>
        </div>

        <label className="text-gray-300 text-sm block mb-2">
          Stake Amount ({selectedToken}) - Available: {getMaxBalance().toFixed(2)}
        </label>
        <input
          type="number"
          value={stakeInput}
          onChange={(e) => setStakeInput(parseFloat(e.target.value))}
          className="w-full bg-slate-600 text-white px-4 py-3 rounded-lg mb-4"
          max={getMaxBalance()}
        />

        <label className="text-gray-300 text-sm block mb-2">Lock Period: {lockPeriod} days</label>
        <input
          type="range"
          min="0"
          max="365"
          value={lockPeriod}
          onChange={(e) => setLockPeriod(parseInt(e.target.value))}
          className="w-full mb-2"
        />
        <div className="flex justify-between text-xs text-gray-400 mb-4">
          <span>Flexible (1.0x)</span>
          <span>30d (1.3x)</span>
          <span>90d (1.6x)</span>
          <span>365d (2.2x)</span>
        </div>

        <button
          onClick={() => stakeTokens(stakeInput, selectedToken)}
          disabled={getMaxBalance() < stakeInput}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-all mb-3"
        >
          Stake {stakeInput} {selectedToken}
        </button>

        {stakedTokens[selectedToken.toLowerCase()] > 0 && (
          <button
            onClick={() => unstakeTokens(selectedToken)}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-all"
          >
            Unstake All ({stakedTokens[selectedToken.toLowerCase()].toFixed(2)} {selectedToken})
          </button>
        )}
      </div>

      <div className="bg-slate-700 p-4 rounded-lg mb-4">
        <h3 className="text-white font-semibold mb-3">Your Staked Positions</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {stakedTokens.n9g > 0 && (
            <div className="flex justify-between items-center p-3 bg-purple-900/30 rounded-lg">
              <div>
                <div className="text-purple-400 font-semibold">N9G Staked</div>
                <div className="text-gray-400 text-xs">Native Token - Best APY</div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold">{stakedTokens.n9g.toFixed(2)}</div>
                <div className="text-green-400 text-xs">{calculateAPY()}% APY</div>
              </div>
            </div>
          )}
          {stakedTokens.usdc > 0 && (
            <div className="flex justify-between items-center p-3 bg-blue-900/30 rounded-lg">
              <div>
                <div className="text-blue-400 font-semibold">USDC Staked</div>
                <div className="text-gray-400 text-xs">Stable Yield</div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold">${stakedTokens.usdc.toFixed(2)}</div>
                <div className="text-green-400 text-xs">{(parseFloat(calculateAPY()) * 0.5).toFixed(1)}% APY</div>
              </div>
            </div>
          )}
          {stakedTokens.usdt > 0 && (
            <div className="flex justify-between items-center p-3 bg-green-900/30 rounded-lg">
              <div>
                <div className="text-green-400 font-semibold">USDT Staked</div>
                <div className="text-gray-400 text-xs">Stable Yield</div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold">${stakedTokens.usdt.toFixed(2)}</div>
                <div className="text-green-400 text-xs">{(parseFloat(calculateAPY()) * 0.5).toFixed(1)}% APY</div>
              </div>
            </div>
          )}
          {stakedTokens.dai > 0 && (
            <div className="flex justify-between items-center p-3 bg-yellow-900/30 rounded-lg">
              <div>
                <div className="text-yellow-400 font-semibold">DAI Staked</div>
                <div className="text-gray-400 text-xs">Stable Yield</div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold">${stakedTokens.dai.toFixed(2)}</div>
                <div className="text-green-400 text-xs">{(parseFloat(calculateAPY()) * 0.5).toFixed(1)}% APY</div>
              </div>
            </div>
          )}
          {stakedTokens.eth > 0 && (
            <div className="flex justify-between items-center p-3 bg-indigo-900/30 rounded-lg">
              <div>
                <div className="text-indigo-400 font-semibold">ETH Staked</div>
                <div className="text-gray-400 text-xs">Volatile Asset</div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold">{stakedTokens.eth.toFixed(4)} ETH</div>
                <div className="text-green-400 text-xs">{(parseFloat(calculateAPY()) * 0.4).toFixed(1)}% APY</div>
              </div>
            </div>
          )}
          {stakedTokens.n9g === 0 && stakedTokens.usdc === 0 && stakedTokens.usdt === 0 && stakedTokens.dai === 0 && stakedTokens.eth === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">No active stakes</p>
          )}
        </div>
      </div>

      <div className="bg-slate-700 p-4 rounded-lg">
        <h3 className="text-white font-semibold mb-3">Revenue Sources & APY Breakdown</h3>
        <div className="space-y-2 text-sm mb-4">
          <div className="text-gray-300 font-semibold mb-2">N9G Token (Native):</div>
          <div className="flex justify-between ml-3">
            <span className="text-gray-400">Trading Fees (40%)</span>
            <span className="text-green-400">~12% APY</span>
          </div>
          <div className="flex justify-between ml-3">
            <span className="text-gray-400">Arbitrage Profits (40%)</span>
            <span className="text-green-400">~8% APY</span>
          </div>
          <div className="flex justify-between ml-3">
            <span className="text-gray-400">Inflation Rewards</span>
            <span className="text-green-400">~8% APY</span>
          </div>
          <div className="border-t border-gray-600 pt-2 mt-2 flex justify-between font-semibold ml-3">
            <span className="text-white">Total Base APY</span>
            <span className="text-green-400">~28%</span>
          </div>

          <div className="text-gray-300 font-semibold mb-2 mt-4">USDC/USDT (Stablecoins):</div>
          <div className="flex justify-between ml-3">
            <span className="text-gray-400">Liquidity Mining Rewards</span>
            <span className="text-green-400">~8% APY</span>
          </div>
          <div className="flex justify-between ml-3">
            <span className="text-gray-400">Fee Share from Trading</span>
            <span className="text-green-400">~6% APY</span>
          </div>
          <div className="border-t border-gray-600 pt-2 mt-2 flex justify-between font-semibold ml-3">
            <span className="text-white">Total Base APY</span>
            <span className="text-green-400">~14%</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3 p-3 bg-slate-600 rounded">
          💡 <strong>Tip:</strong> N9G offers higher APY as the native governance token. Stablecoins provide lower but more predictable yields.
        </p>
      </div>
    </div>
  );
}

function HFTPanel({ hftEnabled, setHftEnabled, hftProfit }) {
  return (
    <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-6">High-Frequency Trading Bot</h2>

      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 rounded-xl mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-orange-100 text-sm mb-1">HFT Bot Status</div>
            <div className="text-3xl font-bold text-white">
              {hftEnabled ? 'ACTIVE' : 'INACTIVE'}
            </div>
          </div>
          <Bot size={48} className="text-white" />
        </div>
      </div>

      <div className="bg-slate-700 p-6 rounded-xl mb-6">
        <h3 className="text-white font-semibold mb-4">Bot Strategies</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-slate-600 rounded-lg">
            <Activity className="text-green-400" size={24} />
            <div className="flex-1">
              <div className="text-white font-semibold">Market Making</div>
              <div className="text-gray-400 text-sm">Place bid/ask orders for spread capture</div>
            </div>
            <div className="text-green-400 font-semibold">0.03%</div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-slate-600 rounded-lg">
            <Zap className="text-yellow-400" size={24} />
            <div className="flex-1">
              <div className="text-white font-semibold">Cross-Exchange Arbitrage</div>
              <div className="text-gray-400 text-sm">Exploit price differences across DEXs</div>
            </div>
            <div className="text-yellow-400 font-semibold">0.15%</div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-slate-600 rounded-lg">
            <TrendingUp className="text-blue-400" size={24} />
            <div className="flex-1">
              <div className="text-white font-semibold">Statistical Arbitrage</div>
              <div className="text-gray-400 text-sm">Mean reversion on correlated pairs</div>
            </div>
            <div className="text-blue-400 font-semibold">0.25%</div>
          </div>
        </div>
      </div>

      <div className="bg-slate-700 p-4 rounded-lg mb-6">
        <h3 className="text-white font-semibold mb-3">Performance</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-400">Total Profit</div>
            <div className="text-2xl font-bold text-green-400">${hftProfit.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-400">Win Rate</div>
            <div className="text-2xl font-bold text-green-400">94.3%</div>
          </div>
          <div>
            <div className="text-gray-400">Avg Profit/Trade</div>
            <div className="text-lg font-bold text-white">$4.23</div>
          </div>
          <div>
            <div className="text-gray-400">Trades/Day</div>
            <div className="text-lg font-bold text-white">~180</div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setHftEnabled(!hftEnabled)}
        className={`w-full font-semibold py-4 rounded-lg transition-all ${
          hftEnabled
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-green-600 hover:bg-green-700 text-white'
        }`}
      >
        {hftEnabled ? 'Stop HFT Bot' : 'Start HFT Bot'}
      </button>

      <p className="text-xs text-gray-400 mt-3 text-center">
        Bot keeps 20% of profits, you keep 80%
      </p>
    </div>
  );
}

function PortfolioPanel({ balance, stakedTokens, totalEarnings }) {
  const totalStakedValue = stakedTokens.n9g * 1.2 + stakedTokens.usdc + stakedTokens.usdt;
  const totalValue = balance.usdc + balance.usdt + (balance.n9g * 1.2) + totalStakedValue;

  return (
    <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-6">Portfolio Overview</h2>

      <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-xl mb-6">
        <div className="text-emerald-100 text-sm mb-1">Total Portfolio Value</div>
        <div className="text-4xl font-bold text-white">${totalValue.toFixed(2)}</div>
        <div className="text-emerald-100 text-sm mt-2">
          Total Earnings: <span className="font-semibold">${totalEarnings.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-700 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">USDC</span>
            <span className="text-white font-semibold">{balance.usdc.toFixed(2)}</span>
          </div>
          <div className="w-full bg-slate-600 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(balance.usdc / totalValue) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-slate-700 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">USDT</span>
            <span className="text-white font-semibold">{balance.usdt.toFixed(2)}</span>
          </div>
          <div className="w-full bg-slate-600 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(balance.usdt / totalValue) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-slate-700 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">N9G (Liquid)</span>
            <span className="text-white font-semibold">{balance.n9g.toFixed(2)}</span>
          </div>
          <div className="w-full bg-slate-600 rounded-full h-2">
            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${((balance.n9g * 1.2) / totalValue) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-slate-700 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">N9G (Staked)</span>
            <span className="text-white font-semibold">{stakedTokens.n9g.toFixed(2)}</span>
          </div>
          <div className="w-full bg-slate-600 rounded-full h-2">
            <div className="bg-pink-500 h-2 rounded-full" style={{ width: `${((stakedTokens.n9g * 1.2) / totalValue) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-slate-700 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">USDC (Staked)</span>
            <span className="text-white font-semibold">{stakedTokens.usdc.toFixed(2)}</span>
          </div>
          <div className="w-full bg-slate-600 rounded-full h-2">
            <div className="bg-blue-400 h-2 rounded-full" style={{ width: `${(stakedTokens.usdc / totalValue) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-slate-700 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">USDT (Staked)</span>
            <span className="text-white font-semibold">{stakedTokens.usdt.toFixed(2)}</span>
          </div>
          <div className="w-full bg-slate-600 rounded-full h-2">
            <div className="bg-green-400 h-2 rounded-full" style={{ width: `${(stakedTokens.usdt / totalValue) * 100}%` }}></div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-slate-700 rounded-lg">
        <h3 className="text-white font-semibold mb-3">Earnings Breakdown</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Trading Fees</span>
            <span className="text-green-400">+${(totalEarnings * 0.3).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Staking Rewards</span>
            <span className="text-green-400">+${(totalEarnings * 0.4).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">HFT Bot Profits</span>
            <span className="text-green-400">+${(totalEarnings * 0.3).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BalanceCard({ balance }) {
  return (
    <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl">
      <h3 className="text-xl font-bold text-white mb-4">Wallet Balance</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
          <span className="text-gray-300">USDC</span>
          <span className="text-white font-semibold">${balance.usdc.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
          <span className="text-gray-300">USDT</span>
          <span className="text-white font-semibold">${balance.usdt.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
          <span className="text-gray-300">DAI</span>
          <span className="text-white font-semibold">${balance.dai.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
          <span className="text-gray-300">N9G</span>
          <span className="text-purple-400 font-semibold">{balance.n9g.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
          <span className="text-gray-300">ETH</span>
          <span className="text-blue-400 font-semibold">{balance.eth.toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
}

function LendingPanel({ balance, lendingPools, collateralEnabled, supplyAsset, withdrawAsset, borrowAsset, repayAsset, toggleCollateral, calculateBorrowingPower, calculateTotalSupplied, calculateTotalBorrowed, calculateHealthFactor }) {
  const [activeAction, setActiveAction] = useState('supply'); // supply, withdraw, borrow, repay
  const [selectedToken, setSelectedToken] = useState('USDC');
  const [amount, setAmount] = useState(0);

  const healthFactor = calculateHealthFactor();
  const totalSupplied = calculateTotalSupplied();
  const totalBorrowed = calculateTotalBorrowed();
  const borrowingPower = calculateBorrowingPower();

  const tokens = [
    { symbol: 'USDC', color: 'blue', icon: '💵' },
    { symbol: 'USDT', color: 'green', icon: '💵' },
    { symbol: 'DAI', color: 'yellow', icon: '💵' },
    { symbol: 'N9G', color: 'purple', icon: '🔷' },
    { symbol: 'ETH', color: 'indigo', icon: '💎' }
  ];

  const handleAction = () => {
    const token = selectedToken;
    switch(activeAction) {
      case 'supply':
        supplyAsset(token, amount);
        break;
      case 'withdraw':
        withdrawAsset(token, amount);
        break;
      case 'borrow':
        borrowAsset(token, amount);
        break;
      case 'repay':
        repayAsset(token, amount);
        break;
    }
    setAmount(0);
  };

  const getMaxAmount = () => {
    const tokenKey = selectedToken.toLowerCase();
    switch(activeAction) {
      case 'supply':
        return balance[tokenKey];
      case 'withdraw':
        return lendingPools[tokenKey].supplied;
      case 'borrow':
        const available = (borrowingPower * 0.75) - totalBorrowed;
        return Math.max(0, available);
      case 'repay':
        return Math.min(balance[tokenKey], lendingPools[tokenKey].borrowed);
      default:
        return 0;
    }
  };

  return (
    <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-6">Lend & Borrow Protocol</h2>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-600 to-green-700 p-4 rounded-xl">
          <div className="text-green-100 text-xs mb-1">Total Supplied</div>
          <div className="text-2xl font-bold text-white">${totalSupplied.toFixed(2)}</div>
        </div>
        <div className="bg-gradient-to-br from-red-600 to-red-700 p-4 rounded-xl">
          <div className="text-red-100 text-xs mb-1">Total Borrowed</div>
          <div className="text-2xl font-bold text-white">${totalBorrowed.toFixed(2)}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-xl">
          <div className="text-blue-100 text-xs mb-1">Borrowing Power</div>
          <div className="text-2xl font-bold text-white">${borrowingPower.toFixed(2)}</div>
        </div>
        <div className={`bg-gradient-to-br p-4 rounded-xl ${
          healthFactor >= 2 ? 'from-green-600 to-green-700' :
          healthFactor >= 1.5 ? 'from-yellow-600 to-yellow-700' :
          'from-red-600 to-red-700'
        }`}>
          <div className="text-white text-xs mb-1">Health Factor</div>
          <div className="text-2xl font-bold text-white">
            {healthFactor > 99 ? '∞' : healthFactor}
          </div>
        </div>
      </div>

      {/* Action Tabs */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {[
          { id: 'supply', label: 'Supply', color: 'green' },
          { id: 'withdraw', label: 'Withdraw', color: 'blue' },
          { id: 'borrow', label: 'Borrow', color: 'orange' },
          { id: 'repay', label: 'Repay', color: 'purple' }
        ].map(action => (
          <button
            key={action.id}
            onClick={() => setActiveAction(action.id)}
            className={`py-3 px-4 rounded-lg font-semibold transition-all ${
              activeAction === action.id
                ? `bg-${action.color}-600 text-white`
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Action Panel */}
      <div className="bg-slate-700 p-6 rounded-xl mb-6">
        <label className="text-gray-300 text-sm block mb-3">Select Asset</label>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {tokens.map(token => (
            <button
              key={token.symbol}
              onClick={() => setSelectedToken(token.symbol)}
              className={`py-3 px-2 rounded-lg font-semibold transition-all text-sm ${
                selectedToken === token.symbol
                  ? `bg-${token.color}-600 text-white`
                  : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
              }`}
            >
              {token.icon} {token.symbol}
            </button>
          ))}
        </div>

        <div className="bg-slate-600 p-4 rounded-lg mb-4">
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>Amount</span>
            <span>Max: {getMaxAmount().toFixed(selectedToken === 'ETH' ? 4 : 2)} {selectedToken}</span>
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-700 text-white text-2xl px-4 py-3 rounded-lg mb-2"
            placeholder="0.00"
            step={selectedToken === 'ETH' ? '0.01' : '1'}
          />
          <button
            onClick={() => setAmount(getMaxAmount())}
            className="text-purple-400 text-sm hover:text-purple-300"
          >
            Use Max
          </button>
        </div>

        {activeAction === 'supply' && (
          <div className="bg-blue-900/30 p-3 rounded-lg mb-4 text-sm">
            <div className="text-blue-300 mb-2">Supply APY: {lendingPools[selectedToken.toLowerCase()].supplyAPY}%</div>
            <div className="text-gray-400">Earn interest by supplying assets to the protocol</div>
          </div>
        )}

        {activeAction === 'borrow' && (
          <div className="bg-orange-900/30 p-3 rounded-lg mb-4 text-sm">
            <div className="text-orange-300 mb-2">Borrow APY: {lendingPools[selectedToken.toLowerCase()].borrowAPY}%</div>
            <div className="text-gray-400">Borrow against your collateral (75% max LTV)</div>
          </div>
        )}

        <button
          onClick={handleAction}
          disabled={amount <= 0 || amount > getMaxAmount()}
          className={`w-full py-4 rounded-lg font-semibold transition-all disabled:bg-gray-600 disabled:cursor-not-allowed ${
            activeAction === 'supply' ? 'bg-green-600 hover:bg-green-700' :
            activeAction === 'withdraw' ? 'bg-blue-600 hover:bg-blue-700' :
            activeAction === 'borrow' ? 'bg-orange-600 hover:bg-orange-700' :
            'bg-purple-600 hover:bg-purple-700'
          } text-white`}
        >
          {activeAction.charAt(0).toUpperCase() + activeAction.slice(1)} {amount > 0 ? `${amount.toFixed(selectedToken === 'ETH' ? 4 : 2)} ${selectedToken}` : ''}
        </button>
      </div>

      {/* Markets Overview */}
      <div className="bg-slate-700 p-4 rounded-xl">
        <h3 className="text-white font-semibold mb-4">Your Positions</h3>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {tokens.map(token => {
            const pool = lendingPools[token.symbol.toLowerCase()];
            const hasPosition = pool.supplied > 0 || pool.borrowed > 0;
            
            if (!hasPosition) return null;

            return (
              <div key={token.symbol} className="bg-slate-600 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{token.icon}</span>
                    <div>
                      <div className="text-white font-semibold">{token.symbol}</div>
                      <div className="text-gray-400 text-xs">
                        Supply: {pool.supplyAPY}% | Borrow: {pool.borrowAPY}%
                      </div>
                    </div>
                  </div>
                  {pool.supplied > 0 && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={collateralEnabled[token.symbol.toLowerCase()]}
                        onChange={() => toggleCollateral(token.symbol.toLowerCase())}
                        className="w-4 h-4"
                      />
                      <span className="text-xs text-gray-300">Collateral</span>
                    </label>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {pool.supplied > 0 && (
                    <div className="bg-green-900/30 p-3 rounded">
                      <div className="text-green-400 text-xs mb-1">Supplied</div>
                      <div className="text-white font-semibold">
                        {pool.supplied.toFixed(token.symbol === 'ETH' ? 4 : 2)}
                      </div>
                    </div>
                  )}
                  {pool.borrowed > 0 && (
                    <div className="bg-red-900/30 p-3 rounded">
                      <div className="text-red-400 text-xs mb-1">Borrowed</div>
                      <div className="text-white font-semibold">
                        {pool.borrowed.toFixed(token.symbol === 'ETH' ? 4 : 2)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {totalSupplied === 0 && totalBorrowed === 0 && (
          <p className="text-gray-400 text-sm text-center py-8">
            No positions yet. Supply assets to start earning interest!
          </p>
        )}
      </div>
    </div>
  );
}

function TradeHistory({ trades }) {
  return (
    <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl">
      <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {trades.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No trades yet. Start trading or enable HFT bot!</p>
        ) : (
          trades.map((trade, i) => (
            <div key={i} className="p-3 bg-slate-700 rounded-lg">
              <div className="flex justify-between items-start mb-1">
                <span className="text-gray-300 text-sm">{trade.strategy}</span>
                <span className="text-green-400 text-sm font-semibold">+${trade.profit}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs">{trade.pair}</span>
                <span className="text-gray-500 text-xs">{trade.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function WalletModal({ onClose, onConnect }) {
  const wallets = [
    { name: 'MetaMask', icon: '🦊', description: 'Connect using MetaMask browser extension' },
    { name: 'WalletConnect', icon: '🔗', description: 'Scan QR code with your mobile wallet' },
    { name: 'Coinbase Wallet', icon: '🔵', description: 'Connect using Coinbase Wallet' },
    { name: 'Phantom', icon: '👻', description: 'Connect using Phantom wallet' },
    { name: 'Trust Wallet', icon: '🛡️', description: 'Connect using Trust Wallet' },
    { name: 'Rainbow', icon: '🌈', description: 'Connect using Rainbow wallet' }
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Connect Wallet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-6">
          Connect your crypto wallet to access real-time balances and execute trades on-chain.
        </p>

        <div className="space-y-3">
          {wallets.map((wallet) => (
            <button
              key={wallet.name}
              onClick={() => onConnect(wallet.name)}
              className="w-full flex items-center gap-4 p-4 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all group"
            >
              <div className="text-4xl">{wallet.icon}</div>
              <div className="flex-1 text-left">
                <div className="text-white font-semibold group-hover:text-purple-400 transition-colors">
                  {wallet.name}
                </div>
                <div className="text-gray-400 text-xs">{wallet.description}</div>
              </div>
              <div className="text-gray-400 group-hover:text-white">→</div>
            </button>
          ))}
        </div>

        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-400 text-xs">
            <strong>Demo Mode:</strong> This is a prototype. Wallet connections are simulated for demonstration purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}
