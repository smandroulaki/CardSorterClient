import { useEffect } from "react";
import { useDrop } from "react-dnd";

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
  const [{ isOver }, drop] = useDrop({
    accept: "card-drag",
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });

  useEffect(() => {
    if (!isOver) return;

    let frame: number;
    const tick = () => {
      listRef.current?.scrollBy({
        left: direction === "left" ? -SCROLL_SPEED : SCROLL_SPEED,
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [isOver, direction, listRef]);

  return (
    <button
      // @ts-ignore (same ref typing issue as your <ul>)
      ref={drop}
      id={`scroll-${direction}`}
      onClick={onClick}
      style={{
        ...style,
        transform: isOver ? "scale(1.2)" : "scale(1)",
        transition: "transform 0.15s ease",
      }}
    >
      <span className="material-symbols-outlined">{icon}</span>
    </button>
  );
};

export default DragScrollButton;
