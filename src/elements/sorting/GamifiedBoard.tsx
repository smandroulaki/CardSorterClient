import React, { useEffect, useRef, useState } from "react";
import { useDndContext, useDndMonitor, useDroppable } from "@dnd-kit/core";
import { useDispatch, useSelector } from "react-redux";
import StateSchema from "reducers/StateSchema";
import * as sortingBoardAction from "actions/sorting/sortingBoardAction";
import { useTranslations } from "next-intl";
import ProgressBar from "./ProgressBar/ProgressBar";
import { SortingCategory } from "reducers/sorting/sortingBoardReducer";
import { DragOverlay } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { playSound } from "utils/audio/sounds";
import GamifiedCategory from "./GamifiedCategory";

interface BoardProps {
  activeCategory: SortingCategory | null;
}

const GamifiedBoard = ({ activeCategory }: BoardProps) => {
  const t = useTranslations("SortingPage");

  // Clap animation
  const [showClap, setShowClap] = useState(false);
  const clapTimer = useRef<NodeJS.Timeout | null>(null);

  // Fire animation
  const [showFire, setShowFire] = useState(false);
  const fireTimer = useRef<NodeJS.Timeout | null>(null);

  // Track sorts for streaks
  const lastSortTime = useRef<number | null>(null);
  const STREAK_WINDOW_MS = 2200;

  useEffect(() => {
    return () => {
      if (clapTimer.current) {
        clearTimeout(clapTimer.current);
      }
      if (fireTimer.current) {
        clearTimeout(fireTimer.current);
      }
    };
  }, []);

  // State
  const categories = useSelector(
    (state: StateSchema) => state.sortingBoard.categories,
  );

  // In which mode you are closed/open/hybrid

  const sortType = useSelector(
    (state: StateSchema) => state.sortingUi?.sortType ?? "open",
  );

  const categoryOrder = useSelector(
    (state: StateSchema) => state.sortingBoard.categoryOrder,
  );

  const categoryRefs = useRef<Record<number, HTMLElement | null>>({});

  const { active } = useDndContext();
  const isDraggingCard = active?.data.current?.type === "card";

  const getInsertIndex = (): number => {
    const activeRect = active?.rect.current.translated;
    if (!activeRect) return categoryOrder.length;
    const point = {
      x: activeRect.left + activeRect.width / 2,
      y: activeRect.top + activeRect.height / 2,
    };
    // Group categories into rows by their top position
    const entries = categoryOrder
      .map((id, index) => {
        const el = categoryRefs.current[id];
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return { id, index, rect };
      })
      .filter(Boolean) as { id: number; index: number; rect: DOMRect }[];

    if (entries.length === 0) return categoryOrder.length;

    // If the cursor is below the lowest row, insert at the end
    const lowestBottom = Math.max(...entries.map((e) => e.rect.bottom));
    if (point.y > lowestBottom) {
      return categoryOrder.length;
    }

    const rowTops = [
      ...new Set(entries.map((e) => Math.round(e.rect.top / 10) * 10)),
    ];

    const cursorRowTop = rowTops.reduce(
      (closest, top) =>
        Math.abs(top - point.y) < Math.abs(closest - point.y) ? top : closest,
      rowTops[0],
    );
    // Filter to only entries on that row
    const rowEntries = entries.filter(
      (e) => Math.round(e.rect.top / 10) * 10 === cursorRowTop,
    );

    // Within the row, find insert position by x
    for (const entry of rowEntries) {
      if (point.x < entry.rect.left + entry.rect.width / 2) {
        return entry.index;
      }
    }

    // Cursor is past the last item in the row — insert after last item in that row
    return rowEntries[rowEntries.length - 1].index + 1;
  };
  const hoveredGapIndex = isDraggingCard ? getInsertIndex() : null;
  // Dispatch
  const dispatch = useDispatch();

  // Shared sort animation handler — shows fire on streak, clap otherwise (never both)
  const handleSortAnimation = () => {
    const now = Date.now();
    const isStreak =
      lastSortTime.current !== null &&
      now - lastSortTime.current <= STREAK_WINDOW_MS;
    lastSortTime.current = now;

    if (isStreak) {
      // Fire: cancel clap, show fire
      setShowClap(false);
      if (clapTimer.current) clearTimeout(clapTimer.current);
      setShowFire(true);
      if (fireTimer.current) clearTimeout(fireTimer.current);
      fireTimer.current = setTimeout(() => setShowFire(false), 1200);
    } else {
      // Clap: cancel fire, show clap
      setShowFire(false);
      if (fireTimer.current) clearTimeout(fireTimer.current);
      setShowClap(true);
      if (clapTimer.current) clearTimeout(clapTimer.current);
      clapTimer.current = setTimeout(() => setShowClap(false), 1200);
    }
    playSound("table");
  };

  const { isOver, setNodeRef } = useDroppable({
    id: "sorting-board",
    data: { type: "board" },
  });

  useDndMonitor({
    onDragEnd: ({ active: dragged, over }) => {
      const data = dragged.data.current;
      if (
        data?.type !== "card" ||
        typeof data.cardID !== "number" ||
        typeof data.position !== "number" ||
        !over
      ) {
        return;
      }

      const cardID = data.cardID;
      const position = data.position;
      if (
        over.data.current?.type === "category" &&
        typeof over.data.current.categoryID === "number"
      ) {
        const categoryID = over.data.current.categoryID;
        if (categoryID === position) return;

        if (position > -1) {
          dispatch(
            sortingBoardAction.removeCardFromCategory({
              cardID,
              categoryID: position,
            }),
          );
        }
        dispatch(sortingBoardAction.addCardToCategory({ cardID, categoryID }));
        handleSortAnimation();
      } else if (
        over.id === "sorting-board" &&
        (sortType === "open" || sortType === "hybrid")
      ) {
        if (position > -1) {
          // The card belongs to a category
          dispatch(
            sortingBoardAction.removeCardFromCategory({
              cardID,
              categoryID: position,
              preserve: false,
            }),
          );
        }
        dispatch(
          sortingBoardAction.createCategory({
            cardID,
            insertAtIndex: getInsertIndex(),
          }),
        );
        handleSortAnimation();
      } else {
        return;
      }
      // Remove empty categories
      if (sortType === "open") {
        const emptyCategory = Object.values(categories).find(
          (category) => category.cards.length < 1 && category.id !== position,
        );
        if (emptyCategory) {
          dispatch(
            sortingBoardAction.removeCategory({
              categoryID: emptyCategory.id,
            }),
          );
        }
      }
    },
  });
  Object.values(categories).forEach((category) => {
    if (!Array.isArray(category.cards)) {
      console.warn("category.cards is not an array! Value:", category.cards);
    }
  });

  const [zoom, setZoom] = useState(1);
  const zoomIn = () => setZoom((z) => Math.min(1.5, +(z + 0.1).toFixed(2)));
  const zoomOut = () => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)));
  const resetZoom = () => setZoom(1);

  return (
    <>
      <ProgressBar />

      <div className="zoom-controls">
        <button onClick={zoomOut} disabled={zoom <= 0.6} aria-label="Zoom out">
          <span className="material-symbols-outlined">remove</span>
        </button>
        <button onClick={resetZoom} aria-label="Reset zoom">
          {Math.round(zoom * 100)}%
        </button>
        <button onClick={zoomIn} disabled={zoom >= 1.4} aria-label="Zoom in">
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>

      <div
        id="board"
        ref={setNodeRef}
        className="category-board"
        style={{ "--z": zoom } as React.CSSProperties}
      >
        <SortableContext items={categoryOrder} strategy={rectSortingStrategy}>
          {isOver &&
            (sortType === "open" || sortType === "hybrid") &&
            isDraggingCard &&
            hoveredGapIndex === 0 && (
              <div className=" category drop-to-create active">
                <span className="material-symbols-outlined">add</span>
                <p>{t("drop to create category")}</p>
              </div>
            )}
          {categoryOrder.map((id, index) => {
            const category = categories[id];
            if (!category) return null;
            return (
              <React.Fragment key={id}>
                <GamifiedCategory
                  id={category.id}
                  title={category.title}
                  cards={category.cards}
                  color={category.color}
                  predefined={category.predefined}
                  innerRef={(el) => {
                    categoryRefs.current[id] = el;
                  }}
                />
                {isOver &&
                  (sortType === "open" || sortType === "hybrid") &&
                  isDraggingCard &&
                  hoveredGapIndex === index + 1 && (
                    <div className="category drop-to-create active">
                      <span className="material-symbols-outlined">add</span>
                      <p>{t("drop to create category")}</p>
                    </div>
                  )}
              </React.Fragment>
            );
          })}
        </SortableContext>

        <DragOverlay>
          {isDraggingCard && active?.data.current ? (
            <li className="card dragging-overlay">
              <h4>{active.data.current.title}</h4>
              {active.data.current.description && (
                <p>{active.data.current.description}</p>
              )}
            </li>
          ) : activeCategory ? (
            <GamifiedCategory
              id={activeCategory.id}
              title={activeCategory.title}
              cards={activeCategory.cards}
              color={activeCategory.color}
              predefined={activeCategory.predefined}
              isOverlay
            />
          ) : null}
        </DragOverlay>
        <div className={`clap-animation${showClap ? " active" : ""}`}>👏</div>
        <div className={`fire-animation${showFire ? " active" : ""}`}>🔥</div>
      </div>
    </>
  );
};

export default GamifiedBoard;
