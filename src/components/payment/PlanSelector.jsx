import { useState } from 'react';
import { FiCheck } from 'react-icons/fi';

var PLANS = [
  { id: 'monthly', name: 'Monthly', price: 'KSh 400', period: '/month', features: ['Blue tick badge', 'Priority support'] },
  { id: 'yearly', name: 'Yearly', price: 'KSh 4,000', period: '/year', save: 'Save 17%', features: ['Blue tick badge', 'Priority support', 'Ad-free experience'], popular: true },
  { id: 'permanent', name: 'Permanent', price: 'KSh 10,000', period: 'one-time', features: ['Blue tick badge forever', 'Priority support', 'Ad-free experience', 'Exclusive badge'], permanent: true },
];

export default function PlanSelector({ onSelect, selected }) {
  return (
    <div className="space-y-3">
      {PLANS.map(function (plan) {
        var isSelected = selected === plan.id;
        return (
          <button
            key={plan.id}
            onClick={function () { onSelect(plan.id); }}
            className={'w-full text-left p-4 rounded-xl border-2 transition ' + (isSelected ? 'border-vibe-blue bg-vibe-blue/5' : 'border-vibe-gray-light hover:border-vibe-text-muted')}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{plan.name}</span>
                {plan.popular && <span className="text-[10px] gradient-bg text-white px-2 py-0.5 rounded-full">POPULAR</span>}
                {plan.permanent && <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full">BEST VALUE</span>}
              </div>
              {isSelected && <FiCheck className="text-vibe-blue" size={20} />}
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-2xl font-bold">{plan.price}</span>
              <span className="text-sm text-vibe-text-muted">{plan.period}</span>
              {plan.save && <span className="text-xs text-green-500 ml-2">{plan.save}</span>}
            </div>
            <div className="space-y-1">
              {plan.features.map(function (f) {
                return (
                  <div key={f} className="flex items-center gap-2 text-sm text-vibe-text-muted">
                    <FiCheck size={14} className="text-green-500" /> {f}
                  </div>
                );
              })}
            </div>
          </button>
        );
      })}
    </div>
  );
}