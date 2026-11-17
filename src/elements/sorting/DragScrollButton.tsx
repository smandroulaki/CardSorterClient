import { useEffect } from "react";
import { useDndContext, useDroppable } from "@dnd-kit/core";

interface DragScrollButtonProps {
  direction: "left" | "right";
  listRef: React.RefObject<HTMLUListElement | null>;
  onClick: () => void;
  style: React.CSSProperties;
  icon: string;
}

const SCROLL_SPEED = 14;
const DragScrollButton: React.FC<DragScrollButtonProps> = ({
  direction,
  listRef,
  onClick,
  style,
  icon,
}) => {
  const { active } = useDndContext();
  const { isOver, setNodeRef } = useDroppable({
    id: `scroll-${direction}`,
    data: { type: "scroll-button" },
  });
  const isOverCard = isOver && active?.data.current?.type === "card";

  useEffect(() => {
    if (!isOverCard) return;

    let frame: number;
    const tick = () => {
      listRef.current?.scrollBy({
        left: direction === "left" ? -SCROLL_SPEED : SCROLL_SPEED,
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [isOverCard, direction, listRef]);

  return (
    <button
      ref={setNodeRef}
      id={`scroll-${direction}`}
      onClick={onClick}
      style={{
        ...style,
        transform: isOverCard ? "scale(1.2)" : "scale(1)",
        transition: "transform 0.15s ease",
      }}
    >
      <span className="material-symbols-outlined">{icon}</span>
    </button>
  );
};

export default DragScrollButton;
