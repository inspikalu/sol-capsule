import { useAppKit, useAppKitAccount, useWalletInfo } from '@reown/appkit/react';
import { Clock, Package, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import truncateAddress from '@/lib/truncateWallet';


interface Feature {
    icon: typeof Clock | typeof Package | typeof Lock;
    title: string;
    description: string;
}


const LandingPage = () => {
    const { open } = useAppKit()
    const { address, isConnected } = useAppKitAccount()
    console.log(address)

    const features: Feature[] = [
        {
            icon: Lock,
            title: "Enterprise-Grade Security",
            description: "Advanced encryption protocols secure your digital assets on the Solana blockchain until their scheduled release date."
        },
        {
            icon: Package,
            title: "Digital Asset Exchange",
            description: "Access our curated marketplace for time-locked digital assets, each representing a unique future revelation."
        },
        {
            icon: Clock,
            title: "Temporal Asset Management",
            description: "Implement precise time-release mechanisms for your digital holdings with customizable scheduling options."
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black text-slate-100">
            <nav className="container mx-auto px-6 py-8">
                <div className="flex justify-between items-center">
                    <div className="text-2xl font-semibold tracking-tight">
                        Temporal Vault
                    </div>
                    <div className='text-white'>
                        <button
                            onClick={() => open()}
                            className="bg-amber-500 text-slate-900 px-6 py-2 rounded-lg text-lg font-semibold 
                transition-all hover:bg-amber-600 hover:shadow-lg focus:outline-none focus:ring-2 
                focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                        >
                            {isConnected && address ? truncateAddress(address) : "Connect Wallet"}
                        </button>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-6 py-24">
                <section className="text-center mb-32">
                    <h1 className="text-6xl font-bold mb-8 tracking-tight">
                        Secure Your Digital Legacy in
                        <span className="block text-amber-500 mt-2">Immutable Time</span>
                    </h1>
                    <p className="text-xl mb-12 text-slate-300 max-w-3xl mx-auto leading-relaxed">
                        Leverage blockchain technology to create time-locked digital vaults on the Solana network.
                        Preserve assets, documents, and messages with precise temporal control over their accessibility.
                    </p>
                    <Link to={"/dashboard/create"} className="bg-amber-500 text-slate-900 px-10 py-4 rounded-lg text-lg font-semibold 
            transition-all hover:bg-amber-600 hover:shadow-lg focus:outline-none focus:ring-2 
            focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900">
                        Create Your Capsule
                    </Link>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-slate-800 bg-opacity-50 p-8 rounded-xl backdrop-blur-sm
                border border-slate-700 transition-all hover:border-amber-500/30"
                        >
                            <div className="text-amber-500 mb-6">
                                <feature.icon size={40} />
                            </div>
                            <h3 className="text-2xl font-semibold mb-4 tracking-tight">
                                {feature.title}
                            </h3>
                            <p className="text-slate-300 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </section>
            </main>

            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl"></div>
            </div>

        </div>
    );
};

export default LandingPage;
