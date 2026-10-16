/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import { TopNavbar } from './components/layout/TopNavbar';
import { LoginScreen } from './components/auth/LoginScreen';
import { ChannelSelectScreen } from './components/channel/ChannelSelectScreen';
import { TableManagementScreen } from './components/tables/TableManagementScreen';
import { PosOrderingScreen } from './components/pos/PosOrderingScreen';
import { KitchenDisplayScreen } from './components/kds/KitchenDisplayScreen';
import { CashierManagementScreen } from './components/cashier/CashierManagementScreen';
import { ReportsAuditScreen } from './components/reports/ReportsAuditScreen';
import { SprintAndDevOpsHub } from './components/devops/SprintAndDevOpsHub';
import { PreBillModal } from './components/pos/PreBillModal';
import { SplitBillModal } from './components/pos/SplitBillModal';
import { PaymentModal } from './components/pos/PaymentModal';
import { DiscountAuthModal } from './components/pos/DiscountAuthModal';
import { CheckCircle } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentScreen, toastMessage } = useRestaurant();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen />;
      case 'channel_select':
        return <ChannelSelectScreen />;
      case 'table_map':
        return <TableManagementScreen />;
      case 'pos_order':
        return <PosOrderingScreen />;
      case 'kds':
        return <KitchenDisplayScreen />;
      case 'cashier':
        return <CashierManagementScreen />;
      case 'reports':
        return <ReportsAuditScreen />;
      case 'sprint_devops':
        return <SprintAndDevOpsHub />;
      default:
        return <ChannelSelectScreen />;
    }
  };

  if (currentScreen === 'login') {
    return (
      <main className="min-h-screen bg-slate-100 flex flex-col font-sans">
        {renderScreen()}
        {toastMessage && (
          <div className="fixed bottom-4 right-4 z-50 bg-white border-2 border-emerald-600 text-slate-900 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold animate-bounce">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}
      </main>
    );
  }

  // Clean native full-screen layout without artificial laptop/device frames
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <TopNavbar />

      <main className="flex-1 flex flex-col overflow-auto bg-slate-50">
        {renderScreen()}
      </main>

      {/* Global Modals */}
      <PreBillModal />
      <SplitBillModal />
      <PaymentModal />
      <DiscountAuthModal />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-white border-2 border-emerald-600 text-slate-900 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <RestaurantProvider>
      <MainContent />
    </RestaurantProvider>
  );
}
