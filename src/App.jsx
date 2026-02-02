import { useState, useEffect } from 'react'; 
import './App.scss';
import { fetchPronoData } from './services/api';
import { dataLayerPushView } from './services/analytics';
import { db } from './services/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import LoadingOverlay from './components/LoadingOverlay/LoadingOverlay';
import PronosticWidget from './components/PronosticWidget/PronosticWidget';


function App() {
    const [docId] = useState(() => new URLSearchParams(window.location.search).get('pronoDoc'));
    const [prono, setProno] = useState(null);
    const [devMode] = useState(false);
    
    useEffect(() => {
        if (!docId) {
            console.log('Aucun prono trouvé.');
            return;
        }

        async function loadProno() {
            try {
                const data = await fetchPronoData(docId);
                setProno(data);
                
                // Log for verification as per SKILL.md
                // console.log('docId content:', docId); 
                // console.log('prono data:', data);

                await incrementViewCounter(docId); 
                dataLayerPushView(docId);
            } catch (error) {
                console.error('Erreur lors du chargement du prono:', error);
            }
        }

        loadProno();
    }, [docId]);

    async function incrementViewCounter(docId) {
        try {
            const pronoRef = doc(db, 'embeds', docId);
            await updateDoc(pronoRef, {
                counterViews: increment(1),
            });
        } catch (error) {
            console.error('Erreur lors de l\'incrémentation du compteur de vues :', error);
        }
    }

    /*
    const mockMatch = {
        date: "13.02.26",
        competition: "Coupe du monde UEFA 2026",
        team1: { name: "SUISSE", code: "ch" },
        team2: { name: "ÉCOSSE", code: "gb-sct" },
        initialVotes: { team1: 10, draw: 1, team2: 2 } // Mock initial for demo
    };
    */

    const pronoData = prono?.pronoData || prono;
    const match = (pronoData && pronoData.item1 && pronoData.item2) ? {
        date: pronoData.date 
            ? (typeof pronoData.date.toDate === 'function' ? pronoData.date.toDate() : new Date(pronoData.date))
                .toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })
                .replace(/\//g, '.') 
            : "Date inconnue",
        competition: pronoData.event || "Compétition inconnue",
        team1: { 
            name: pronoData.item1?.name, 
            code: pronoData.item1?.code,
            type: pronoData.item1?.type,
            color: pronoData.item1?.color 
        },
        team2: { 
            name: pronoData.item2?.name, 
            code: pronoData.item2?.code,
            type: pronoData.item2?.type,
            color: pronoData.item2?.color
        },
        initialVotes: { 
            team1: pronoData.item1?.votes || 0, 
            draw: pronoData.item3?.votes || pronoData.item3?.counter || 0, // Handle potential naming diff
            team2: pronoData.item2?.votes || 0
        }
    } : null;

    //console.log("Render match:", match); // Debug log

    return (
        <div className="App overflow-hidden relative bg-white font-inter flex justify-center items-start">
            <LoadingOverlay show={prono === null} />
            {match && <PronosticWidget match={match} docId={docId} devMode={devMode} />}
        </div>
    );
}

export default App;
