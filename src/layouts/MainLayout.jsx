import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import MobileNav from './MobileNav';
import Navbar from '../components/common/Navbar';

export default function MainLayout() {
  var showMobileState = useState(false);
  var showMobileMenu = showMobileState[0];
  var setShowMobileMenu = showMobileState[1];

  return (
    <div style={{ minHeight: '100vh', background: '#020617' }}>
      <Navbar onMenuToggle={function () { setShowMobileMenu(!showMobileMenu); }} />

      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 56 }}>
        <LeftSidebar showMobile={showMobileMenu} onClose={function () { setShowMobileMenu(false); }} />

        <main style={{ width: '100%', maxWidth: 640, padding: '16px', paddingBottom: 80 }}>
          <Outlet />
        </main>

        <RightSidebar />
      </div>

      <MobileNav />
    </div>
  );
}