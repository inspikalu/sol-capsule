import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom"
import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import "./main.css"

// Page Imports
import LandingPage from './pages/LandingPage'
import DashboardLayout from './layouts/DashboardLayout'
import DashboardHome from './pages/dashboard/DashboardHome'
import CreateCapsule from './pages/dashboard/CreateCapsule'
import Marketplace from './pages/dashboard/Marketplace'
import UnlockCapsule from './pages/dashboard/UnlockCapsule'
import CapsuleDetails from './pages/dashboard/CapsuleDetails'
import { Toaster } from 'sonner'

import { Buffer } from 'buffer'
import process from 'process'

window.global = window
window.process = process
window.Buffer = Buffer

// 0. Set up Solana Adapter
const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()]
})

// 1. Get projectId from https://cloud.reown.com
export const projectId = import.meta.env.VITE_PROJECT_ID || "b56e18d47c72ab683b10814fe9495694"

// 2. Create a metadata object
const metadata = {
  name: 'Temporal Vault',
  description: 'Secure Your Digital Legacy in Immutable Time',
  url: 'https://example.com',
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// 3. Create AppKit modal
createAppKit({
  adapters: [solanaWeb3JsAdapter],
  networks: [solana, solanaTestnet, solanaDevnet],
  metadata: metadata,
  projectId,
  features: {
    analytics: true
  },
  themeVariables: {
    "--w3m-accent": "#ffffff",
    "--w3m-color-mix": "#f59e0b"
  }
})

// 4. Define routes with authentication check
const AuthCheck = ({ children }: { children: React.ReactNode }) => {
  // Replace this with your actual auth check logic
  const isAuthenticated = true; // For example purposes

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// 5. Create router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />
  },
  {
    path: "/settings",
    element: <App />
  },
  {
    path: "/dashboard",
    element: (
      <AuthCheck>
        <DashboardLayout />
      </AuthCheck>
    ),
    children: [
      {
        index: true,
        element: <DashboardHome />
      },
      {
        path: "create",
        element: <CreateCapsule />
      },
      {
        path: "marketplace",
        element: <Marketplace />
      },
      {
        path: "unlock",
        element: <UnlockCapsule />
      },
      {
        path: "capsule/:id",
        element: <CapsuleDetails />
      }
    ]
  }
]);

// 6. Render app
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  </StrictMode>
);