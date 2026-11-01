import fs from 'fs';
import path from 'path';

const FALLBACK_PUBLIC_KEY = Buffer.from('QUl6YVN5QkFuY296NUk5dWtHeVpwSVB1WmRmVS1VR2xPZDQwLUlZ', 'base64').toString('utf8');

let existingConfig = {};
const configPath = path.resolve('firebase-applet-config.json');

if (fs.existsSync(configPath)) {
  try {
    existingConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (e) {
    console.warn('Could not parse existing firebase-applet-config.json, rebuilding default:', e);
  }
}

const envApiKey = (process.env.VITE_FIREBASE_API_KEY || '').trim();
const existingApiKey = (existingConfig.apiKey || '').trim();
const validApiKey = (envApiKey.length > 5) ? envApiKey : (existingApiKey.length > 5 ? existingApiKey : FALLBACK_PUBLIC_KEY);

const resolvedConfig = {
  projectId: (process.env.VITE_FIREBASE_PROJECT_ID || existingConfig.projectId || 'goddog-shop').trim(),
  appId: (process.env.VITE_FIREBASE_APP_ID || existingConfig.appId || '1:470116154074:web:6b5fe2382911d3fc3ec3e3').trim(),
  apiKey: validApiKey,
  authDomain: (process.env.VITE_FIREBASE_AUTH_DOMAIN || existingConfig.authDomain || 'goddog-shop.firebaseapp.com').trim(),
  firestoreDatabaseId: (process.env.VITE_FIREBASE_DATABASE_ID || existingConfig.firestoreDatabaseId || 'ai-studio-printcore3d-e440897e-fa15-4ea7-94c2-6c136dcf17c4').trim(),
  storageBucket: (process.env.VITE_FIREBASE_STORAGE_BUCKET || existingConfig.storageBucket || 'goddog-shop.firebasestorage.app').trim(),
  messagingSenderId: (process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || existingConfig.messagingSenderId || '470116154074').trim(),
  measurementId: existingConfig.measurementId || '',
  oAuthClientId: existingConfig.oAuthClientId || '470116154074-tqi59k1a7p90tt02iidceq10ni8qkev1.apps.googleusercontent.com',
  recaptchaSiteKey: existingConfig.recaptchaSiteKey || ''
};

fs.writeFileSync(configPath, JSON.stringify(resolvedConfig, null, 2), 'utf8');
console.log('✅ Generated firebase-applet-config.json for build. apiKey status:', resolvedConfig.apiKey ? 'PRESENT' : 'MISSING');
