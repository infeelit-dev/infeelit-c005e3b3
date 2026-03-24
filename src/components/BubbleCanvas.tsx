import MemoryBubble from "./MemoryBubble";
import memory1 from "@/assets/memory1.jpg";
import memory2 from "@/assets/memory2.jpg";
import memory3 from "@/assets/memory3.jpg";
import memory4 from "@/assets/memory4.jpg";

const bubbles = [
  { image: memory1, size: 140, x: 8, y: 20, label: "Sunset Walk", glowColor: "orange" as const, anim: "animate-float-slow", delay: "0s" },
  { image: memory2, size: 110, x: 55, y: 12, label: "Rooftop Vibes", glowColor: "teal" as const, anim: "animate-float-medium", delay: "1s" },
  { image: memory3, size: 160, x: 35, y: 45, label: "Cherry Blossoms", glowColor: "teal" as const, anim: "animate-float-slow", delay: "2s" },
  { image: memory4, size: 100, x: 70, y: 55, label: "Cappadocia", glowColor: "orange" as const, anim: "animate-float-medium", delay: "0.5s" },
  // Small ambient bubbles (no image)
  { image: memory1, size: 45, x: 82, y: 25, anim: "animate-float-fast", delay: "3s" },
  { image: memory2, size: 35, x: 18, y: 65, anim: "animate-float-fast", delay: "1.5s" },
  { image: memory3, size: 55, x: 60, y: 75, anim: "animate-float-medium", delay: "2.5s" },
  { image: memory4, size: 30, x: 45, y: 15, anim: "animate-float-fast", delay: "0.8s" },
];

const BubbleCanvas = () => {
  return (
    <div className="absolute inset-0 z-[1] overflow-hidden">
      {/* Bokeh background elements */}
      <div className="bokeh-circle w-60 h-60 bg-white/40 top-[10%] left-[-5%] animate-bokeh" />
      <div className="bokeh-circle w-80 h-80 bg-orange-200/30 bottom-[15%] right-[-10%] animate-bokeh" style={{ animationDelay: "4s" }} />
      <div className="bokeh-circle w-48 h-48 bg-cyan-200/25 top-[50%] left-[30%] animate-bokeh" style={{ animationDelay: "7s" }} />
      <div className="bokeh-circle w-36 h-36 bg-amber-200/20 top-[25%] right-[20%] animate-bokeh" style={{ animationDelay: "2s" }} />

      {/* Memory bubbles */}
      {bubbles.map((b, i) => (
        <MemoryBubble
          key={i}
          image={b.image}
          size={b.size}
          x={b.x}
          y={b.y}
          label={b.label}
          glowColor={b.glowColor}
          animationClass={b.anim}
          delay={b.delay}
        />
      ))}
    </div>
  );
};

export default BubbleCanvas;
