// filepath: /Users/gre/Documents/___www/bl-tool-prono-r/src/services/api.js
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function fetchPronoData(docRef) {
  try {
    const pronoRef = doc(db, 'embeds', docRef);
    const docSnap = await getDoc(pronoRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.error('No prono document found');
      return null;
    }
  } catch (error) {
    console.error('Error fetching prono data:', error);
    throw error;
  }
}