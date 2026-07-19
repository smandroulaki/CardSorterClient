import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as uiAction from "actions/sorting/uiAction";
import List from "./List";
import Button from "@mui/material/Button";
import StateSchema from "reducers/StateSchema";
import CardContent from "./CardContent";

const ShowAllCards = () => {
  const dispatch = useDispatch();

  const [close, setClose] = React.useState(false);

  const onStartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setClose(!close);

    const animationDelay = (totalCards - 1) * 45;
    const animationDuration = 300;
    setTimeout(() => {
      dispatch(uiAction.showAllCards(false));
      dispatch(uiAction.startSort());
    }, animationDelay + animationDuration);
  };

  const unsortedCards = useSelector(
    (state: StateSchema) => state.sortingBoard.unsortedCards,
  );

  const totalCards = unsortedCards.length;

  return (
    <div className={close ? "show-all closed" : "show-all"}>
      <ul className={close ? "all-list closed " : "all-list"}>
        {unsortedCards.map((card, index) => (
          <div
            key={card.id}
            className={close ? " closing" : "card-item"}
            style={{
              animationDelay: `${(close ? totalCards - index : index) * 45}ms`,
            }}
          >
            <CardContent
              key={card.id}
              id={card.id}
              title={card.name}
              description={card.description}
              position={-1}
              minimized={false}
            />
          </div>
        ))}
      </ul>
      <div className="start-btn">
        <Button variant="contained" onClick={onStartClick}>
          {"Start Sorting"}
        </Button>
      </div>
    </div>
  );
};
export default ShowAllCards;
