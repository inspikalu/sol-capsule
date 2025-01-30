import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Package, Plus, Lock, LayoutDashboard, Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();
    console.log(location)

    const navigationItems = [
        {
            icon: LayoutDashboard,
            name: 'Dashboard',
            path: '/dashboard',
            exact: true
        },
        {
            icon: Plus,
            name: 'Create Capsule',
            path: '/dashboard/create'
        },
        {
            icon: Package,
            name: 'Marketplace',
            path: '/dashboard/marketplace'
        },
        {
            icon: Lock,
            name: 'Unlock Capsules',
            path: '/dashboard/unlock'
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-40 h-screen transition-transform bg-slate-800/50 backdrop-blur-lg border-r border-slate-700",
                    isSidebarOpen ? "w-64" : "w-16",
                )}
            >
                {/* Logo */}
                <div className="px-6 py-8">
                    <Link to="/" className="flex items-center">
                        {isSidebarOpen ? (
                            <span className="text-2xl font-semibold tracking-tight text-slate-100">
                                Temporal Vault
                            </span>
                        ) : (
                            <span className="text-2xl font-semibold tracking-tight text-slate-100">TV</span>
                        )}
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="px-4 space-y-2">
                    {navigationItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.exact}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center px-2 py-3 rounded-lg transition-colors",
                                    "hover:bg-slate-700/50",
                                    isActive
                                        ? "bg-amber-500/10 text-amber-500"
                                        : "text-slate-300 hover:text-slate-100"
                                )
                            }
                        >
                            <item.icon className="h-5 w-5" />
                            {isSidebarOpen && <span className="ml-3">{item.name}</span>}
                        </NavLink>
                    ))}
                    <appkit-button />
                </nav>

                {/* Toggle Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute bottom-4 right-4 h-8 w-8 rounded-full hover:bg-slate-700/50"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    {isSidebarOpen ? (
                        <X className="h-4 w-4 text-slate-300" />
                    ) : (
                        <Menu className="h-4 w-4 text-slate-300" />
                    )}
                </Button>
            </aside>

            {/* Main Content */}
            <main
                className={cn(
                    "transition-all duration-200",
                    isSidebarOpen ? "ml-64" : "ml-16"
                )}
            >
                <div className="container mx-auto p-8">
                    <Outlet />
                </div>
            </main>

            {/* Decorative Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
};

export default DashboardLayout;