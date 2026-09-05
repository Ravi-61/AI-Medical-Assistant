import { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

/**
 * AppLayout provides the authenticated application shell:
 * sidebar (desktop fixed / mobile drawer) + top navbar + content area.
 *
 * This component is rendered INSIDE ProtectedRoute — it does NOT
 * replace authentication checks.
 */
function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuToggle = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleSidebarClose = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />

      {/* Main content area */}
      <div className="app-main">
        <TopNavbar onMenuToggle={handleMenuToggle} />
        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
