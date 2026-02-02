import React, { useState, useEffect } from 'react';
import s from './PronosticWidget.module.scss';
import 'flag-icons/css/flag-icons.min.css';
import { db } from '../../services/firebase';
import { doc, runTransaction } from 'firebase/firestore';

const PronosticWidget = ({ match, docId, devMode }) => {
    const [votes, setVotes] = useState({ 
        team1: match.initialVotes.team1, 
        draw: match.initialVotes.draw, 
        team2: match.initialVotes.team2 
    });
    const [hasVoted, setHasVoted] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [showLabels, setShowLabels] = useState(false);

    // Initial animation or data load
    useEffect(() => {
        if (match?.initialVotes) {
            setVotes(match.initialVotes);
        }

        // Check if user already voted for this docId
        if (docId && !devMode) {
            const alreadyVoted = localStorage.getItem(`voted_${docId}`);
            if (alreadyVoted) {
                setHasVoted(true);
                // Sequence for returning voters: small delay for width, then delay for labels
                setTimeout(() => setShowResults(true), 100);
                setTimeout(() => setShowLabels(true), 1500);
            }
        }
    }, [match, docId, devMode]);

    const handleVote = async (type) => {
        if (hasVoted || !docId) return;
        
        setHasVoted(true);
        setShowResults(true); // Trigger width transition immediately on vote
        // Delay label appearance to match CSS transition duration (1s)
        setTimeout(() => setShowLabels(true), 1500);
        
        const itemKey = type === 'team1' ? 'item1' : type === 'team2' ? 'item2' : 'item3';
        
        try {
            const docRef = doc(db, 'embeds', docId);
            await runTransaction(db, async (transaction) => {
                const sfDoc = await transaction.get(docRef);
                if (!sfDoc.exists()) {
                    throw "Document does not exist!";
                }
                
                const data = sfDoc.data();
                // Check if data is directly at root or inside pronoData
                let targetData = data[itemKey];
                let updatePath = `${itemKey}.votes`;

                if (!targetData && data.pronoData && data.pronoData[itemKey]) {
                    targetData = data.pronoData[itemKey];
                    updatePath = `pronoData.${itemKey}.votes`;
                }

                if (!targetData) {
                    throw `Item ${itemKey} does not exist!`;
                }

                const currentVotes = targetData.votes || 0;
                transaction.update(docRef, { [updatePath]: currentVotes + 1 });
            });

            // Save vote to localStorage
            localStorage.setItem(`voted_${docId}`, 'true');

            setVotes(prev => ({
                ...prev,
                [type]: prev[type] + 1
            }));
        } catch (e) {
            console.error("Transaction failed: ", e);
            // Revert optimistic update if needed, but keeping it simple for now
            setHasVoted(false);
            setShowResults(false);
            localStorage.removeItem(`voted_${docId}`);
        }
    };

    // Calculate percentages using Largest Remainder Method to ensure sum is 100%
    const total = votes.team1 + votes.draw + votes.team2;
    let p1 = 0, pDraw = 0, p2 = 0;

    if (total > 0) {
        const rawP1 = (votes.team1 / total) * 100;
        const rawPDraw = (votes.draw / total) * 100;
        const rawP2 = (votes.team2 / total) * 100;

        const flooredP1 = Math.floor(rawP1);
        const flooredPDraw = Math.floor(rawPDraw);
        const flooredP2 = Math.floor(rawP2);

        const diff = 100 - (flooredP1 + flooredPDraw + flooredP2);

        const remainders = [
            { id: 'p1', val: rawP1 - flooredP1 },
            { id: 'pDraw', val: rawPDraw - flooredPDraw },
            { id: 'p2', val: rawP2 - flooredP2 }
        ].sort((a, b) => b.val - a.val);

        const bonus = { p1: 0, pDraw: 0, p2: 0 };
        for (let i = 0; i < diff; i++) {
            bonus[remainders[i].id] = 1;
        }

        p1 = flooredP1 + bonus.p1;
        pDraw = flooredPDraw + bonus.pDraw;
        p2 = flooredP2 + bonus.p2;
    }

    if (!match) return null;

    return (
        <div className={s.container}>
            <div className={s.header}>
                <h2>PRONOSTIC EXPRESS - MATCH DU {match.date}</h2>
                <p>{match.competition}</p>
            </div>

            <div className={s.matchArea}>
                <div className={s.team}>
                    {match.team1.type === 'national' && (
                        <div className={s.flag}>
                            <span className={`fi fi-${match.team1.code} fis`}></span>
                        </div>
                    )}
                </div>
                
                <span className={s.vsText}>CONTRE</span>

                <div className={s.team}>
                    {match.team2.type === 'national' && (
                        <div className={s.flag}>
                            <span className={`fi fi-${match.team2.code} fis`}></span>
                        </div>
                    )}
                </div>
            </div>

            <div className={s.progressBarContainer}>
                <div
                    className={`${s.progressBarSegment} ${s.team1}`} 
                    style={{ width: showResults ? `${p1}%` : '0%', backgroundColor: match.team1.color }}>
                        <span style={{ opacity: showLabels ? 1 : 0, transition: 'opacity 0.5s ease' }}>{p1}%</span>
                </div>
                <div 
                    className={`${s.progressBarSegment} ${s.draw}`} 
                    style={{ width: showResults ? `${pDraw}%` : '0%' }}>
                        <span style={{ opacity: showLabels ? 1 : 0, transition: 'opacity 0.5s ease' }}>{pDraw}%</span>
                </div>
                <div 
                    className={`${s.progressBarSegment} ${s.team2}`} 
                    style={{ width: showResults ? `${p2}%` : '0%', backgroundColor: match.team2.color }}>
                         <span style={{ opacity: showLabels ? 1 : 0, transition: 'opacity 0.5s ease' }}>{p2}%</span>
                </div>
            </div>

            <div className={s.footer}>
                <button className={s.voteBtn} onClick={() => handleVote('team1')} disabled={hasVoted}>
                    {match.team1.name}
                </button>
                <button className={`${s.voteBtn} ${s.nul}`} onClick={() => handleVote('draw')} disabled={hasVoted}>
                    NUL
                </button>
                <button className={s.voteBtn} onClick={() => handleVote('team2')} disabled={hasVoted}>
                    {match.team2.name}
                </button>
            </div>
        </div>
    );
};

export default PronosticWidget;
