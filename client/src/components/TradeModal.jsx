const TradeModal = ({ trades, onClose, strategyName }) => {
  if (!trades) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-3xl card border-gold/20 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white font-semibold text-lg">Active Trades</h2>
            <p className="text-gray-500 text-xs mt-0.5">{strategyName} · {trades.length} positions open</p>
          </div>
          <button
            id="close-trade-modal"
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                {['Symbol', 'Type', 'Lots', 'Open Price', 'Current', 'P/L', 'Open Time'].map(h => (
                  <th key={h} className="text-left text-gray-500 text-xs uppercase tracking-wider py-3 pr-4 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trades.map((trade, i) => {
                const isProfit = trade.profit >= 0;
                return (
                  <tr
                    key={i}
                    className="border-b border-dark-border/50 hover:bg-dark-hover transition-colors"
                  >
                    <td className="py-3.5 pr-4">
                      <span className="text-white text-sm font-medium">{trade.symbol}</span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        trade.type === 'BUY'
                          ? 'text-emerald-400 bg-emerald-400/10'
                          : 'text-red-400 bg-red-400/10'
                      }`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-gray-400 text-sm">{trade.lots}</td>
                    <td className="py-3.5 pr-4 text-gray-400 text-sm">{trade.openPrice?.toFixed(trade.symbol.includes('USD') && !trade.symbol.startsWith('XAU') && !trade.symbol.startsWith('BTC') && !trade.symbol.startsWith('US') ? 5 : 2)}</td>
                    <td className="py-3.5 pr-4 text-gray-400 text-sm">{trade.currentPrice?.toFixed(trade.symbol.includes('USD') && !trade.symbol.startsWith('XAU') && !trade.symbol.startsWith('BTC') && !trade.symbol.startsWith('US') ? 5 : 2)}</td>
                    <td className="py-3.5 pr-4">
                      <span className={`text-sm font-semibold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isProfit ? '+' : ''}${trade.profit?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-3.5 text-gray-600 text-xs">{trade.openTime}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-dark-border">
                <td colSpan={5} className="py-3 text-gray-500 text-xs font-medium">Total Floating P/L</td>
                <td className="py-3">
                  {(() => {
                    const total = trades.reduce((sum, t) => sum + (t.profit || 0), 0);
                    return (
                      <span className={`text-sm font-bold ${total >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {total >= 0 ? '+' : ''}${total.toFixed(2)}
                      </span>
                    );
                  })()}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TradeModal;
