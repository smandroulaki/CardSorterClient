import { useState, useEffect, useRef } from "react";
import CardItem from "./CardItem";
import { DropTargetMonitor, useDrop } from "react-dnd";
import { useDispatch, useSelector } from "react-redux";
import StateSchema from "reducers/StateSchema";
import * as sortingBoardAction from "actions/sorting/sortingBoardAction";

const List: React.FC = () => {
  // State
  const unsortedCards = useSelector(
    (state: StateSchema) => state.sortingBoard.unsortedCards,
  );
  const categories = useSelector(
    (state: StateSchema) => state.sortingBoard.categories,
  );
  const sortType = useSelector(
    (state: StateSchema) => state.sortingUi?.sortType ?? "open",
  );

  // Dispatch
  const dispatch = useDispatch();

  const [{ isOver }, drop] = useDrop({
    accept: "card-drag",
    drop: (
      item: { id: number; position: number },
      monitor: DropTargetMonitor,
    ) => {
      // If the card is already in container
      if (item.position === -1) return;

      dispatch(
        sortingBoardAction.removeCardFromCategory({
          cardID: item.id,
          categoryID: item.position,
          preserve: sortType === "closed",
        }),
      );
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const [phase, setPhase] = useState("stacked");

  useEffect(() => {
    setPhase("stacked");

    const t = setTimeout(() => {
      setPhase("spreading");
    }, 300);
    return () => clearTimeout(t);
  }, []);

  const STACK_POSITIONS = [
    { x: "0%", y: "60px", rot: "-5deg" }, // 1
    { x: "10%", y: "80px", rot: "12deg" }, // 2
    { x: "20%", y: "70px", rot: "-3deg" }, // 3
    { x: "15%", y: "90px", rot: "5deg" }, // 4
    { x: "20%", y: "75px", rot: "-13deg" }, // 5
    { x: "30%", y: "75px", rot: "-8deg" }, // 6
    { x: "40%", y: "90px", rot: "8deg" }, // 7
    { x: "50%", y: "95px", rot: "-8deg" }, // 8
    { x: "-15%", y: "65px", rot: "-10deg" }, // 9
    { x: "-5%", y: "75px", rot: "10deg" }, // 10
  ];

  function getSpreadTransform(index: number) {
    const n = index + 1; // 1-indexed
    if (n % 3 === 0) return { rot: "1deg", ty: "32px" };
    if (n % 2 === 0) return { rot: "3deg", ty: "34px" };
    return { rot: "-3deg", ty: "34px" };
  }

  const isSpread = phase === "spreading";

  return (
    //@ts-ignore

    <ul id="list" ref={drop}>
      {unsortedCards.map((card, index) => {
        const stackPos = STACK_POSITIONS[index % 10];
        const spread = getSpreadTransform(index);

        const stackTransform = `translateX(0) translateY(54px) rotate(${stackPos.rot})`;

        const cardWidth = 165;
        const overlapPx = -30;
        const step = cardWidth + overlapPx;

        const spreadOffsetX = index * step;

        const spreadTransform = `translateX(${spreadOffsetX}px) translateY(${spread.ty}) rotate(${spread.rot})`;
        return (
          <div
            className="cards"
            key={card.id}
            style={{
              position: "absolute",

              bottom: 0,
              left: isSpread ? "0" : "50%",
              zIndex: 9999 + index,
              transform: isSpread ? spreadTransform : stackTransform,
              transition: isSpread
                ? `transform 0.5s cubic-bezier(0.34, 1.4, 0.64, 1) ${index * 25}ms,left 0.25s linear `
                : "none",
            }}
          >
            <CardItem
              key={card.id}
              id={card.id}
              title={card.name}
              description={card.description}
              position={-1}
              minimized={false}
            />
          </div>
        );
      })}
    </ul>
  );
};

export default List;
