type IconName = "bulb" | "bolt" | "battery" | "socket" | "clock";

export function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    bulb: <><path d="M9 18h6M10 21h4M8.5 14.5a7 7 0 1 1 7 0C14.5 15.2 15 17 15 18H9c0-1 .5-2.8-.5-3.5Z" /><path d="M12 6v3m-3-1 3 1 3-1" /></>,
    bolt: <path d="m13 2-9 12h7l-1 8 10-13h-7l1-7Z" />,
    battery: <><rect x="3" y="6" width="16" height="12" rx="3" /><path d="M22 10v4M7 10v4m4-4v4m4-4v4" /></>,
    socket: <><path d="M8 3h8v5l2 3-3 5H9l-3-5 2-3V3ZM9 19h6m-5 3h4M8 7h8M9 12h6" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  };

  return <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
