// src/routes/AppRoutes.jsx

import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

import Home from '../pages/feed/Home';
import Explore from '../pages/explore/Explore';
import Reels from '../pages/reels/Reels';
import Messages from '../pages/messages/Messages';
import Chat from '../pages/messages/Chat';
import Marketplace from '../pages/marketplace/Marketplace';
import MarketplaceDetail from '../pages/marketplace/MarketplaceDetail';
import Groups from '../pages/groups/Groups';
import GroupDetail from '../pages/groups/GroupDetail';
import Profile from '../pages/profile/Profile';
import EditProfile from '../pages/profile/EditProfile';
import StoryViewerPage from '../pages/stories/StoryViewerPage';
import Notifications from '../pages/notifications/Notifications';
import Settings from '../pages/settings/Settings';
import Verification from '../pages/verification/Verification';
import Payment from '../pages/payment/Payment';

function AuthGuard({ children }) {
  var token = useAuthStore(function (s) { return s.token; });
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function GuestGuard({ children }) {
  var token = useAuthStore(function (s) { return s.token; });
  if (token) return <Navigate to="/" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestGuard><AuthLayout /></GuestGuard>}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route element={<AuthGuard><MainLayout /></AuthGuard>}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/reels" element={<Reels />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/:id" element={<Chat />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/marketplace/:id" element={<MarketplaceDetail />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/groups/:id" element={<GroupDetail />} />
        <Route path="/stories/:userId" element={<StoryViewerPage />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/profile" element={<EditProfile />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/saved" element={<Home />} />
        <Route path="/:username" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}