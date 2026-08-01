import React, { useEffect, useRef, useState } from "react";
import { DropTargetMonitor, useDrop } from "react-dnd";

import Category from "./Category";
import { useDispatch, useSelector } from "react-redux";
import StateSchema from "reducers/StateSchema";
import * as sortingBoardAction from "actions/sorting/sortingBoardAction";
import { useTranslations } from "next-intl";
import { sort } from "d3";
import ProgressBar from "./ProgressBar/ProgressBar";

const Board = () => {
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
  };

  const [{ isOver }, dropRef] = useDrop({
    accept: "card-drag",
    drop: (card: { id: number; position: any }, monitor: DropTargetMonitor) => {
      if (
        !monitor.didDrop() &&
        (sortType === "open" || sortType === "hybrid")
      ) {
        if (card.position > -1) {
          // The card belongs to a category

          dispatch(
            sortingBoardAction.removeCardFromCategory({
              cardID: card.id,
              categoryID: card.position,
              preserve: false,
            }),
          );
        }
        dispatch(
          sortingBoardAction.createCategory({
            categoryID: undefined,
            cardID: card.id,
          }),
        );
        handleSortAnimation();
      }

      // Remove empty categories
      if (sortType === "open") {
        for (const i in categories) {
          if (categories[i].cards.length < 1) {
            // Only one category can be empty on each state update
            dispatch(
              sortingBoardAction.removeCategory({
                categoryID: categories[i].id,
              }),
            );
            break;
          }
        }
      }
    },
    collect: (monitor: DropTargetMonitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });
  Object.values(categories).forEach((category) => {
    if (!Array.isArray(category.cards)) {
      console.warn("category.cards is not an array! Value:", category.cards);
    }
  });

  return (
    <>
      <ProgressBar />

      {/* @ts-ignore */}
      <div id="board" ref={dropRef} className="category-board">
        {Object.values(categories).map((category) => (
          <Category
            key={"k" + category.id}
            id={category.id}
            title={category.title}
            color={category.color}
            cards={category.cards}
            predefined={category.predefined}
            onSortAnimation={() => {
              handleSortAnimation();
            }}
          />
        ))}
        {isOver && (sortType === "open" || sortType === "hybrid") && (
          <div className="category drop-to-create">
            <span className="material-symbols-outlined">add</span>
            <p>{t("drop to create category")}</p>
          </div>
        )}
        <div className={`clap-animation${showClap ? " active" : ""}`}>👏</div>
        <div className={`fire-animation${showFire ? " active" : ""}`}>🔥</div>
      </div>
    </>
  );
};

export default Board;
