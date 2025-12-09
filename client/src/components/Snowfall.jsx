import { useEffect, useState } from 'react';

const Snowfall = () => {
    const [snowflakes, setSnowflakes] = useState([]);

    useEffect(() => {
        // Create snowflakes
        const flakes = [];
        const count = 50; // Number of snowflakes

        for (let i = 0; i < count; i++) {
            flakes.push({
                id: i,
                left: Math.random() * 100,
                delay: Math.random() * 10,
                duration: 8 + Math.random() * 7,
                size: 2 + Math.random() * 4,
                opacity: 0.3 + Math.random() * 0.7,
            });
        }

        setSnowflakes(flakes);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            {snowflakes.map((flake) => (
                <div
                    key={flake.id}
                    className="absolute rounded-full bg-white animate-snowfall"
                    style={{
                        left: `${flake.left}%`,
                        width: `${flake.size}px`,
                        height: `${flake.size}px`,
                        opacity: flake.opacity,
                        animationDelay: `${flake.delay}s`,
                        animationDuration: `${flake.duration}s`,
                    }}
                />
            ))}

            <style>{`
        @keyframes snowfall {
          0% {
            transform: translateY(-10px) rotate(0deg);
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
          }
        }
        .animate-snowfall {
          animation: snowfall linear infinite;
        }
      `}</style>
        </div>
    );
};

export default Snowfall;
