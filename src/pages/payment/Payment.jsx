// src/pages/payment/Payment.jsx

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiAlertTriangle, FiClock, FiPhone, FiCopy, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

export default function Payment() {
  var location = useLocation();
  var navigate = useNavigate();
  var plan = (location.state && location.state.plan) ? location.state.plan : 'monthly';

  var methodsState = useState([]);
  var methods = methodsState[0];
  var setMethods = methodsState[1];

  var selectedState = useState('');
  var selected = selectedState[0];
  var setSelected = selectedState[1];

  var selectedMethodState = useState(null);
  var selectedMethod = selectedMethodState[0];
  var setSelectedMethod = selectedMethodState[1];

  var loadState = useState(true);
  var loading = loadState[0];
  var setLoading = loadState[1];

  var payLoadState = useState(false);
  var payLoading = payLoadState[0];
  var setPayLoading = payLoadState[1];

  var copiedState = useState(false);
  var copied = copiedState[0];
  var setCopied = copiedState[1];

  var planPrices = {
    monthly: { KSh: '400', USD: '4.99' },
    yearly: { KSh: '4,000', USD: '39.99' },
    permanent: { KSh: '10,000', USD: '99.99' },
  };

  useEffect(function () {
    API.get(ENDPOINTS.PAYMENT.METHODS)
      .then(function (res) { setMethods(res.data.data || []); })
      .catch(function () {})
      .finally(function () { setLoading(false); });
  }, []);

  var handlePay = async function () {
    if (!selected || !selectedMethod) return toast.error('Select a payment method');
    setPayLoading(true);

    try {
      // STRIPE
      if (selectedMethod.method === 'stripe') {
        var stripeRes = await API.post(ENDPOINTS.PAYMENT.STRIPE_CHECKOUT, { plan: plan });
        window.location.href = stripeRes.data.data.url;
        return;
      }

      // PAYPAL
      if (selectedMethod.method === 'paypal') {
        toast.error('PayPal integration coming soon');
        setPayLoading(false);
        return;
      }

      // M-PESA STK PUSH
      if (selectedMethod.method === 'mpesa_stk') {
        var phone = prompt('Enter your M-Pesa phone number:\n\nFormat: 0712345678 or +254712345678');
        if (!phone) { setPayLoading(false); return; }
        if (!phone.match(/^(\+?254|0)?[7]\d{8}$/)) {
          toast.error('Invalid phone number. Use format: 0712345678');
          setPayLoading(false);
          return;
        }
        await API.post(ENDPOINTS.PAYMENT.MPESA_STK, { phone: phone, plan: plan });
        toast.success('📱 STK Push sent! Check your phone and enter your M-Pesa PIN.');
        navigate('/verification');
        return;
      }

      // MANUAL METHODS
      if (selectedMethod.method === 'manual') {
        await API.post(ENDPOINTS.PAYMENT.MPESA_MANUAL, {
          plan: plan,
          method: selectedMethod.subType || 'send_money',
        });
        toast.success('Payment submitted! Awaiting admin approval.');
        navigate('/verification');
        return;
      }

    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    }
    setPayLoading(false);
  };

  var copyToClipboard = function (text) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(function () { setCopied(false); }, 2000);
  };

  var getPlanPrice = function (currency) {
    var p = planPrices[plan] || planPrices.monthly;
    return p[currency] || p.KSh;
  };

  if (loading) return <Loader className="py-20" />;

  return (
    <div style={{ paddingBottom: 64 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC', marginBottom: 4 }}>Payment</h2>
      <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 8 }}>
        <span style={{ color: '#3B82F6', fontWeight: 600, textTransform: 'capitalize' }}>{plan}</span> plan
      </p>

      {/* Warning */}
      <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: 12, marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <FiAlertTriangle size={18} color="#F59E0B" style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#F59E0B', marginBottom: 4 }}>Important</div>
          <div style={{ fontSize: 12, color: '#FCD34D', lineHeight: 1.5 }}>
            Payments without proof (M-Pesa message/SMS) will be <strong>auto-rejected within 3 hours</strong>. Make sure to send the exact amount and keep your confirmation message.
          </div>
        </div>
      </div>

      {methods.length === 0 ? (
        <div style={{ background: '#0F172A', borderRadius: 16, padding: 32, border: '1px solid #1E293B', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💳</div>
          <h3 style={{ fontSize: 17, fontWeight: 600, color: '#F8FAFC', marginBottom: 8 }}>No payment methods available</h3>
          <p style={{ color: '#94A3B8', fontSize: 13 }}>Payment methods are being configured. Please check back later.</p>
        </div>
      ) : (
        <>
          {/* Method Picker */}
          <div style={{ marginBottom: 20 }}>
            {methods.map(function (method) {
              var id = method.method + (method.subType ? '_' + method.subType : '');
              var isSelected = selected === id;

              return (
                <div key={id} style={{ marginBottom: 8 }}>
                  <button
                    onClick={function () { setSelected(id); setSelectedMethod(method); }}
                    style={{
                      width: '100%', textAlign: 'left', padding: 14, borderRadius: 14,
                      border: isSelected ? '2px solid #3B82F6' : '1px solid #1E293B',
                      background: isSelected ? 'rgba(59,130,246,0.08)' : '#0F172A',
                      cursor: 'pointer', color: '#F8FAFC',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 20 }}>
                          {method.method === 'stripe' ? '💳' : method.method === 'mpesa_stk' ? '📱' : method.method === 'paypal' ? '🅿️' : '🏦'}
                        </span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{method.displayName}</div>
                          {method.instructions && (
                            <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{method.instructions}</div>
                          )}
                        </div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#3B82F6' }}>
                        {method.activeCurrency || 'KSh'} {getPlanPrice(method.activeCurrency || 'KSh')}
                      </div>
                    </div>
                  </button>

                  {/* Manual payment instructions */}
                  {isSelected && method.method === 'manual' && method.subType === 'send_money' && (
                    <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 12, padding: 14, marginTop: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#F8FAFC', marginBottom: 10 }}>📱 How to Pay via Send Money</div>
                      <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#CBD5E1', lineHeight: 2 }}>
                        <li>Go to <strong>M-Pesa</strong> on your phone</li>
                        <li>Select <strong>Send Money</strong></li>
                        <li>Enter phone number:{' '}
                          <span style={{ background: '#1E293B', padding: '3px 8px', borderRadius: 6, color: '#F8FAFC', fontWeight: 600 }}>
                            {selectedMethod.details && selectedMethod.details.phoneNumber || '0768784909'}
                          </span>
                          <button onClick={function () { copyToClipboard(selectedMethod.details && selectedMethod.details.phoneNumber || '0768784909'); }} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', padding: 4, marginLeft: 4 }}>
                            {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
                          </button>
                        </li>
                        <li>Enter amount: <strong>{selectedMethod.activeCurrency || 'KSh'} {getPlanPrice(selectedMethod.activeCurrency || 'KSh')}</strong></li>
                        <li>Enter your M-Pesa PIN and confirm</li>
                        <li>Keep the <strong>M-Pesa confirmation SMS</strong> — you'll need it for verification</li>
                      </ol>
                      <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: 10, marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
                        <FiAlertTriangle size={14} color="#EF4444" />
                        <span style={{ fontSize: 11, color: '#FCA5A5' }}>After sending, click <strong>"Pay Now"</strong> below to submit. Your payment will be auto-rejected if no proof is uploaded within 3 hours.</span>
                      </div>
                    </div>
                  )}

                  {isSelected && method.method === 'manual' && method.subType === 'paybill' && (
                    <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 12, padding: 14, marginTop: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#F8FAFC', marginBottom: 10 }}>🏦 How to Pay via Paybill</div>
                      <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#CBD5E1', lineHeight: 2 }}>
                        <li>Go to <strong>M-Pesa</strong> → <strong>Lipa na M-Pesa</strong> → <strong>Paybill</strong></li>
                        <li>Business Number:{' '}
                          <span style={{ background: '#1E293B', padding: '3px 8px', borderRadius: 6, color: '#F8FAFC', fontWeight: 600 }}>
                            {selectedMethod.details && selectedMethod.details.paybillNumber || '247247'}
                          </span>
                          <button onClick={function () { copyToClipboard(selectedMethod.details && selectedMethod.details.paybillNumber || '247247'); }} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', padding: 4, marginLeft: 4 }}>
                            {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
                          </button>
                        </li>
                        <li>Account Number:{' '}
                          <span style={{ background: '#1E293B', padding: '3px 8px', borderRadius: 6, color: '#F8FAFC', fontWeight: 600 }}>
                            {selectedMethod.details && selectedMethod.details.accountNumber || 'Your Name'}
                          </span>
                        </li>
                        <li>Amount: <strong>{selectedMethod.activeCurrency || 'KSh'} {getPlanPrice(selectedMethod.activeCurrency || 'KSh')}</strong></li>
                        <li>Enter PIN and confirm</li>
                      </ol>
                      <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: 10, marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
                        <FiAlertTriangle size={14} color="#EF4444" />
                        <span style={{ fontSize: 11, color: '#FCA5A5' }}>Auto-rejected in 3 hours without confirmation SMS.</span>
                      </div>
                    </div>
                  )}

                  {isSelected && method.method === 'manual' && method.subType === 'till' && (
                    <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 12, padding: 14, marginTop: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#F8FAFC', marginBottom: 10 }}>🏪 How to Pay via Till Number</div>
                      <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#CBD5E1', lineHeight: 2 }}>
                        <li>Go to <strong>M-Pesa</strong> → <strong>Lipa na M-Pesa</strong> → <strong>Buy Goods</strong></li>
                        <li>Till Number:{' '}
                          <span style={{ background: '#1E293B', padding: '3px 8px', borderRadius: 6, color: '#F8FAFC', fontWeight: 600 }}>
                            {selectedMethod.details && selectedMethod.details.tillNumber || '123456'}
                          </span>
                          <button onClick={function () { copyToClipboard(selectedMethod.details && selectedMethod.details.tillNumber || '123456'); }} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', padding: 4, marginLeft: 4 }}>
                            {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
                          </button>
                        </li>
                        <li>Amount: <strong>{selectedMethod.activeCurrency || 'KSh'} {getPlanPrice(selectedMethod.activeCurrency || 'KSh')}</strong></li>
                        <li>Enter PIN and confirm</li>
                      </ol>
                      <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: 10, marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
                        <FiAlertTriangle size={14} color="#EF4444" />
                        <span style={{ fontSize: 11, color: '#FCA5A5' }}>Auto-rejected in 3 hours without confirmation SMS.</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Button onClick={handlePay} loading={payLoading} disabled={!selected} size="lg" style={{ width: '100%' }}>
            {payLoading ? 'Processing...' : selectedMethod && selectedMethod.method === 'stripe' ? 'Pay with Card' : selectedMethod && selectedMethod.method === 'mpesa_stk' ? 'Send STK Push' : selectedMethod && selectedMethod.method === 'manual' ? 'I Have Paid — Submit for Review' : 'Pay Now'}
          </Button>
        </>
      )}
    </div>
  );
}