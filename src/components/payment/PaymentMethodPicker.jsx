import { FiCreditCard, FiPhone, FiDollarSign } from 'react-icons/fi';

var METHOD_ICONS = {
  stripe: FiCreditCard,
  mpesa_stk: FiPhone,
  mpesa_manual: FiPhone,
  paypal: FiDollarSign,
};

export default function PaymentMethodPicker({ methods, onSelect, selected }) {
  if (!methods || methods.length === 0) {
    return <p className="text-sm text-vibe-text-muted text-center py-8">No payment methods available</p>;
  }

  return (
    <div className="space-y-2">
      {methods.map(function (method) {
        var Icon = METHOD_ICONS[method.method] || FiDollarSign;
        var isSelected = selected === method.method + (method.subType ? '_' + method.subType : '');
        var id = method.method + (method.subType ? '_' + method.subType : '');

        return (
          <button
            key={id}
            onClick={function () { onSelect(id, method); }}
            className={'w-full flex items-center gap-3 p-4 rounded-xl border-2 transition text-left ' + (isSelected ? 'border-vibe-blue bg-vibe-blue/5' : 'border-vibe-gray-light hover:border-vibe-text-muted')}
          >
            <div className="w-10 h-10 rounded-full bg-vibe-gray flex items-center justify-center shrink-0">
              <Icon size={20} className="text-vibe-blue" />
            </div>
            <div>
              <div className="font-semibold text-sm">{method.displayName}</div>
              {method.instructions && (
                <div className="text-xs text-vibe-text-muted mt-0.5 line-clamp-2">{method.instructions}</div>
              )}
              {method.details && method.details.phoneNumber && (
                <div className="text-xs text-vibe-blue mt-0.5">📱 {method.details.phoneNumber}</div>
              )}
              {method.details && method.details.tillNumber && (
                <div className="text-xs text-vibe-blue mt-0.5">🏪 Till: {method.details.tillNumber}</div>
              )}
              {method.details && method.details.paybillNumber && (
                <div className="text-xs text-vibe-blue mt-0.5">🏦 Paybill: {method.details.paybillNumber}</div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}