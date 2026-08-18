export function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute inset-0 bg-[#070b14]" />

      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255, 255, 255, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-cyan-600/10 blur-[130px]" />
      <div className="absolute top-1/4 right-0 w-[650px] h-[650px] rounded-full bg-purple-600/10 blur-[150px]" />
      <div className="absolute -bottom-40 left-1/3 w-[700px] h-[700px] rounded-full bg-blue-600/10 blur-[160px]" />

      <div className="absolute inset-0 bg-gradient-to-t from-[#070b14]/70 via-transparent to-[#070b14]/50 pointer-events-none" />
    </div>
  )
}
