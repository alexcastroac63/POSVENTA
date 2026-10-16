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
import { CheckCircle, Info } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentScreen, deviceMode, toastMessage } = useRestaurant();

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

  // If in login mode, don't frame with device mockups
  if (currentScreen === 'login') {
    return (
      <main className="min-h-screen bg-slate-900 flex flex-col">
        {renderScreen()}
        {toastMessage && (
          <div className="fixed bottom-4 right-4 z-50 bg-slate-900 border-2 border-emerald-500 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </main>
    );
  }

  // Device simulation wrapper
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100">
      <TopNavbar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {deviceMode === 'tablet' ? (
          /* Tablet Android 10" Bezel Simulation for Sofia */
          <div className="flex-1 bg-slate-950 p-2 sm:p-4 flex items-center justify-center overflow-auto">
            <div className="w-full max-w-5xl bg-slate-900 border-8 border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[680px] max-h-[90vh] ring-1 ring-slate-700 relative">
              {/* Tablet Top Camera Notch */}
              <div className="h-4 bg-slate-800 flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700"></span>
              </div>
              <div className="flex-1 flex flex-col overflow-auto">
                {renderScreen()}
              </div>
            </div>
          </div>
        ) : deviceMode === 'all_in_one' ? (
          /* All-in-One Touch Terminal Frame for Carlos */
          <div className="flex-1 bg-slate-950 p-2 sm:p-4 flex items-center justify-center overflow-auto">
            <div className="w-full max-w-7xl bg-slate-900 border-4 border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col min-h-[720px] max-h-[92vh] ring-2 ring-emerald-500/20">
              <div className="h-5 bg-slate-800/90 px-3 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>TERMINAL ALL-IN-ONE TOUCH #01 (BARRA CAJA)</span>
                <span>RESOLUCIÓN 1920x1080 TOUCHSCREEN</span>
              </div>
              <div className="flex-1 flex flex-col overflow-auto">
                {renderScreen()}
              </div>
            </div>
          </div>
        ) : deviceMode === 'kds_monitor' ? (
          /* High Contrast Industrial KDS Display for Rodrigo */
          <div className="flex-1 bg-black p-2 sm:p-4 flex items-center justify-center overflow-auto">
            <div className="w-full max-w-7xl bg-slate-950 border-4 border-amber-600/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col min-h-[720px] max-h-[92vh]">
              <div className="h-5 bg-amber-950/80 px-3 flex items-center justify-between text-[10px] text-amber-300 font-mono font-bold">
                <span>MONITOR INDUSTRIAL KDS COCINA (PASE & EXPEDICIÓN)</span>
                <span className="animate-pulse">● ENLACE DE PRODUCCIÓN EN VIVO</span>
              </div>
              <div className="flex-1 flex flex-col overflow-auto">
                {renderScreen()}
              </div>
            </div>
          </div>
        ) : (
          /* Responsive Fluid Mode */
          <div className="flex-1 flex flex-col overflow-auto">
            {renderScreen()}
          </div>
        )}
      </main>

      {/* Global Modals */}
      <PreBillModal />
      <SplitBillModal />
      <PaymentModal />
      <DiscountAuthModal />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 border-2 border-emerald-500 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
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
