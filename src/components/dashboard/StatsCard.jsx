export function StatsCard({
  title,
  value,
  icon: Icon,
  color = "primary",
  subtitle,
}) {
  const colorSchemes = {
    primary: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconBg: 'bg-blue-900',
      iconColor: 'text-white',
      valueColor: 'text-blue-900',
      titleColor: 'text-gray-700',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      iconBg: 'bg-green-700',
      iconColor: 'text-white',
      valueColor: 'text-green-900',
      titleColor: 'text-gray-700',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      iconBg: 'bg-amber-600',
      iconColor: 'text-white',
      valueColor: 'text-amber-900',
      titleColor: 'text-gray-700',
    },
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      iconBg: 'bg-red-700',
      iconColor: 'text-white',
      valueColor: 'text-red-900',
      titleColor: 'text-gray-700',
    },
    slate: {
      bg: 'bg-white',
      border: 'border-gray-200',
      iconBg: 'bg-gray-700',
      iconColor: 'text-white',
      valueColor: 'text-gray-900',
      titleColor: 'text-gray-600',
    },
    zinc: {
      bg: 'bg-white',
      border: 'border-gray-200',
      iconBg: 'bg-gray-600',
      iconColor: 'text-white',
      valueColor: 'text-gray-900',
      titleColor: 'text-gray-600',
    },
  };

  const scheme = colorSchemes[color] || colorSchemes.primary;

  return (
    <div 
      className={`${scheme.bg} ${scheme.border} border rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p 
            className={`text-xs font-bold uppercase tracking-wider mb-3 ${scheme.titleColor}`}
          >
            {title}
          </p>
          <p 
            className={`text-4xl font-bold mb-2 ${scheme.valueColor}`}
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 font-medium">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${scheme.iconBg}`}>
            <Icon className={`w-6 h-6 ${scheme.iconColor}`} />
          </div>
        )}
      </div>
    </div>
  );
}
