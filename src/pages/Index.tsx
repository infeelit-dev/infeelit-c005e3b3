{
  showBanner && !showInterstitial && !showForeverOverlay && (
    <div
      className="absolute z-30 slide-up"
      style={{
        bottom: "90px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "max-content",
        maxWidth: "90vw",
      }}
    >
      <div
        className="flex items-center gap-3 px-5 py-3 rounded-full"
        style={{
          backgroundColor: "rgba(10,10,10,0.88)",
          border: "1px solid rgba(232,116,42,0.4)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
        }}
      >
        <span className="text-white text-sm font-medium whitespace-nowrap">
          Join 2,400 families preserving their voices
        </span>
        <button
          onClick={handleJoin}
          className="px-4 py-1.5 rounded-full gradient-orange font-bold text-xs whitespace-nowrap"
          style={{ color: "#FFFFFF" }}
        >
          Join free →
        </button>
        <button onClick={() => setShowBanner(false)} className="text-white/40 text-sm font-bold ml-1">
          ✕
        </button>
      </div>
    </div>
  );
}
