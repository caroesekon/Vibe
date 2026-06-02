// src/pages/verification/Verification.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import useAuthStore from '../../store/useAuthStore';
import PlanSelector from '../../components/payment/PlanSelector';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

export default function Verification() {
  var navigate = useNavigate();
  var searchParams = useSearchParams();
  var user = useAuthStore(function (s) { return s.user; });

  var planState = useState('monthly');
  var plan = planState[0];
  var setPlan = planState[1];

  var loadState = useState(true);
  var loading = loadState[0];
  var setLoading = loadState[1];

  var statusState = useState(null);
  var status = statusState[0];
  var setStatus = statusState[1];

  var applyLoadState = useState(false);
  var applyLoading = applyLoadState[0];
  var setApplyLoading = applyLoadState[1];

  useEffect(function () {
    var success = searchParams[0].get('success');
    if (success === 'true') toast.success('Payment successful! Awaiting admin approval.');

    API.get(ENDPOINTS.VERIFICATION.STATUS)
      .then(function (res) { setStatus(res.data.data); })
      .catch(function () {})
      .finally(function () { setLoading(false); });
  }, []);

  var handleApply = async function () {
    setApplyLoading(true);
    try {
      await API.post(ENDPOINTS.VERIFICATION.APPLY, { plan: plan });
      navigate('/payment', { state: { plan: plan } });
    } catch (err) {
      var msg = 'Failed to apply';
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      toast.error(msg);
    }
    setApplyLoading(false);
  };

  if (loading) return <Loader className="py-20" />;

  var alreadyVerified = status && status.isVerified;
  var pending = status && (status.verificationStatus === 'payment_pending' || status.verificationStatus === 'pending_review');
  var rejected = status && status.verificationStatus === 'rejected';

  return (
    <div style={{ paddingBottom: 64 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC', marginBottom: 8 }}>Get Verified</h2>
      <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 24 }}>Get the blue checkmark and stand out on Vibe.</p>

      {alreadyVerified ? (
        <div style={{ background: '#0F172A', borderRadius: 16, padding: 32, border: '1px solid #1E293B', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 40 }}>✅</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#F8FAFC', marginBottom: 8 }}>You're Verified!</h3>
          <p style={{ color: '#94A3B8', fontSize: 14 }}>Your account has the blue checkmark.</p>
        </div>
      ) : pending ? (
        <div style={{ background: '#0F172A', borderRadius: 16, padding: 32, border: '1px solid #1E293B', textAlign: 'center' }}>
          <div style={{ fontSize: 60, marginBottom: 12 }}>⏳</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#F8FAFC', marginBottom: 8 }}>Pending Review</h3>
          <p style={{ color: '#94A3B8', fontSize: 14 }}>Your verification is being reviewed. This usually takes 24 hours.</p>
        </div>
      ) : rejected ? (
        <div style={{ background: '#0F172A', borderRadius: 16, padding: 32, border: '1px solid #1E293B', textAlign: 'center' }}>
          <div style={{ fontSize: 60, marginBottom: 12 }}>❌</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#F8FAFC', marginBottom: 8 }}>Verification Rejected</h3>
          <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 16 }}>Your application was not approved. You can apply again.</p>
        </div>
      ) : (
        <div>
          <PlanSelector selected={plan} onSelect={function (p) { setPlan(p); }} />
          <Button onClick={handleApply} loading={applyLoading} size="lg" style={{ marginTop: 16, width: '100%' }}>
            Continue to Payment
          </Button>
        </div>
      )}
    </div>
  );
}