export default function Progress({ animate }: { animate?: boolean }) {
  return (
    <div className="h-[14px] w-full border-border border rounded-[8px] relative">
      <div
        className={`absolute left-[2px] w-[40px] top-[3px] bg-primary h-[6px] rounded ${animate ? 'animate-progress' : ''}`}
      ></div>
    </div>
  )
}
