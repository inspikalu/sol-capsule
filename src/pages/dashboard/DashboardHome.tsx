import { useState, useEffect } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Lock, Unlock, Timer, Tag, Calendar, DollarSign, Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';

// Types for our capsules
interface Capsule {
    _id: string;
    nftAddress: string;
    fileHash: string;
    metadata: {
        name: string;
        description: string;
        image: string;
        attributes: {
            releaseDate: string;
            isPublic: boolean;
            tags: string[];
        };
    };
    isListed: boolean;
    listingPrice?: number;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL;


const isReleased = (releaseDate: string) => {
    return new Date(releaseDate) <= new Date();
};

const formatTimeLeft = (releaseDate: string) => {
    const now = new Date();
    const release = new Date(releaseDate);
    const diff = release.getTime() - now.getTime();

    if (diff <= 0) return 'Released';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h left`;
};


const DashboardHome = () => {
    const { address } = useAppKitAccount();
    const [capsules, setCapsules] = useState<Capsule[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCapsule, setSelectedCapsule] = useState<Capsule | null>(null);
    const [listingPrice, setListingPrice] = useState<string>('');
    const [isListingModalOpen, setIsListingModalOpen] = useState(false);

    // Fetch capsules on component mount
    useEffect(() => {
        if (address) {
            fetchCapsules();
        }
    }, [address]);

    const fetchCapsules = async () => {
        try {
            const response = await fetch(`${SERVER_URL}/capsules/${address}`);
            if (!response.ok) throw new Error('Failed to fetch capsules');
            const data = await response.json();
            setCapsules(data);
        } catch (error) {
            toast.error('Failed to load capsules');
            console.error('Error fetching capsules:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleListing = async (capsule: Capsule, price?: number) => {
        try {
            const response = await fetch(`${SERVER_URL}/capsules/${capsule.nftAddress}/toggle-listing`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    walletAddress: address,
                    price: price || capsule.listingPrice,
                }),
            });

            if (!response.ok) throw new Error('Failed to update listing');

            await fetchCapsules();
            toast.success(capsule.isListed ? 'Capsule unlisted' : 'Capsule listed for sale');
        } catch (error) {
            toast.error('Failed to update listing');
            console.error('Error toggling listing:', error);
        }
    };

    const handleListCapsule = async () => {
        if (!selectedCapsule || !listingPrice || isNaN(parseFloat(listingPrice))) {
            toast.error('Please enter a valid price');
            return;
        }

        await toggleListing(selectedCapsule, parseFloat(listingPrice));
        setIsListingModalOpen(false);
        setListingPrice('');
        setSelectedCapsule(null);
    };


    // Filter capsules by status
    const pendingCapsules = capsules.filter(c => !isReleased(c.metadata.attributes.releaseDate));
    const revealedCapsules = capsules.filter(c => isReleased(c.metadata.attributes.releaseDate));
    const listedCapsules = capsules.filter(c => c.isListed);

   

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black text-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-2">My Capsules</h1>
                <p className="text-slate-400 mb-8">Manage your digital time capsules</p>

                <Tabs defaultValue="pending" className="space-y-6">
                    <TabsList className="bg-slate-800">
                        <TabsTrigger value="pending" className="data-[state=active]:bg-amber-500">
                            <Timer className="mr-2 h-4 w-4" />
                            Pending ({pendingCapsules.length})
                        </TabsTrigger>
                        <TabsTrigger value="revealed" className="data-[state=active]:bg-amber-500">
                            <Unlock className="mr-2 h-4 w-4" />
                            Revealed ({revealedCapsules.length})
                        </TabsTrigger>
                        <TabsTrigger value="listed" className="data-[state=active]:bg-amber-500">
                            <Tag className="mr-2 h-4 w-4" />
                            For Sale ({listedCapsules.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending" className="space-y-4">
                        {pendingCapsules.map(capsule => (
                            <CapsuleCard
                                key={capsule._id}
                                capsule={capsule}
                                onListClick={() => {
                                    setSelectedCapsule(capsule);
                                    setIsListingModalOpen(true);
                                }}
                                onUnlistClick={() => toggleListing(capsule)}
                            />
                        ))}
                    </TabsContent>

                    <TabsContent value="revealed" className="space-y-4">
                        {revealedCapsules.map(capsule => (
                            <CapsuleCard
                                key={capsule._id}
                                capsule={capsule}
                                onListClick={() => {
                                    setSelectedCapsule(capsule);
                                    setIsListingModalOpen(true);
                                }}
                                onUnlistClick={() => toggleListing(capsule)}
                            />
                        ))}
                    </TabsContent>

                    <TabsContent value="listed" className="space-y-4">
                        {listedCapsules.map(capsule => (
                            <CapsuleCard
                                key={capsule._id}
                                capsule={capsule}
                                onListClick={() => {
                                    setSelectedCapsule(capsule);
                                    setIsListingModalOpen(true);
                                }}
                                onUnlistClick={() => toggleListing(capsule)}
                            />
                        ))}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Listing Modal */}
            <Dialog open={isListingModalOpen} onOpenChange={setIsListingModalOpen}>
                <DialogContent className="bg-slate-800 text-slate-100">
                    <DialogHeader>
                        <DialogTitle>List Capsule for Sale</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-slate-400">Price in SOL</label>
                            <Input
                                type="number"
                                step="0.1"
                                min="0"
                                value={listingPrice}
                                onChange={(e) => setListingPrice(e.target.value)}
                                className="bg-slate-700 border-slate-600 text-slate-100"
                                placeholder="Enter price in SOL"
                            />
                        </div>
                        <Button
                            onClick={handleListCapsule}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900"
                        >
                            List for Sale
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

// CapsuleCard subcomponent
const CapsuleCard = ({
    capsule,
    onListClick,
    onUnlistClick
}: {
    capsule: Capsule;
    onListClick: () => void;
    onUnlistClick: () => void;
}) => {
    const isUnlocked = isReleased(capsule.metadata.attributes.releaseDate);

    return (
        <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
                <div className="flex items-start gap-6">
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-slate-700">
                        <img
                            src={capsule.metadata.image}
                            alt={capsule.metadata.name}
                            className="w-full h-full object-cover"
                        />
                        {!isUnlocked && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <Lock className="h-8 w-8 text-slate-400" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-100">
                                    {capsule.metadata.name}
                                </h3>
                                <p className="text-sm text-slate-400">
                                    {capsule.metadata.description}
                                </p>
                            </div>
                            {capsule.isListed && (
                                <div className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 text-sm">
                                    Listed • {capsule.listingPrice} SOL
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-400">
                            <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatTimeLeft(capsule.metadata.attributes.releaseDate)}
                            </div>
                            <div className="flex items-center">
                                <Eye className="h-4 w-4 mr-1" />
                                {capsule.metadata.attributes.isPublic ? 'Public' : 'Private'}
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            {isUnlocked && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900">
                                            View Content
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-slate-800 text-slate-100">
                                        <DialogHeader>
                                            <DialogTitle>{capsule.metadata.name}</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <img
                                                src={capsule.metadata.image}
                                                alt={capsule.metadata.name}
                                                className="w-full rounded-lg"
                                            />
                                            <p className="text-slate-300">
                                                {capsule.metadata.description}
                                            </p>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )}
                            
                            {capsule.isListed ? (
                                <Button
                                    onClick={onUnlistClick}
                                    className="bg-red-500 hover:bg-red-600 text-white"
                                >
                                    Unlist
                                </Button>
                            ) : (
                                <Button
                                    onClick={onListClick}
                                    className="bg-slate-700 hover:bg-slate-600 text-slate-100"
                                >
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    Sell
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default DashboardHome;