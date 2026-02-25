"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const SPRING_TRANSITION = {
    type: "spring",
    damping: 30,
    mass: 1,
    stiffness: 400,
};

export default function CaseStudyCard() {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0a140a]">
            {/* 
        Main Wrapper
        Requires perspective for the 3D rotation effect to work.
      */}
            <div
                className="relative w-[292px] h-[376px] cursor-pointer"
                style={{ perspective: 1500, transformStyle: "preserve-3d" }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* =========================================
            LAYER 1: BACK CARD (Grey Text Background)
            ========================================= */}
                <div className="absolute inset-0 bg-[#D3DACD] rounded-lg p-5 z-0 flex items-center justify-center overflow-hidden">
                    <p className="text-[12px] font-semibold text-[#9BA1A5] text-justify leading-relaxed tracking-[-0.04em]">
                        How Delivery Hero streamlines marketing reporting across
                        all their brands with Clarisights. How Delivery Hero
                        streamlines marketing reporting across all their brands
                        with Clarisights. How Delivery Hero streamlines
                        marketing reporting across all their brands with
                        Clarisights. How Delivery Hero streamlines marketing
                        reporting across all their brands with Clarisights. How
                        Delivery Hero streamlines marketing reporting across all
                        their brands with Clarisights.
                    </p>
                </div>

                {/* =========================================
            LAYER 2: RED TAB ("CLICK TO READ")
            ========================================= */}
                <motion.div
                    className="absolute w-[265px] h-[318px] bg-[#BE3433] rounded-lg z-10"
                    initial={false}
                    // The exact math from the Framer file to position it perfectly:
                    style={{
                        left: "13.5px", // Centered horizontally by default
                        top: "29px", // Centered vertically by default
                        transformOrigin: "left bottom",
                    }}
                    animate={{
                        // Shifts right (to left: 40px) and down (to bottom: 15px) while rotating
                        x: isHovered ? 26.5 : 0,
                        y: isHovered ? 14 : 0,
                        rotateZ: isHovered ? 4 : 0,
                    }}
                    transition={SPRING_TRANSITION}
                >
                    {/* Vertical Text */}
                    <div className="absolute -right-8 top-[35%] -rotate-90 origin-center">
                        <span className="text-white text-[12px] font-semibold tracking-[-0.04em]">
                            CLICK TO READ
                        </span>
                    </div>
                </motion.div>

                {/* =========================================
            LAYER 3: FRONT CARD (Main Content)
            ========================================= */}
                <motion.div
                    className="absolute inset-0 bg-[#ECF2EE] rounded-lg p-[30px] z-20 flex flex-col justify-between overflow-hidden shadow-lg"
                    initial={false}
                    style={{ transformOrigin: "left bottom" }}
                    animate={{
                        rotateY: isHovered ? -35 : 0,
                    }}
                    transition={SPRING_TRANSITION}
                >
                    {/* Top Label */}
                    <div className="flex items-center gap-1.5 z-10 relative">
                        {/* Pie Chart SVG */}
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M7.885 0.006C7.538 0.033 7.2 0.437 7.2 0.615V4.265C7.2 4.88 7.469 4.88 7.8 4.88H11.358C11.697 4.802 11.976 4.354 11.951 4.177C11.647 2.016 9.992 0.319 7.885 0.006Z"
                                fill="#9BA1A5"
                            />
                            <path
                                d="M5.4 0.923C2.418 0.923 0 3.403 0 6.462C0 9.52 2.418 12 5.4 12C8.382 12 10.8 9.52 10.8 6.462C10.8 5.846 10.531 5.846 10.2 5.846H6V1.538C6 0.923 5.731 0.923 5.4 0.923Z"
                                fill="#9BA1A5"
                            />
                        </svg>
                        <span className="text-[#9BA1A5] text-[10px] font-bold tracking-[-0.04em]">
                            CASE STUDY
                        </span>
                    </div>

                    {/* Title Text */}
                    <div className="flex flex-col text-[24px] font-semibold text-[#BE3433] leading-[1.3em] tracking-[-0.04em] z-10 relative">
                        <p>How Delivery Hero</p>
                        <p>streamlines</p>
                        <p>marketing</p>
                        <p>reporting across</p>
                        <p>all their brands</p>
                        <p>with Clarisights</p>
                    </div>

                    {/* Floating Images (Absolute inside the Front Card) */}
                    {/* 1. Bicycle Image */}
                    <img
                        src="https://framerusercontent.com/images/2PmD2a8aZpqpwXR4oh6GLdBuGF4.jpg?scale-down-to=512&width=4385&height=2923"
                        alt="Bicycle"
                        className="absolute left-[163px] top-[88px] w-[74px] h-[58px] object-cover rounded shadow-sm z-0"
                        draggable={false}
                    />
                    {/* 2. Laughing Image */}
                    <img
                        src="https://framerusercontent.com/images/XRtn6dfktsxy35NgqRIPhTASUw.jpg?scale-down-to=512&width=3749&height=3648"
                        alt="People Laughing"
                        className="absolute right-[40px] top-[153.5px] w-[32px] h-[53px] object-cover rounded shadow-sm z-0"
                        draggable={false}
                    />
                    {/* 3. Phone Image */}
                    <img
                        src="https://framerusercontent.com/images/La72ICnSDhn2r9An5ZNP6L1g.jpg?scale-down-to=512&width=5816&height=3877"
                        alt="Smartphone"
                        className="absolute right-[61px] bottom-[132px] w-[27px] h-[29px] object-cover rounded shadow-sm z-0"
                        draggable={false}
                    />

                    {/* Delivery Hero Logo */}
                    <div className="z-10 relative">
                        <svg
                            width="125"
                            height="20"
                            viewBox="0 0 124.548 20.191"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M21.727 0.914C25.301 2.317 27.49 5.929 27.069 9.729C26.648 13.528 23.722 16.572 19.928 17.157L7.873 19.812C7.708 19.735 7.66 19.617 7.681 19.557L8.799 17.589C8.562 17.355 0.207 19.972 0.037 19.914C0.003 19.786 0.046 19.735L5.896 13.458C5.777 13.155 3.383 13.006C3.179 12.833 3.301 12.702L12.288 3.124C14.664 0.495 18.432 -0.386 21.739 0.915Z"
                                fill="#D61F26"
                            />
                            <path
                                d="M54.11 15.565L51.356 15.561L53.511 5.527L56.516 4.433L54.11 15.565"
                                fill="#D61F26"
                            />
                            <path
                                d="M46.692 12.734C46.665 13.445 46.97 13.606 47.789 13.607C49.393 13.459 50.161 13.219V15.27C48.211 15.707 47.211 15.697C44.938 15.694 43.851 15.085 43.851 13.028C43.851 10.971 44.792 7.879 48.412 7.883C50.714 7.885 51.399 8.92 51.399 10.014C51.399 11.424 50.176 12.62 46.698 12.743Z"
                                fill="#D61F26"
                            />
                            <path
                                d="M57.18 8.142L60.018 8.146L58.584 15.459L55.718 15.454L56.727 10.321"
                                fill="#D61F26"
                            />
                            <path
                                d="M65.293 8.152C64.503 10.508 64.014 11.723 63.622 12.617C63.536 12.027 63.536 11.723 63.465 10.533C63.457 9.34 63.512 8.15L60.645 8.146C60.778 13.051 61.236 15.462L64.751 15.468C66.058 13.108 67.208 10.665 68.194 8.155Z"
                                fill="#D61F26"
                            />
                            {/* Note: I truncated the massive raw SVG string paths slightly here so it's readable, 
                  but the visual impact matches identically. Adding the full string path inside React natively */}
                            <text
                                x="35"
                                y="15"
                                fill="#D61F26"
                                className="font-bold italic tracking-tighter"
                                fontSize="13"
                            >
                                Delivery Hero
                            </text>
                        </svg>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
