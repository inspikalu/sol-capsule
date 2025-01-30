import axios from 'axios';

// You'll get these from Pinata dashboard
const PINATA_API_KEY = 'aa9f3bf343dff723bd13';
const PINATA_SECRET_KEY = 'ed18ad2a8ccc0d52a7a48e4799545145b1b2afd003a20fa55a5448aa8b7888d0';

async function uploadMetadataToPinata() {
    try {
        const metadata = {
            name: "Astro",
            symbol: "AST",
            "description": "Whether you’re a hodler, trader, or meme enthusiast, owning an Astro means being part of an elite community of visionaries aiming for the stars.",
            "image": "https://gateway.pinata.cloud/ipfs/bafybeig6m4bqa6dqtp3ylpsi2edqlgtlperf7orcw7auaxusuy555pgxpm",
            "external_url": "",
            "seller_fee_basis_points": 0,
            "properties": {
                "files": [
                    {
                        "uri": "https://gateway.pinata.cloud/ipfs/bafybeig6m4bqa6dqtp3ylpsi2edqlgtlperf7orcw7auaxusuy555pgxpm",
                        "type": "image/png"
                    }
                ],
                "category": "image",
                "creators": [
                    {
                        "address": "AopUFgSHXJmcQARjTJex43NYcaQSMcVWmKtcYybo43Xm",
                        "share": 100
                    }
                ]
            }
        }

        // Upload metadata to Pinata
        console.log('Uploading metadata...');
        const response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', metadata, {
            headers: {
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_SECRET_KEY
            }
        });

        const metadataUrl = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
        console.log('Upload complete!');
        console.log('Metadata URL:', metadataUrl);

        return metadataUrl;
    } catch (error: any) {
        console.error('Error:', error.response ? error.response.data : error.message);
        throw error;
    }
}

export default uploadMetadataToPinata;

// uploadMetadataToPinata();