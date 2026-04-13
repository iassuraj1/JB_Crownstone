const ForexPanel = ({ assets }) => {
  if (!assets || assets.length === 0) {
    return (
      <div className="text-gray-600 text-sm text-center py-8">No asset data</div>
    );
  }

  return (
    <div className="space-y-2">
      {assets.map((asset) => {
        const isProfit = asset.profit >= 0;
        const isPositiveChange = asset.change >= 0;

        return (
          <div
            key={asset.symbol}
            className="flex items-center justify-between p-3 rounded-lg bg-dark-surface border border-dark-border hover:border-gold/20 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              {/* Type badge */}
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{
                  background: asset.type === 'forex' ? 'rgba(59,130,246,0.15)' :
                    asset.type === 'crypto' ? 'rgba(168,85,247,0.15)' : 'rgba(212,175,55,0.15)',
                  color: asset.type === 'forex' ? '#60A5FA' :
                    asset.type === 'crypto' ? '#C084FC' : '#D4AF37'
                }}
              >
                {asset.type === 'forex' ? 'FX' : asset.type === 'crypto' ? '₿' : '◆'}
              </div>
              <div>
                <p className="text-white text-sm font-medium">{asset.symbol}</p>
                <p className="text-gray-600 text-xs">{asset.bid?.toFixed(asset.type === 'forex' ? 5 : 2)}</p>
              </div>
            </div>

            <div className="text-right">
              <p className={`text-sm font-semibold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                {isProfit ? '+' : ''}${asset.profit?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className={`text-xs ${isPositiveChange ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPositiveChange ? '▲' : '▼'} {Math.abs(asset.changePercent).toFixed(2)}%
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ForexPanel;
