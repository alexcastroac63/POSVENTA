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

  // Device simulation wrapper in executive light tones
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      <TopNavbar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {deviceMode === 'tablet' ? (
          /* Tablet Android 10" Bezel Simulation for Sofia (Executive Finish) */
          <div className="flex-1 bg-slate-200/70 p-2 sm:p-4 flex items-center justify-center overflow-auto">
            <div className="w-full max-w-5xl bg-white border-8 border-slate-300 rounded-3xl shadow-xl overflow-hidden flex flex-col min-h-[680px] max-h-[90vh] ring-1 ring-slate-400 relative">
              {/* Tablet Top Camera Notch */}
              <div className="h-4 bg-slate-300 flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 border border-slate-300"></span>
              </div>
              <div className="flex-1 flex flex-col overflow-auto bg-slate-50">
                {renderScreen()}
              </div>
            </div>
          </div>
        ) : deviceMode === 'all_in_one' ? (
          /* All-in-One Touch Terminal Frame for Carlos (Executive Silver) */
          <div className="flex-1 bg-slate-200/70 p-2 sm:p-4 flex items-center justify-center overflow-auto">
            <div className="w-full max-w-7xl bg-white border-4 border-slate-300 rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-[720px] max-h-[92vh] ring-1 ring-slate-400">
              <div className="h-6 bg-slate-200 px-3 flex items-center justify-between text-[11px] text-slate-600 font-mono font-medium border-b border-slate-300">
                <span>TERMINAL ALL-IN-ONE TOUCH #01 (BARRA CAJA)</span>
                <span>PANTALLA TÁCTIL 1920x1080 FULL HD</span>
              </div>
              <div className="flex-1 flex flex-col overflow-auto bg-slate-50">
                {renderScreen()}
              </div>
            </div>
          </div>
        ) : deviceMode === 'kds_monitor' ? (
          /* High Legibility KDS Display for Rodrigo */
          <div className="flex-1 bg-slate-200/70 p-2 sm:p-4 flex items-center justify-center overflow-auto">
            <div className="w-full max-w-7xl bg-white border-4 border-amber-400 rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-[720px] max-h-[92vh]">
              <div className="h-6 bg-amber-50 px-3 flex items-center justify-between text-[11px] text-amber-900 font-mono font-bold border-b border-amber-200">
                <span>MONITOR INDUSTRIAL KDS COCINA (PASE & EXPEDICIÓN)</span>
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  ENLACE DE PRODUCCIÓN EN VIVO
                </span>
              </div>
              <div className="flex-1 flex flex-col overflow-auto bg-slate-50">
                {renderScreen()}
              </div>
            </div>
          </div>
        ) : (
          /* Responsive Fluid Mode */
          <div className="flex-1 flex flex-col overflow-auto bg-slate-50">
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
