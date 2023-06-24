import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import * as readline from 'readline/promises';

const firebaseConfig = {
  apiKey: 'AIzaSyDMNvyYCapMmESrCB8y0qnnAnzLNcYcN-A',
  authDomain: 'cinerate-eca8e.firebaseapp.com',
  projectId: 'cinerate-eca8e',
  storageBucket: 'cinerate-eca8e.appspot.com',
  messagingSenderId: '685332180536',
  appId: '1:685332180536:web:56a58ba833617427e7c0cd',
};

initializeApp(firebaseConfig);
const authService = getAuth();

const readlineService = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function signIn(email: string, password: string): Promise<string> {
  const creds = await signInWithEmailAndPassword(authService, email, password);
  return await creds.user.getIdToken();
}

async function main() {
  const email = await readlineService.question('Email: ');
  const password = await readlineService.question('Password: ');
  const idToken = await signIn(email, password);
  console.log('ID Token: ', idToken);
  const decodedIdToken = await authService.currentUser?.getIdTokenResult();
  console.log('Claims: ', decodedIdToken?.claims);
}

main().then(() => process.exit());
