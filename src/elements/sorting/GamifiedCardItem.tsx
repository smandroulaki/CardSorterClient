import React, { MouseEvent } from "react";
import { useDraggable } from "@dnd-kit/core";
import { useDispatch } from "react-redux";
import * as sortingBoardAction from "../../actions/sorting/sortingBoardAction";
import IconButton from "@mui/material/IconButton";

interface CardItemProps {
  id: number;
  title: string;
  description?: string;
  minimized: boolean;
  position: number;
  showDescription?: boolean;
}

const GamifiedCardItem: React.FC<CardItemProps> = ({
  id,
  title,
  description,
  minimized,
  position,
  showDescription,
}) => {
  // Dispatch
  const dispatch = useDispatch();

  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (description && description.length > 0) {
      dispatch(sortingBoardAction.toggleDescription({ cardID: id }));
    }
  };

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `card-${id}`,
    data: {
      type: "card",
      cardID: id,
      position,
      title,
      description,
    },
  });

  return (
    <li
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`${!minimized ? "card" : "card minimized"} ${
        isDragging ? "dragging" : ""
      }`}
      style={{ touchAction: "none" }}
    >
      {/* Show the description */}
      {!minimized && (
        <>
          <h4>{title}</h4>
          <p>{description}</p>
        </>
      )}

      {minimized && (
        <div className="titles ">
          <h4>{title}</h4>
          {showDescription && <p>{description}</p>}
        </div>
      )}
      {/* Show the description button */}
      {minimized && description && (
        <IconButton
          aria-label="Expand description"
          onClick={onClick}
          className={showDescription ? "open" : ""}
        >
          <span className="material-symbols-rounded">keyboard_arrow_down</span>
        </IconButton>
      )}
      {/* The "drag to add" action */}
    </li>
  );
};

export default GamifiedCardItem;
