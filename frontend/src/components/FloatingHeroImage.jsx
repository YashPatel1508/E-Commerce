import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export default function FloatingHeroImage({ src, alt, className }) {
    const containerRef = useRef(null);

    // Track scroll progress within the viewport
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    // We want a very smooth spring effect for the scroll animations
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

    // Extreme, cinematic scaling and rotation effects
    // As we scroll down, the image scales UP slightly and rotates
    const scale = useTransform(smoothProgress, [0, 0.5, 1], [0.9, 1.1, 1.2]);
    const rotateZ = useTransform(smoothProgress, [0, 0.5, 1], [-5, 0, 5]);
    const rotateY = useTransform(smoothProgress, [0, 0.5, 1], [-15, 0, 15]);
    const rotateX = useTransform(smoothProgress, [0, 0.5, 1], [10, 0, -10]);
    
    // Parallax floating
    const yParallax = useTransform(smoothProgress, [0, 1], [100, -100]);

    return (
        <div ref={containerRef} className="w-full h-full relative perspective-[2000px] flex items-center justify-center">
            
            {/* Background Glow */}
            <motion.div 
                className="absolute inset-0 w-full h-full bg-black/5 blur-[100px] rounded-full z-0"
                style={{ scale: useTransform(smoothProgress, [0, 1], [0.8, 1.3]) }}
            />

            <motion.div
                style={{
                    scale,
                    rotateX,
                    rotateY,
                    rotateZ,
                    y: yParallax,
                    transformStyle: "preserve-3d"
                }}
                className="w-full h-full relative z-10 flex items-center justify-center"
            >
                {/* Continuous Levitation Animation (Bobbing) */}
                <motion.div
                    animate={{ 
                        y: ["-15px", "15px"], 
                        rotateZ: ["-1deg", "1deg"]
                    }}
                    transition={{
                        repeat: Infinity,
                        repeatType: "mirror",
                        duration: 4,
                        ease: "easeInOut"
                    }}
                    style={{ transformStyle: "preserve-3d" }}
                    className="w-full h-full flex items-center justify-center"
                >
                    <img 
                        src={src} 
                        alt={alt} 
                        className={`${className} drop-shadow-2xl z-20 object-contain max-h-[120%]`}
                        style={{ transform: "translateZ(50px)" }} 
                    />
                    
                    {/* Shadow that shrinks/grows as image bobs */}
                    <motion.div
                        animate={{ 
                            scale: [0.8, 1.2],
                            opacity: [0.3, 0.1]
                        }}
                        transition={{
                            repeat: Infinity,
                            repeatType: "mirror",
                            duration: 4,
                            ease: "easeInOut"
                        }}
                        className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-black/40 blur-2xl rounded-[100%] z-10 pointer-events-none"
                    />
                </motion.div>
            </motion.div>
        </div>
    );
}
