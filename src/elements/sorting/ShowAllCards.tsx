import React from "react";
import { useDispatch, useSelector } from "react-redux";
import * as uiAction from "actions/sorting/uiAction";
import List from "./List";
import Button from "@mui/material/Button";
import StateSchema from "reducers/StateSchema";
import CardContent from "./CardContent";

const ShowAllCards = () => {
  const dispatch = useDispatch();

  const onStartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(uiAction.showAllCards(false));
    dispatch(uiAction.startSort());
  };

  const unsortedCards = useSelector(
    (state: StateSchema) => state.sortingBoard.unsortedCards,
  );

  return (
    <div className="show-all">
      <ul className="all-list">
        {unsortedCards.map((card, index) => (
          <div
            key={card.id}
            className="card-item fade-in"
            style={{ animationDelay: `${index * 80}ms` }}
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
