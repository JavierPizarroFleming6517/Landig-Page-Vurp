import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

interface RevealProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  delay?: number;
  direction?: Direction;
  distance?: number;
  once?: boolean;
}

const offsetFor = (direction: Direction, distance: number): { x: number; y: number } => {
  switch (direction) {
    case "up":
      return { x: 0, y: distance };
    case "down":
      return { x: 0, y: -distance };
    case "left":
      return { x: distance, y: 0 };
    case "right":
      return { x: -distance, y: 0 };
    case "none":
      return { x: 0, y: 0 };
  }
};

export function Reveal({
  children,
  delay = 0,
  direction = "up",
  distance = 32,
  once = true,
  ...rest
}: RevealProps) {
  const offset = offsetFor(direction, distance);

  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(6px)", ...offset }}
      whileInView={{ opacity: 1, filter: "blur(0px)", x: 0, y: 0 }}
      viewport={{ once, amount: 0.3 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
