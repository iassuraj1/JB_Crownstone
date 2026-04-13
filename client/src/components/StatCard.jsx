const StatCard = ({ title, value, subtitle, icon, trend, trendValue, color = 'gold' }) => {
  const colorMap = {
    gold: 'text-gold border-gold/20 bg-gold/5',
    profit: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5',
    loss: 'text-red-400 border-red-400/20 bg-red-400/5',
    blue: 'text-blue-400 border-blue-400/20 bg-blue-400/5',
    purple: 'text-purple-400 border-purple-400/20 bg-purple-400/5',
  };

  const isPositiveTrend = trendValue && parseFloat(trendValue) >= 0;

  return (
    <div className={`stat-card border ${colorMap[color] || colorMap.gold} transition-all duration-300 hover:scale-[1.02]`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-lg ${colorMap[color]} border flex items-center justify-center text-lg`}>
          {icon}
        </div>
        {trendValue !== undefined && (
          <span className={`text-xs font-medium px-2 py-1 rounded ${
            isPositiveTrend ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'
          }`}>
            {isPositiveTrend ? '▲' : '▼'} {Math.abs(parseFloat(trendValue)).toFixed(1)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-gray-500 text-xs mb-1.5 uppercase tracking-wider">{title}</p>
        <p className="text-white text-2xl font-semibold mb-1">{value}</p>
        {subtitle && (
          <p className={`text-xs ${color === 'profit' ? 'text-emerald-400' : color === 'loss' ? 'text-red-400' : 'text-gray-500'}`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
