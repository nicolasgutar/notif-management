import apn from 'apn';
import path from 'path';
import fs from 'fs';

// Path to the certificates directory
const CERTS_DIR = path.join(__dirname, '../certs');

// Initialize provider lazily
let provider: apn.Provider | null = null;

// Default Bundle ID
const DEFAULT_BUNDLE_ID = "com.nicolasgutar.APNInvestio.test";

export const initApnProvider = () => {
    if (provider) return provider;

    // 1. Find the .p8 file
    let files: string[] = [];
    try {
        files = fs.readdirSync(CERTS_DIR);
    } catch (error) {
        console.warn(`Could not read certs directory: ${CERTS_DIR}`);
        return null;
    }

    const p8FileName = files.find(f => f.endsWith('.p8'));

    if (!p8FileName) {
        console.warn('No .p8 Auth Key found in src/backend/certs.');
        return null;
    }

    const p8FilePath = path.join(CERTS_DIR, p8FileName);
    console.log(`Found .p8 file: ${p8FileName}`);

    // 2. Resolve Key ID (Env Var > Filename Inference)
    let keyId = process.env.APN_KEY_ID;
    if (!keyId) {
        const match = p8FileName.match(/AuthKey_([A-Z0-9]+)\.p8/);
        if (match) {
            keyId = match[1];
            console.log(`Inferred Key ID from filename: ${keyId}`);
        }
    }

    // 3. Validate Credentials
    if (!keyId || !process.env.APN_TEAM_ID) {
        console.warn('Missing APN configuration:');
        if (!keyId) console.warn(' - APN_KEY_ID missing (and could not infer from filename)');
        if (!process.env.APN_TEAM_ID) console.warn(' - APN_TEAM_ID is missing from .env');
        return null;
    }

    // 4. Initialize Provider
    const isProduction = process.env.APN_PRODUCTION === 'true';
    console.log(`Initializing APN with Token (.p8) [Production: ${isProduction ? 'TRUE' : 'FALSE (Sandbox)'}]...`);

    try {
        const options: apn.ProviderOptions = {
            production: isProduction,
            token: {
                key: fs.readFileSync(p8FilePath, 'utf8'),
                keyId: keyId,
                teamId: process.env.APN_TEAM_ID,
            },
        };

        provider = new apn.Provider(options);
        return provider;
    } catch (err) {
        console.error('Failed to initialize APN provider:', err);
        return null;
    }
};

export const sendPushNotification = async (deviceToken: string, alert: string | any, payload: any = {}) => {
    // Sanitize Token
    const cleanToken = deviceToken.replace(/[^a-fA-F0-9]/g, '');

    const apnProvider = initApnProvider();
    if (!apnProvider) {
        console.error('APN Provider not initialized. Cannot send notification.');
        return false;
    }

    const note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires in 1 hour
    note.badge = 1;
    note.sound = "ping.aiff";
    note.alert = alert;
    note.payload = payload;

    // Set Topic (Bundle ID)
    if (process.env.APN_BUNDLE_ID) {
        note.topic = process.env.APN_BUNDLE_ID;
    } else {
        note.topic = DEFAULT_BUNDLE_ID;
        console.log(`Warning: APN_BUNDLE_ID not set in .env. Using default topic: ${DEFAULT_BUNDLE_ID}`);
    }

    try {
        const result = await apnProvider.send(note, cleanToken);

        if (result.failed.length > 0) {
            console.error(`APN Send Failed (Topic: ${note.topic}):`, JSON.stringify(result.failed, null, 2));
            return false;
        }

        console.log(`APN Send Success (Topic: ${note.topic}):`, JSON.stringify(result.sent, null, 2));
        return true;
    } catch (error) {
        console.error(`Error sending APN (Topic: ${note.topic}):`, error);
        return false;
    }
};