import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const cryptos = [
    { id: 1, name: 'Bitcoin', symbol: 'BTC', price: 90000, change: 1.8, holdings: 0.15 },
    { id: 2, name: 'Ethereum', symbol: 'ETH', price: 3000, change: -2.1, holdings: 2.5 },
    { id: 3, name: 'XRP', symbol: 'XRP', price: 2.10, change: 12.5, holdings: 1500 },
    { id: 4, name: 'Solana', symbol: 'SOL', price: 135, change: -3.4, holdings: 8 },
  ];

   const priceChartData = [
    { date: 'Nov 21', BTC: 5000, ETH: 2850, SOL: 145, XRP: 1.75 },
    { date: 'Nov 22', BTC: 4000, ETH: 2920, SOL: 152, XRP: 1.68 },  
    { date: 'Nov 23', BTC: 6000, ETH: 2780, SOL: 148, XRP: 1.82 },  
    { date: 'Nov 24', BTC: 6500, ETH: 3050, SOL: 158, XRP: 1.95 },  
    { date: 'Nov 25', BTC: 6800, ETH: 3180, SOL: 162, XRP: 2.12 },  
    { date: 'Nov 26', BTC: 7000, ETH: 2990, SOL: 138, XRP: 2.05 },  
    { date: 'Nov 27', BTC: 6500, ETH: 3000, SOL: 135, XRP: 2.10 },  
  ];

  const recentTransactions = [
    { id: 1, type: 'Buy', crypto: 'XRP', amount: 500, price: 1.95, date: 'Nov 27, 10:30 AM' },
    { id: 2, type: 'Buy', crypto: 'SOL', amount: 3, price: 140, date: 'Nov 27, 8:15 AM' },
    { id: 3, type: 'Sell', crypto: 'BTC', amount: 0.05, price: 88500, date: 'Nov 26, 4:45 PM' },
    { id: 4, type: 'Buy', crypto: 'ETH', amount: 1, price: 2980, date: 'Nov 26, 2:20 PM' },
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Page Title */}
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-500 mb-8">Welcome back!</p>

        {/* 3 Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">Total Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">$18,850</p>
              <p className="text-green-600 text-sm mt-2">+7.0% ($1,240)</p>
            </CardContent>
          </Card>

          <Card  className="hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">24h Change</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">+$485</p>
              <p className="text-gray-500 text-sm mt-2">+2.6% from yesterday</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">Total Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{cryptos.length}</p>
              <p className="text-gray-500 text-sm mt-2">Cryptocurrencies</p>
            </CardContent>
          </Card>

        </div>

         {/* Price Chart */}
        <Card className="mb-8 hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Price Trends (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={priceChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="BTC" stroke="#F7931A" strokeWidth={2} name="Bitcoin" />
                <Line type="monotone" dataKey="ETH" stroke="#627EEA" strokeWidth={2} name="Ethereum" />
                <Line type="monotone" dataKey="SOL" stroke="#14F195" strokeWidth={2} name="Solana" />
                <Line type="monotone" dataKey="XRP" stroke="#23292F" strokeWidth={2} name="XRP" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

         {/* Two Column Layout: Holdings + Recent Transactions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Holdings List */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Your Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            
            {cryptos.map((crypto) => {
              const isPositive = crypto.change >= 0;
              
              let textColor = '';
              if (isPositive) {
                textColor = 'text-green-600';
              } else {
                textColor = 'text-red-600';
              }
              
              let sign = '';
              if (isPositive) {
                sign = '+';
              }
              
              return (
                <div key={crypto.id} className="flex justify-between items-center p-4 hover:bg-gray-100 rounded transition-colors duration-200 cursor-pointer">
                  <div>
                    <p className="font-bold">{crypto.name}</p>
                    <p className="text-sm text-gray-500">{crypto.holdings} {crypto.symbol}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${crypto.price.toLocaleString()}</p>
                    <p className={`text-sm ${textColor}`}>
                      {sign}{crypto.change}%
                    </p>
                  </div>
                </div>
              );
            })}

          </CardContent>
        </Card>

        
        {/* Recent Transactions */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center p-4 hover:bg-gray-100 rounded transition-colors duration-200 cursor-pointer">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        transaction.type === 'Buy' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {transaction.type}
                      </span>
                      <span className="font-bold">{transaction.crypto}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{transaction.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{transaction.amount} {transaction.crypto}</p>
                    <p className="text-sm text-gray-500">@${transaction.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}

            </CardContent>
          </Card>
        </div>


      </div>
    </div>
  );
}