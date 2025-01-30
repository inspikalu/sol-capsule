import type { Provider } from '@reown/appkit-adapter-solana';



export interface FormData {
    file: File | null;
    releaseDate: string;
    isPublic: boolean;
    description: string;
    tags: string;
}

export interface CreateTimeCapsuleProps {
    file: File;
    formData: FormData;
    rpcEndpoint: string;
    walletProvider: Provider;
    connection: any;
}