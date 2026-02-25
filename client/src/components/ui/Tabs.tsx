import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

interface Tab {
    id: string;
    label: string;
}
interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onChange: (id: string) => void;
}

type HoverState = {
    opacity: number;
    left: number;
    width: number;
};

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
    const navRef = useRef<HTMLDivElement | null>(null);
    const [hoverState, setHoverState] = useState<HoverState>({
        opacity: 0,
        left: 0,
        width: 0,
    });

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!navRef.current) return;

        const navRect = navRef.current.getBoundingClientRect();
        const itemRect = e.currentTarget.getBoundingClientRect();

        setHoverState({
            opacity: 1,
            left: itemRect.left - navRect.left,
            width: itemRect.width,
        });
    };

    const handleMouseLeave = () => {
        setHoverState((prev) => ({ ...prev, opacity: 0 }));
    };

    return (
        <div
            ref={navRef}
            className="relative flex items-center justify-evenly mb-6 px-2 border-gray-200"
            onMouseLeave={handleMouseLeave}
        >
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        onMouseEnter={handleMouseEnter}
                        className="relative cursor-pointer px-2 py-4 text-[18px] font-medium select-none transition-colors duration-200 outline-none"
                        style={{ color: isActive ? "#111827" : "#6b7280" }}
                    >
                        {tab.label}
                    </button>
                );
            })}

            <motion.div
                className="absolute -bottom-1 h-[6px] pointer-events-none"
                animate={{
                    left: hoverState.left,
                    width: hoverState.width,
                    opacity: hoverState.opacity,
                    scaleX: hoverState.opacity === 1 ? 1 : 0,
                }}
                transition={{
                    type: "spring",
                    bounce: 0.2,
                    duration: 0.4,
                }}
                style={{ originX: 0.5 }}
            >
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 100 10"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M0,5 Q12.5,0 25,5 T50,5 T75,5 T100,5"
                        stroke="#111827"
                        strokeWidth="2.5"
                        fill="transparent"
                        strokeLinecap="round"
                    />
                </svg>
            </motion.div>
        </div>
    );
}
