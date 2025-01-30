import { useState, useCallback } from 'react';
import { Calendar, Upload, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import type { Provider } from '@reown/appkit-adapter-solana';
import { FormData } from "@/lib/interfaces";
import { createTimeCapsule } from '@/lib/createCapsuleHandlers';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

const CreateCapsule = () => {
    const { connection } = useAppKitConnection();
    const { address } = useAppKitAccount();
    const { walletProvider } = useAppKitProvider<Provider>('solana');

    // Form state
    const [formData, setFormData] = useState<FormData>({
        file: null,
        releaseDate: '',
        isPublic: false,
        description: '',
        tags: ''
    });

    // UI states
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    // Form validation
    const validateForm = (): boolean => {
        if (!address) {
            toast.error('Wallet not connected', {
                description: 'Please connect your wallet to continue.'
            });
            return false;
        }

        if (!formData.file) {
            toast.error('File required', {
                description: 'Please upload an image for your time capsule.'
            });
            return false;
        }

        if (!formData.description.trim()) {
            toast.error('Description required', {
                description: 'Please provide a description for your time capsule.'
            });
            return false;
        }

        if (!formData.releaseDate) {
            toast.error('Release date required', {
                description: 'Please select when your time capsule should be opened.'
            });
            return false;
        }

        return true;
    };

    // File validation
    const validateFile = (file: File): boolean => {
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            toast.error('Invalid file type', {
                description: 'Please upload only JPG, PNG, or GIF images.'
            });
            return false;
        }

        if (file.size > MAX_FILE_SIZE) {
            toast.error('File too large', {
                description: 'Maximum file size is 10MB. Please compress your image.'
            });
            return false;
        }

        return true;
    };

    // Handle file drop
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (validateFile(file)) {
                setFormData(prev => ({ ...prev, file }));
                toast.success('File uploaded', {
                    description: `${file.name} has been selected successfully.`
                });
            }
        }
    }, []);

    // Handle drag events
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    }, []);

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (validateFile(file)) {
                setFormData(prev => ({ ...prev, file }));
                toast.success('File uploaded', {
                    description: `${file.name} has been selected successfully.`
                });
            }
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setIsUploading(true);
            toast.loading('Creating your time capsule...', {
                description: 'Please keep this window open.'
            });

            if (!connection) {
                throw new Error('Connection not established');
            }

            const result = await createTimeCapsule({
                file: formData.file!,
                formData,
                rpcEndpoint: connection.rpcEndpoint,
                walletProvider,
                connection
            });

            // Reset form after successful creation
            setFormData({
                file: null,
                releaseDate: '',
                isPublic: false,
                description: '',
                tags: ''
            });

            toast.success('Time capsule created!', {
                description: 'Your memories are now securely stored on the blockchain.',
                action: {
                    label: 'View Transaction',
                    onClick: () => window.open(
                        `https://explorer.solana.com/tx/${result.nftTx}?cluster=devnet`,
                        '_blank'
                    )
                },
                duration: 5000
            });

        } catch (error: any) {
            toast.error('Creation failed', {
                description: error.message || 'Please try again or contact support.'
            });
            console.error('Time capsule creation error:', error);
        } finally {
            setIsUploading(false);
        }
    };

    if (!connection) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black text-slate-100 flex items-center justify-center p-4">
                <Card className="bg-slate-800 border-slate-700 max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="text-2xl text-slate-100">Connect Wallet</CardTitle>
                        <CardDescription className="text-slate-300">
                            Please connect your Solana wallet to create a time capsule
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-400 text-sm">
                            You'll need a connected wallet to:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Create your time capsule NFT</li>
                                <li>Sign transactions</li>
                                <li>Pay for network fees</li>
                            </ul>
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black text-slate-100">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight mb-2">Create Time Capsule</h1>
                    <p className="text-slate-300">Preserve your digital memories securely on the blockchain</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-2xl text-slate-100">Capsule Details</CardTitle>
                            <CardDescription className="text-slate-300">
                                Fill in the details for your digital time capsule
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Content Upload Section */}
                            <div className="space-y-4">
                                <Label className="text-slate-100">Upload Content</Label>
                                <div
                                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
                                        ${dragActive ? 'border-amber-500 bg-slate-700/50' : 'border-slate-700 hover:border-amber-500/50'}`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    {formData.file ? (
                                        <div className="space-y-2">
                                            <p className="text-amber-500">✓ File selected: {formData.file.name}</p>
                                            <p className="text-sm text-slate-400">
                                                Size: {(formData.file.size / (1024 * 1024)).toFixed(2)}MB
                                            </p>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="bg-slate-700 hover:bg-slate-600 text-slate-100"
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, file: null }));
                                                    toast.info('File removed');
                                                }}
                                            >
                                                Remove File
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                                            <div className="space-y-2">
                                                <p className="text-slate-300">Drag and drop your image here, or click to browse</p>
                                                <p className="text-sm text-slate-400">
                                                    Supports JPG, PNG, GIF (max 10MB)
                                                </p>
                                            </div>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleFileSelect}
                                                id="file-upload"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="mt-4 bg-slate-700 hover:bg-slate-600 text-slate-100"
                                                onClick={() => document.getElementById('file-upload')?.click()}
                                            >
                                                Select File
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Release Date Selection */}
                            <div className="space-y-4">
                                <Label className="text-slate-100">Release Date</Label>
                                <div className="flex space-x-4">
                                    <Input
                                        type="date"
                                        value={formData.releaseDate}
                                        min={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                        max={new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                        className="bg-slate-700 border-slate-600 text-slate-100"
                                        onChange={(e) => {
                                            setFormData(prev => ({ ...prev, releaseDate: e.target.value }));
                                            toast.info('Release date set', {
                                                description: `Your capsule will be unlocked on ${new Date(e.target.value).toLocaleDateString()}`
                                            });
                                        }}
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="bg-slate-700 hover:bg-slate-600 text-slate-100"
                                        onClick={() => {
                                            const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
                                            if (dateInput) {
                                                if ('showPicker' in dateInput) {
                                                    dateInput.showPicker();
                                                } else {
                                                    (dateInput as HTMLInputElement).click();
                                                }
                                            }
                                        }}
                                    >
                                        <Calendar className="mr-2 h-4 w-4" />
                                        Pick Date
                                    </Button>
                                </div>
                                <p className="text-sm text-slate-400">Choose a date between 1 and 10 years from now</p>
                            </div>

                            {/* Visibility Toggle */}
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-slate-100">Capsule Visibility</Label>
                                    <p className="text-sm text-slate-400">
                                        {formData.isPublic
                                            ? 'Anyone can view your capsule after unlock'
                                            : 'Only you can view your capsule after unlock'}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {formData.isPublic
                                        ? <Eye className="h-4 w-4 text-amber-500" />
                                        : <EyeOff className="h-4 w-4 text-slate-400" />
                                    }
                                    <Switch
                                        checked={formData.isPublic}
                                        onCheckedChange={(checked) => {
                                            setFormData(prev => ({ ...prev, isPublic: checked }));
                                            toast.info(
                                                checked ? 'Capsule set to public' : 'Capsule set to private',
                                                {
                                                    description: checked
                                                        ? 'Anyone will be able to view this capsule after unlock'
                                                        : 'Only you will be able to view this capsule after unlock'
                                                }
                                            );
                                        }}
                                        className="data-[state=checked]:bg-amber-500"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-4">
                                <Label className="text-slate-100">Description</Label>
                                <Textarea
                                    placeholder="What memories are you preserving?"
                                    className="bg-slate-700 border-slate-600 text-slate-100 min-h-[100px]"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    required
                                />
                                <p className="text-sm text-slate-400">
                                    Describe the memories you're storing in this time capsule
                                </p>
                            </div>

                            {/* Tags */}
                            <div className="space-y-4">
                                <Label className="text-slate-100">Tags</Label>
                                <Input
                                    placeholder="Add tags separated by commas (e.g., memories, family, 2024)"
                                    className="bg-slate-700 border-slate-600 text-slate-100"
                                    value={formData.tags}
                                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                                />
                                <p className="text-sm text-slate-400">
                                    Optional: Add tags to help organize your time capsules
                                </p>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isUploading || !formData.file || !formData.releaseDate || !formData.description.trim()}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Creating Time Capsule...
                                    </>
                                ) : (
                                    <>
                                        Create Time Capsule
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </form>
            </div>

            {/* Decorative Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
};

export default CreateCapsule;