import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Unlock, Timer, Key } from 'lucide-react';

const UnlockCapsule = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black text-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight mb-2">Unlock Capsule</h1>
                    <p className="text-slate-400">Reveal your time-locked memories</p>
                </div>

                {/* Coming Soon Card */}
                <Card className="bg-slate-800 border-slate-700 max-w-2xl mx-auto">
                    <CardHeader className="text-center pb-2">
                        <Unlock className="w-12 h-12 mx-auto text-amber-500 mb-4" />
                        <CardTitle className="text-3xl text-slate-100">Coming Soon</CardTitle>
                        <CardDescription className="text-slate-300 text-lg">
                            The Unlock Feature is being developed
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-6">
                        <p className="text-slate-400">
                            Soon you'll be able to unlock and reveal your time capsules when they reach their release date.
                            We're working hard to make this feature available!
                        </p>

                        {/* Features Preview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto mt-8">
                            <div className="bg-slate-700/50 p-4 rounded-lg">
                                <Timer className="w-6 h-6 text-amber-500 mb-2 mx-auto" />
                                <h3 className="font-semibold mb-1">Timed Reveals</h3>
                                <p className="text-sm text-slate-400">Automatic unlocking when the time comes</p>
                            </div>
                            <div className="bg-slate-700/50 p-4 rounded-lg">
                                <Key className="w-6 h-6 text-amber-500 mb-2 mx-auto" />
                                <h3 className="font-semibold mb-1">Secure Access</h3>
                                <p className="text-sm text-slate-400">Blockchain-verified ownership controls</p>
                            </div>
                        </div>

                        {/* Notify Button
                        <Button 
                            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium mt-6"
                            onClick={() => alert('Notification preference saved!')}
                        >
                            Notify Me on Launch
                        </Button> */}
                    </CardContent>
                </Card>
            </div>

            {/* Decorative Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
};

export default UnlockCapsule;