
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Swords, 
  Trophy, 
  Users, 
  RefreshCw, 
  Share2, 
  ArrowLeft,
  Zap,
  Volume2,
  Sparkles
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Character, GameState, BattleResult, LeaderboardEntry } from './types';
import { CHARACTERS } from './constants';
import { simulateBattle, playAudio } from './services/geminiService';
import { Button, Card, Badge, StatBar, cn } from './components/UIComponents';

// --- Helpers ---
const getImageUrl = (name: string) => 
  `https://image.pollinations.ai/prompt/anime style character portrait of ${name} action pose epic lighting detailed 8k?width=400&height=600&nologo=true&seed=${name.length}`;

// --- Interfaces ---
interface SelectionCardProps {
  character: Character;
  selected: boolean;
  onClick: () => void;
  disabled: boolean;
}

interface BattleArenaProps {
  p1: Character;
  p2: Character;
  onBattleEnd: (result: BattleResult) => void;
}

interface BattleResultViewProps {
  result: BattleResult;
  p1: Character;
  p2: Character;
  onReset: () => void;
}

interface StatsViewProps {
  history: BattleResult[];
  onBack: () => void;
}

// --- Components ---

// 1. Character Selection Card
const SelectionCard: React.FC<SelectionCardProps> = ({ character, selected, onClick, disabled }) => {
  return (
    <motion.div 
      layoutId={`card-${character.id}`}
      whileHover={!disabled ? { y: -5, scale: 1.02 } : {}}
      onClick={!disabled ? onClick : undefined}
      className={cn(
        "cursor-pointer relative group",
        disabled && !selected ? "opacity-50 grayscale cursor-not-allowed" : ""
      )}
    >
      <Card className={cn(
        "h-full border-2 transition-all duration-300 bg-surface/80 backdrop-blur-sm",
        selected ? "border-primary shadow-[0_0_30px_rgba(239,68,68,0.4)] ring-2 ring-primary/50" : "border-border group-hover:border-muted"
      )}>
        <div className="relative h-56 overflow-hidden bg-black/40">
          <img 
            src={getImageUrl(character.name)} 
            alt={character.name} 
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
          <div className="absolute bottom-2 left-3 right-3">
            <Badge className="bg-primary/80 text-white border-none mb-1 backdrop-blur-md">{character.anime}</Badge>
            <h3 className="text-xl font-black text-white leading-tight drop-shadow-md">{character.name}</h3>
          </div>
        </div>
        <div className="p-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <StatBar label="PWR" value={character.stats.power} colorClass="bg-red-500" />
            <StatBar label="SPD" value={character.stats.speed} colorClass="bg-yellow-500" />
            <StatBar label="INT" value={character.stats.intelligence} colorClass="bg-blue-500" />
            <StatBar label="STM" value={character.stats.stamina} colorClass="bg-green-500" />
          </div>
        </div>
      </Card>
      {selected && (
        <div className="absolute -top-3 -right-3 bg-primary text-white rounded-full p-2 shadow-lg z-10 animate-bounce">
           <Zap size={20} fill="currentColor" />
        </div>
      )}
    </motion.div>
  );
};

// 2. High-Octane Battle Arena
const BattleArena: React.FC<BattleArenaProps> = ({ p1, p2, onBattleEnd }) => {
  const [phase, setPhase] = useState<'intro' | 'clash' | 'fighting'>('intro');
  const [combatLog, setCombatLog] = useState<string[]>([]);
  
  useEffect(() => {
    let isMounted = true;
    
    const runBattle = async () => {
      // 1. Intro Phase
      await new Promise(r => setTimeout(r, 1500));
      if (!isMounted) return;
      setPhase('clash');

      // 2. Start Simulation API Call in background
      const simulationPromise = simulateBattle(p1, p2);

      // 3. Clash Phase
      await new Promise(r => setTimeout(r, 1000));
      if (!isMounted) return;
      setPhase('fighting');

      const hypeMessages = [
        `${p1.name} dashes forward at light speed!`,
        `${p2.name} counters with a massive shockwave!`,
        `The ground is shaking from their energy!`,
        `${p1.name} is charging up a huge attack...`,
        `${p2.name} teleports behind instantly!`,
        `Incredible speed! They are invisible to the naked eye!`,
        `A massive explosion rocks the arena!`,
      ];

      let msgIdx = 0;
      const logInterval = setInterval(() => {
        if (msgIdx < hypeMessages.length) {
          setCombatLog(prev => [hypeMessages[msgIdx], ...prev].slice(0, 5));
          msgIdx++;
        }
      }, 800);

      // 4. Wait for API
      const resultData = await simulationPromise;
      clearInterval(logInterval);

      // 5. Finish
      if (isMounted) {
        setCombatLog(prev => ["FATAL BLOW DELIVERED!", ...prev]);
        setTimeout(() => {
          const fullResult: BattleResult = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            winnerId: resultData.winnerId,
            loserId: resultData.winnerId === p1.id ? p2.id : p1.id,
            ...resultData
          };
          onBattleEnd(fullResult);
        }, 1000);
      }
    };

    runBattle();

    return () => { isMounted = false; };
  }, [p1, p2, onBattleEnd]);

  const shakeVariants = {
    fighting: {
      x: [0, -5, 5, -5, 5, 0],
      y: [0, -5, 5, -5, 5, 0],
      transition: { repeat: Infinity, duration: 0.2 }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full relative overflow-hidden">
      
      <div className={cn("absolute inset-0 z-0 transition-colors duration-100", phase === 'fighting' ? 'bg-red-900/10' : 'bg-background')}>
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-surface via-background to-background opacity-80" />
      </div>

      <motion.div 
        variants={shakeVariants}
        animate={phase === 'fighting' ? 'fighting' : undefined}
        className="z-10 flex flex-col md:flex-row items-center justify-between w-full max-w-7xl px-4 gap-8 md:gap-16"
      >
        
        {/* Player 1 */}
        <motion.div 
          initial={{ x: -200, opacity: 0 }}
          animate={{ x: phase === 'clash' ? 100 : 0, opacity: 1 }}
          transition={{ type: "spring", bounce: 0, duration: 0.5 }}
          className="relative w-full md:w-[400px]"
        >
          <div className={cn(
              "relative aspect-[3/4] rounded-2xl overflow-hidden border-4 shadow-2xl transition-all duration-300",
              phase === 'fighting' ? "border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.6)] scale-105" : "border-border"
            )}>
            <img src={getImageUrl(p1.name)} alt={p1.name} className="w-full h-full object-cover" />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6">
              <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">{p1.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                 <div className="h-3 flex-1 bg-gray-800 rounded-full overflow-hidden border border-white/20">
                    <motion.div 
                      initial={{ width: '100%' }}
                      animate={{ width: phase === 'fighting' ? '60%' : '100%' }} 
                      transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                      className="h-full bg-gradient-to-r from-red-600 to-red-400"
                    />
                 </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* VS / Action Center */}
        <div className="flex flex-col items-center justify-center w-full md:w-1/4 relative z-20 h-40 md:h-auto">
          <AnimatePresence mode="wait">
            {phase === 'intro' && (
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1.5, rotate: 0 }}
                exit={{ scale: 5, opacity: 0 }}
                className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-red-600 italic tracking-tighter drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]"
              >
                VS
              </motion.div>
            )}
            {(phase === 'clash' || phase === 'fighting') && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full"
              >
                <div className="relative">
                   <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/20 blur-[80px] rounded-full animate-pulse" />
                   
                   <div className="relative bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-4 h-48 overflow-hidden flex flex-col justify-end shadow-2xl">
                      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black to-transparent z-10" />
                      <AnimatePresence initial={false}>
                        {combatLog.map((log, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: Math.max(0, 1 - (i * 0.2)), x: 0 }}
                            className={cn(
                              "text-sm font-bold font-mono py-1 border-l-2 pl-2",
                              i === 0 ? "text-yellow-400 border-yellow-400 text-lg" : "text-gray-400 border-gray-700"
                            )}
                          >
                            {log}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Player 2 */}
        <motion.div 
           initial={{ x: 200, opacity: 0 }}
           animate={{ x: phase === 'clash' ? -100 : 0, opacity: 1 }}
           transition={{ type: "spring", bounce: 0, duration: 0.5 }}
           className="relative w-full md:w-[400px]"
        >
          <div className={cn(
              "relative aspect-[3/4] rounded-2xl overflow-hidden border-4 shadow-2xl transition-all duration-300",
              phase === 'fighting' ? "border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.6)] scale-105" : "border-border"
            )}>
            <img src={getImageUrl(p2.name)} alt={p2.name} className="w-full h-full object-cover" />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 text-right">
              <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">{p2.name}</h2>
              <div className="flex items-center gap-2 mt-2 justify-end">
                 <div className="h-3 flex-1 bg-gray-800 rounded-full overflow-hidden border border-white/20">
                    <motion.div 
                      initial={{ width: '100%' }}
                      animate={{ width: phase === 'fighting' ? '60%' : '100%' }} 
                      transition={{ duration: 3.5, repeat: Infinity, repeatType: "reverse" }}
                      className="h-full bg-gradient-to-l from-blue-600 to-blue-400 float-right"
                    />
                 </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

// 3. Battle Result
const BattleResultView: React.FC<BattleResultViewProps> = ({ result, p1, p2, onReset }) => {
  const winner = result.winnerId === p1.id ? p1 : p2;
  const [playing, setPlaying] = useState(false);

  const handlePlayAudio = () => {
    if (result.audioBase64) {
      setPlaying(true);
      playAudio(result.audioBase64).then(() => setTimeout(() => setPlaying(false), 4000));
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-5xl mx-auto w-full py-8 px-4"
    >
      <div className="relative text-center mb-12">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full -z-10" />
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 mb-4 text-lg px-4 py-1">VICTORY</Badge>
        <h1 className="text-7xl md:text-9xl font-black italic text-white tracking-tighter drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">{winner.name.toUpperCase()}</span>
        </h1>
        <p className="text-2xl text-primary font-bold mt-2 tracking-widest uppercase">WINS THE BATTLE</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
           <Card className="relative overflow-hidden border-primary/50 bg-surface/50 backdrop-blur-sm group">
              <div className="absolute top-0 right-0 p-6 z-10">
                  <Trophy className="text-yellow-400 w-16 h-16 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]" />
              </div>
              <div className="p-1">
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  <img src={getImageUrl(winner.name)} alt={winner.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {result.winnerQuote && (
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border-l-4 border-primary">
                        <p className="text-white italic font-medium text-lg">"{result.winnerQuote}"</p>
                        {result.audioBase64 && (
                          <button 
                            onClick={handlePlayAudio}
                            className="mt-3 flex items-center gap-2 text-xs font-bold text-primary hover:text-white transition-colors uppercase tracking-wider"
                          >
                            {playing ? <span className="animate-pulse">Playing...</span> : <><Volume2 size={16} /> Play Voice</>}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
           </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-surface/40 border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
              <Sparkles className="text-yellow-400" />
              <h3 className="text-xl font-bold text-white">Winning Strategy</h3>
            </div>
            <div className="text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">
              {result.winningMove}
            </div>
            <div className="prose prose-invert prose-lg text-gray-300 leading-relaxed">
              {result.narrative}
            </div>
          </Card>

          <div className="flex gap-4">
            <Button onClick={onReset} size="lg" className="flex-1 h-14 text-lg font-bold bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              <RefreshCw size={22} /> REMATCH
            </Button>
            <Button onClick={() => alert("Link copied to clipboard!")} size="lg" variant="secondary" className="flex-1 h-14 text-lg font-bold border-white/20">
              <Share2 size={22} /> SHARE
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// 4. Leaderboard & History
const StatsView: React.FC<StatsViewProps> = ({ history, onBack }) => {
  const leaderboard = useMemo(() => {
    const stats: Record<string, LeaderboardEntry> = {};
    CHARACTERS.forEach(c => {
      stats[c.id] = { characterId: c.id, name: c.name, wins: 0, losses: 0, totalBattles: 0, winRate: 0 };
    });
    history.forEach(h => {
      if(stats[h.winnerId]) { stats[h.winnerId].wins++; stats[h.winnerId].totalBattles++; }
      if(stats[h.loserId]) { stats[h.loserId].losses++; stats[h.loserId].totalBattles++; }
    });
    Object.values(stats).forEach(s => {
      s.winRate = s.totalBattles > 0 ? Math.round((s.wins / s.totalBattles) * 100) : 0;
    });
    return Object.values(stats).sort((a, b) => b.wins - a.wins || b.winRate - a.winRate);
  }, [history]);

  return (
    <div className="max-w-6xl mx-auto w-full py-8 px-4">
      <Button variant="ghost" onClick={onBack} className="mb-8 hover:bg-white/10">
        <ArrowLeft size={20} /> Back to Arena
      </Button>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
           <h2 className="text-3xl font-black italic mb-6 flex items-center gap-3"><Trophy className="text-yellow-500" /> HALL OF FAME</h2>
           <div className="bg-surface/50 rounded-xl border border-white/10 overflow-hidden">
             <table className="w-full text-left">
               <thead className="bg-white/5 text-xs uppercase tracking-wider text-muted">
                 <tr>
                   <th className="p-4">Rank</th>
                   <th className="p-4">Fighter</th>
                   <th className="p-4 text-right">Record</th>
                   <th className="p-4 text-right">Win Rate</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {leaderboard.map((entry, index) => (
                   <tr key={entry.characterId} className="hover:bg-white/5 transition-colors group">
                     <td className="p-4 font-mono text-muted group-hover:text-white">#{index + 1}</td>
                     <td className="p-4 font-bold text-white flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-800">
                          <img src={getImageUrl(entry.name)} alt="" className="w-full h-full object-cover" />
                       </div>
                       {entry.name}
                     </td>
                     <td className="p-4 text-right font-mono text-sm">{entry.wins}W - {entry.losses}L</td>
                     <td className="p-4 text-right">
                       <Badge className={cn(
                         "border-none",
                         entry.winRate > 70 ? "bg-green-500 text-black" :
                         entry.winRate > 40 ? "bg-yellow-500 text-black" : "bg-red-500 text-white"
                       )}>
                         {entry.winRate}%
                       </Badge>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
        <div>
          <h2 className="text-3xl font-black italic mb-6 flex items-center gap-3"><Users className="text-blue-500" /> RECENT CLASHES</h2>
          <div className="space-y-3">
            {history.slice().reverse().slice(0, 6).map(h => {
              const winner = CHARACTERS.find(c => c.id === h.winnerId);
              const loser = CHARACTERS.find(c => c.id === h.loserId);
              return (
                <div key={h.id} className="p-4 bg-surface/30 border border-white/5 rounded-xl hover:border-white/20 transition-colors">
                   <div className="flex justify-between text-xs text-muted mb-2">
                      <span>{new Date(h.date).toLocaleDateString()}</span>
                      <span className="text-primary uppercase font-bold tracking-wider">KO</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="font-bold text-green-400">{winner?.name}</span>
                      <span className="text-xs text-muted mx-2">def.</span>
                      <span className="font-medium text-red-400">{loser?.name}</span>
                   </div>
                   <div className="mt-2 text-xs text-gray-400 italic line-clamp-1">"{h.winningMove}"</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [gameState, setGameState] = useState<GameState>('SELECTION');
  const [p1, setP1] = useState<Character | null>(null);
  const [p2, setP2] = useState<Character | null>(null);
  const [currentResult, setCurrentResult] = useState<BattleResult | null>(null);
  const [history, setHistory] = useState<BattleResult[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('anime_battle_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) { console.error("Failed to load history"); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('anime_battle_history', JSON.stringify(history));
  }, [history]);

  const handleSelect = (char: Character) => {
    if (p1?.id === char.id) { setP1(null); return; }
    if (p2?.id === char.id) { setP2(null); return; }
    if (!p1) setP1(char);
    else if (!p2) setP2(char);
  };

  const startBattle = () => {
    if (p1 && p2) setGameState('BATTLE');
  };

  const handleBattleEnd = (result: BattleResult) => {
    setCurrentResult(result);
    setHistory(prev => [...prev, result]);
    setGameState('RESULT');
  };

  const resetGame = () => {
    setP1(null); setP2(null); setCurrentResult(null); setGameState('SELECTION');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-text font-sans selection:bg-primary/30 overflow-x-hidden">
      
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-lg">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-6 mx-auto">
          <div className="flex items-center gap-2 font-black text-2xl tracking-tighter italic cursor-pointer group" onClick={() => setGameState('SELECTION')}>
            <span className="text-primary group-hover:text-white transition-colors">ANIME</span>
            <span className="text-white group-hover:text-primary transition-colors">BATTLE</span>
            <span className="bg-white/10 text-white text-[10px] px-2 py-1 rounded ml-2 not-italic tracking-widest">AI SIMULATOR</span>
          </div>
          <nav className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="hover:bg-white/10"
              onClick={() => setGameState(gameState === 'HISTORY' ? 'SELECTION' : 'HISTORY')}
            >
              {gameState === 'HISTORY' ? <Swords size={18} /> : <Users size={18} />}
              <span className="ml-2 font-bold hidden sm:inline">{gameState === 'HISTORY' ? 'FIGHT' : 'LEADERBOARD'}</span>
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        
        {gameState === 'SELECTION' && (
          <div className="space-y-12">
            <div className="text-center space-y-4 py-8">
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-5xl font-black tracking-tighter lg:text-7xl italic text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500"
              >
                CHOOSE YOUR FIGHTERS
              </motion.h1>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-gray-400 text-lg max-w-2xl mx-auto"
              >
                Select two legends. The AI predicts the outcome based on lore, stats, and chaos theory.
              </motion.p>
            </div>

            <AnimatePresence>
              {(p1 || p2) && (
                <motion.div 
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -50, opacity: 0 }}
                  className="sticky top-24 z-40 flex justify-center mb-8"
                >
                   <div className="bg-black/80 border border-white/20 shadow-2xl shadow-primary/20 rounded-full p-2 px-8 flex items-center gap-12 backdrop-blur-xl">
                      <div className={cn("flex items-center gap-3 transition-all", p1 ? "text-white scale-110" : "text-gray-600")}>
                        <div className={cn("w-2 h-2 rounded-full", p1 ? "bg-primary animate-pulse" : "bg-gray-800")} />
                        <span className="font-bold uppercase tracking-wider">{p1 ? p1.name : "SELECT P1"}</span>
                      </div>
                      <div className="text-white/20 font-black text-xl italic">VS</div>
                      <div className={cn("flex items-center gap-3 transition-all", p2 ? "text-white scale-110" : "text-gray-600")}>
                        <span className="font-bold uppercase tracking-wider">{p2 ? p2.name : "SELECT P2"}</span>
                        <div className={cn("w-2 h-2 rounded-full", p2 ? "bg-blue-500 animate-pulse" : "bg-gray-800")} />
                      </div>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-24">
              {CHARACTERS.map((char, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={char.id}
                >
                  <SelectionCard 
                    character={char} 
                    selected={p1?.id === char.id || p2?.id === char.id}
                    disabled={!!(p1 && p2) && p1.id !== char.id && p2.id !== char.id}
                    onClick={() => handleSelect(char)}
                  />
                </motion.div>
              ))}
            </div>

            {p1 && p2 && (
              <motion.div 
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent flex justify-center z-50"
              >
                <Button 
                  onClick={startBattle} 
                  className="h-16 px-12 text-xl font-black italic tracking-tighter bg-primary text-white hover:bg-red-600 hover:scale-105 shadow-[0_0_40px_rgba(220,38,38,0.5)] rounded-full border-2 border-white/20 transition-all"
                >
                  START SIMULATION
                </Button>
              </motion.div>
            )}
          </div>
        )}

        {gameState === 'BATTLE' && p1 && p2 && (
          <BattleArena p1={p1} p2={p2} onBattleEnd={handleBattleEnd} />
        )}

        {gameState === 'RESULT' && currentResult && p1 && p2 && (
          <BattleResultView result={currentResult} p1={p1} p2={p2} onReset={resetGame} />
        )}

        {gameState === 'HISTORY' && (
          <StatsView history={history} onBack={() => setGameState('SELECTION')} />
        )}

      </main>
    </div>
  );
}
