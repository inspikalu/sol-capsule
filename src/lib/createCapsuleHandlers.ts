import { pinata } from '@/lib/pinataConfig';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplCore, createCollection, create, ruleSet } from '@metaplex-foundation/mpl-core';
import { generateSigner, publicKey, signerIdentity } from '@metaplex-foundation/umi';
import { createSignerFromWalletAdapter } from '@metaplex-foundation/umi-signer-wallet-adapters';
import type { WalletAdapter } from '@reown/appkit-adapter-solana';
import { CreateTimeCapsuleProps } from "@/lib/interfaces";
import { clusterApiUrl } from '@solana/web3.js';
import { toast } from 'sonner';

export const createTimeCapsule = async function ({
    file,
    formData,
    rpcEndpoint,
    walletProvider,
}: CreateTimeCapsuleProps) {
    const toastId = toast.loading('Initializing time capsule creation...');

    try {
        if (!rpcEndpoint) {
            toast.error('Connection error: RPC endpoint is required', { id: toastId });
            throw new Error("rpcEndpoint is required");
        }
        if (!walletProvider) {
            toast.error('Connection error: Wallet provider is required', { id: toastId });
            throw new Error("Wallet provider is required");
        }

        // File validation and details logging
        toast.loading('Validating file details...', { id: toastId });
        console.log("Starting file upload process");
        console.log("File details:", {
            name: file.name,
            size: file.size,
            type: file.type
        });

        // Upload image to IPFS
        toast.loading('Uploading image to IPFS...', { id: toastId });
        const fileUpload = (await pinata.upload.file(file)).IpfsHash;
        const imageUrl = `https://${import.meta.env.VITE_GATEWAY_URL}/ipfs/${fileUpload}`;
        toast.success('Image uploaded successfully!', { id: toastId, duration: 2000 });

        // Create and upload NFT metadata
        toast.loading('Creating NFT metadata...', { id: toastId });
        const NFTMetadata = {
            name: `${formData.description}`,
            description: `${formData.description}`,
            image: imageUrl,
            attributes: {
                releaseDate: formData.releaseDate,
                isPublic: formData.isPublic,
                tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : ['Temporal', 'Vault']
            }
        };

        toast.loading('Uploading NFT metadata to IPFS...', { id: toastId });
        const metadataUpload = (await pinata.upload.json(NFTMetadata)).IpfsHash;
        const metadataUrl = `https://${import.meta.env.VITE_GATEWAY_URL}/ipfs/${metadataUpload}`;
        toast.success('Metadata uploaded successfully!', { id: toastId, duration: 2000 });

        // Initialize blockchain connection
        toast.loading('Initializing blockchain connection...', { id: toastId });
        const umi = createUmi(clusterApiUrl("devnet")).use(mplCore());
        const signer = createSignerFromWalletAdapter(walletProvider as unknown as WalletAdapter);
        umi.use(signerIdentity(signer));

        // Create collection metadata
        toast.loading('Creating collection metadata...', { id: toastId });
        const collectionSigner = generateSigner(umi);
        const collectionMetadata = {
            name: `Time Capsule Collection ${umi.identity.publicKey}`,
            description: "A collection of time-locked digital memories",
            image: imageUrl,
            attributes: {
                category: "Time Capsule",
                version: "1.0",
                creator: signer.publicKey
            }
        };

        const collectionMetadataUpload = (await pinata.upload.json(collectionMetadata)).IpfsHash;
        const collectionMetadataUrl = `https://${import.meta.env.VITE_GATEWAY_URL}/ipfs/${collectionMetadataUpload}`;

        // Create collection on blockchain
        toast.loading('Creating collection on blockchain...', { id: toastId });
        const collectionTx = await createCollection(umi, {
            collection: collectionSigner,
            name: "Time Capsule Collection",
            uri: collectionMetadataUrl,
            plugins: [{
                type: "Royalties",
                basisPoints: 500,
                creators: [{
                    address: publicKey(signer.publicKey),
                    percentage: 100
                }],
                ruleSet: ruleSet("None")
            }]
        }).sendAndConfirm(umi, {
            confirm: { commitment: "finalized" }
        });

        toast.success('Collection created successfully!', { id: toastId, duration: 2000 });

        // Create NFT
        toast.loading('Creating your time capsule NFT...', { id: toastId });
        const nftSigner = generateSigner(umi);
        const nftTx = await create(umi, {
            asset: nftSigner,
            name: formData.description,
            uri: metadataUrl,
            collection: {
                publicKey: collectionSigner.publicKey
            },
            plugins: [{
                type: "Royalties",
                basisPoints: 500,
                creators: [{
                    address: publicKey(signer.publicKey),
                    percentage: 100
                }],
                ruleSet: ruleSet("None")
            }]
        }).sendAndConfirm(umi, {
            confirm: { commitment: "finalized" }
        });

        // Final success notification
        toast.success('Time capsule created successfully! 🎉', {
            id: toastId,
            duration: 5000,
            description: 'Your digital memory has been securely stored on the blockchain.'
        });

        return {
            fileHash: fileUpload,
            collectionAddress: collectionSigner.publicKey,
            nftAddress: nftSigner.publicKey,
            collectionTx: collectionTx.signature.toString(),
            nftTx: nftTx.signature.toString()
        };

    } catch (error: any) {
        console.error("Error in createTimeCapsule:", error);
        toast.error(`Failed to create time capsule: ${error.message}`, {
            id: toastId,
            duration: 4000,
            description: 'Please try again or contact support if the problem persists.'
        });
        throw error;
    }
}