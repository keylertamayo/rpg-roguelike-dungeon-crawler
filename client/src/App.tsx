import { useEffect, useState } from "react";
import { useGame } from "./lib/stores/useGame";
import { useDungeon } from "./lib/stores/useDungeon";
import { usePlayer } from "./lib/stores/usePlayer";
import { useAudio } from "./lib/stores/useAudio";
import { GameCanvas } from "./components/Game/GameCanvas";
import { GameUI } from "./components/Game/GameUI";
import "@fontsource/inter";

function App() {
  const { phase, start, restart } = useGame();
  const { resetDungeon } = useDungeon();
  const { resetPlayer } = usePlayer();
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();
  const [showCanvas, setShowCanvas] = useState(false);

  // Load audio files
  useEffect(() => {
    const loadAudio = async () => {
      try {
        const bgMusic = new Audio('/sounds/background.mp3');
        const hitSound = new Audio('/sounds/hit.mp3');
        const successSound = new Audio('/sounds/success.mp3');
        
        bgMusic.loop = true;
        bgMusic.volume = 0.3;
        
        setBackgroundMusic(bgMusic);
        setHitSound(hitSound);
        setSuccessSound(successSound);
      } catch (error) {
        console.log('Audio loading failed:', error);
      }
    };

    loadAudio();
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  // Show the canvas once everything is loaded
  useEffect(() => {
    setShowCanvas(true);
  }, []);

  const handleStartGame = () => {
    start();
  };

  const handleRestartGame = () => {
    resetPlayer();
    resetDungeon();
    restart();
    start();
  };

  // Handle restart from game store
  useEffect(() => {
    if (phase === "ready") {
      resetPlayer();
      resetDungeon();
    }
  }, [phase, resetPlayer, resetDungeon]);

  if (!showCanvas) {
    return (
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
        color: 'white'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {phase === 'ready' && (
        <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-20">
          <div className="bg-gray-900 text-white p-8 rounded-lg text-center max-w-md">
            <h1 className="text-4xl font-bold mb-4">Dungeon Crawler</h1>
            <p className="text-gray-300 mb-6">
              Explore procedurally generated dungeons, fight monsters, collect loot, and level up your character!
            </p>
            <div className="space-y-4 text-left text-sm mb-6">
              <div>
                <span className="font-semibold">Movement:</span> WASD or Arrow Keys
              </div>
              <div>
                <span className="font-semibold">Interact:</span> E or Space
              </div>
              <div>
                <span className="font-semibold">Inventory:</span> I or Tab
              </div>
              <div>
                <span className="font-semibold">Attack:</span> X or Enter (in combat)
              </div>
            </div>
            <button
              onClick={handleStartGame}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg transition-colors font-semibold"
            >
              Start Adventure
            </button>
          </div>
        </div>
      )}

      {phase === 'playing' && (
        <>
          <GameCanvas />
          <GameUI />
        </>
      )}
    </div>
  );
}

export default App;
