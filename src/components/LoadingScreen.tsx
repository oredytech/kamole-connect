import { useEffect, useState } from "react";
import logoLight from "@/assets/logo-light.jpg";

const LoadingScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onFinish, 300);
          return 100;
        }
        return p + 2;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [onFinish]);

  // Progress goes around the rectangle: top -> right -> bottom -> left
  const totalPerimeter = 2 * (200 + 120); // approx logo container size
  const dashOffset = totalPerimeter - (totalPerimeter * progress) / 100;

  return (
    <div className="fixed inset-0 z-[9999] bg-[hsl(0,0%,13%)] flex flex-col items-center justify-center">
      <div className="relative">
        {/* SVG progress border */}
        <svg
          className="absolute -inset-3"
          width="226"
          height="146"
          viewBox="0 0 226 146"
        >
          <rect
            x="2"
            y="2"
            width="222"
            height="142"
            rx="8"
            fill="none"
            stroke="hsl(0,0%,30%)"
            strokeWidth="3"
          />
          <rect
            x="2"
            y="2"
            width="222"
            height="142"
            rx="8"
            fill="none"
            stroke="hsl(21,90%,54%)"
            strokeWidth="3"
            strokeDasharray={totalPerimeter}
            strokeDashoffset={dashOffset}
            className="transition-all duration-100 ease-linear"
            style={{ strokeLinecap: "round" }}
          />
        </svg>
        <img src={logoLight} alt="Kamole FM" className="w-[200px] h-auto rounded-lg" />
      </div>
      <p className="text-white/60 text-sm mt-6 font-body">Chargement... {progress}%</p>
    </div>
  );
};

export default LoadingScreen;
