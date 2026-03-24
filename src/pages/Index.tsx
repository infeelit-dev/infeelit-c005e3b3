import Header from "@/components/Header";
import BubbleCanvas from "@/components/BubbleCanvas";
import CurvedBottomNav from "@/components/CurvedBottomNav";

const Index = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden gradient-canvas">
      <Header />
      <BubbleCanvas />
      <CurvedBottomNav />
    </div>
  );
};

export default Index;
