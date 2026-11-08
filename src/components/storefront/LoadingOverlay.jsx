import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ASSET = (f) =>
  `https://media.base44.com/images/public/69e4d4aaed7dc3117eed9c83/${f}`;

// Scattered little ice cubes at the base of the products
const SMALL_CUBES = [
  { l: '14%', w: 10, d: 0 },
  { l: '26%', w: 7, d: 0.4 },
  { l: '38%', w: 8, d: 0.2 },
  { l: '58%', w: 9, d: 0.6 },
  { l: '70%', w: 6, d: 0.3 },
  { l: '82%', w: 10, d: 0.5 },
];

export default function LoadingOverlay() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-4"
          style={{ background: '#F2F2F2' }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
        >
          {/* Products + base scene */}
          <div className="relative w-[88vw] max-w-[360px] mx-auto shrink-0">
            {/* soft surface reflection */}
            <div
              className="absolute left-1/2 -translate-x-1/2 bottom-1 w-[88%] h-10 rounded-full"
              style={{ background: 'radial-gradient(ellipse at center, rgba(26,71,117,0.10), transparent 70%)' }}
            />

            {/* product row — slight overlap for depth, none tucked inside */}
            <div className="relative flex items-end justify-center gap-[-4px]">
              {/* c1 — cup, slightly tilted toward center */}
              <motion.div
                className="relative flex items-end justify-center origin-bottom mr-[-8px] xs:mr-[-12px] z-10"
                initial={{ opacity: 0, y: 40, scale: 0.6, rotate: -6 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotate: -3 }}
                exit={{ opacity: 0, y: -120, x: -40, rotate: -22, scale: 0.6, transition: { duration: 0.7, ease: 'easeIn', delay: 0 } }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 18, mass: 0.8 }}
              >
                <motion.img
                  src={ASSET('df716fd66_c1.png')}
                  alt=""
                  className="w-[88px] xs:w-[104px] max-w-[32vw] h-auto object-contain select-none pointer-events-none"
                  draggable={false}
                  animate={{ y: [0, -12, 0], rotate: [-3, -7, -3] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 1.6 }}
                />
              </motion.div>

              {/* p1 — large ice bag, center (front) */}
              <motion.div
                className="relative flex items-end justify-center origin-bottom z-20"
                initial={{ opacity: 0, y: 52, scale: 0.6 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -140, scale: 0.55, transition: { duration: 0.8, ease: 'easeIn', delay: 0.08 } }}
                transition={{ delay: 0.35, type: 'spring', stiffness: 240, damping: 17, mass: 0.9 }}
              >
                <motion.img
                  src={ASSET('35b38fabb_p1.png')}
                  alt=""
                  className="w-[124px] xs:w-[148px] max-w-[44vw] h-auto object-contain select-none pointer-events-none"
                  draggable={false}
                  animate={{ y: [0, -13, 0], scale: [1, 1.04, 1] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 2.0 }}
                />
              </motion.div>

              {/* p2 — small ice bag, slightly tilted toward center */}
              <motion.div
                className="relative flex items-end justify-center origin-bottom ml-[-8px] xs:ml-[-12px] z-10"
                initial={{ opacity: 0, y: 40, scale: 0.6, rotate: 6 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotate: 3 }}
                exit={{ opacity: 0, y: -120, x: 40, rotate: 22, scale: 0.6, transition: { duration: 0.7, ease: 'easeIn', delay: 0.16 } }}
                transition={{ delay: 0.55, type: 'spring', stiffness: 270, damping: 16, mass: 0.8 }}
              >
                <motion.img
                  src={ASSET('d0951267b_p2.png')}
                  alt=""
                  className="w-[84px] xs:w-[100px] max-w-[31vw] h-auto object-contain select-none pointer-events-none"
                  draggable={false}
                  animate={{ y: [0, -12, 0], rotate: [3, 7, 3] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 2.3 }}
                />
              </motion.div>
            </div>

            {/* scattered little ice cubes */}
            <div className="relative h-3">
              {SMALL_CUBES.map((c, i) => (
                <motion.span
                  key={i}
                  className="absolute bottom-0 rounded-[3px]"
                  style={{
                    left: c.l,
                    width: c.w,
                    height: c.w,
                    background: 'linear-gradient(135deg, #ffffff, #dfe6ee)',
                    border: '1px solid rgba(26,71,117,0.18)',
                  }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + c.d, duration: 0.5 }}
                />
              ))}
            </div>
          </div>

          {/* Progress bar (above the speech bubble) */}
          <div className="relative mt-8 w-[180px] xs:w-[210px] mx-auto h-1.5 rounded-full overflow-hidden" style={{ background: '#DDE3EA' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: '#1D5D8A' }}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 3.6, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </div>

          {/* Speech-bubble loading message (pointer up to progress bar) */}
          <motion.div
            className="relative mt-3 rounded-xl bg-white px-5 py-3 shadow-[0_6px_18px_rgba(26,71,117,0.12)]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: [0, 0.4, 1, 0.4, 1, 1], y: 0 }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 1.0 }}
          >
            <div
              className="absolute left-1/2 -top-2 -translate-x-1/2 w-4 h-4 rotate-45 bg-white"
              style={{ boxShadow: '-2px -2px 4px rgba(26,71,117,0.06)' }}
            />
            <p className="relative text-sm xs:text-base text-center whitespace-nowrap">
              <span style={{ color: '#333333' }}>Loading </span>
              <span style={{ color: '#000000', fontWeight: 800 }}>Natural Ice</span>
              <span style={{ color: '#333333' }}> deals & more…</span>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}