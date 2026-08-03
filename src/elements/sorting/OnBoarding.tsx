import React from "react";
import { useDispatch, useSelector } from "react-redux";
import StateSchema from "reducers/StateSchema";
import { useState, useEffect } from "react";
import Button from "@mui/material/Button";

import * as uiAction from "actions/sorting/uiAction";

const OnBoarding = () => {
  // Dispatch
  const dispatch = useDispatch();

  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // dispatch(uiAction.toggleOnBoarding(false));
    dispatch(uiAction.toggleOnBoardingPartOne(false));

    // dispatch(uiAction.toggleOnBoardingPartTwo(true));

    dispatch(uiAction.showAllCards(true));

    // dispatch(uiAction.startSort());
  };

  const [nextStep, setNextStep] = useState(-1);
  const title = useSelector((state: StateSchema) => state.sortingUi.studyTitle);
  const description = useSelector(
    (state: StateSchema) => state.sortingUi.studyDescription,
  );

  useEffect(() => {
    const t = setTimeout(() => {
      setNextStep(0);
    }, 1000);

    return () => clearTimeout(t);
  }, []);

  return (
    <div className="on-boarding-screen">
      <div
        className={
          nextStep === 0
            ? "description-explainer"
            : "description-explainer hidden"
        }
      >
        <span>
          <span className="step">
            <h3>{title}</h3>
          </span>
          <div className="step-explainer">
            <p>{description}</p>
          </div>
          <div className="ok-btn">
            <Button
              onClick={() => {
                setNextStep(1);
              }}
            >
              Let's go!
            </Button>
          </div>
        </span>
      </div>

      <div
        className={nextStep === 1 ? "list-explainer" : "list-explainer hidden"}
      >
        <span>
          <div>...</div>
          <span className="step">
            {/* <span className="step-number">1</span> */}
            <h3>Step 1</h3>
          </span>
          <div className="step-explainer">
            <p>
              Take a quick look at the <b>cards.</b>
            </p>
            <p>
              We'd like you to sort them into groups that make sense to you.
            </p>
            <p>There is no right or wrong answer.</p>
            <p>
              <b> Just do what comes naturally.</b>
            </p>
          </div>
          <div className="ok-btn">
            <Button
              onClick={(e) => {
                onClick(e);
                // dispatch(uiAction.showAllCards(true));
                setNextStep(2);
              }}
            >
              Ok
            </Button>
          </div>
        </span>
      </div>
      {/* <div className={nextStep === 2 ? "start-btn" : "start-btn hidden"}>
        <Button
          variant="contained"
          onClick={() => {
            setNextStep(3);
            dispatch(uiAction.showAllCards(false));
          }}
        >
          {"Start Sorting"}
        </Button>
      </div> */}
      {/* <div
        className={
          nextStep === 3 ? "board-explainer " : "board-explainer hidden"
        }
      >
        <span>
          <span className="step">
            <span className="step-number">2</span>
            <h3>Step 2</h3>
          </span>
          <p>
            Drag an item from the left into this area to create your first
            group.
          </p>
          <Button
            onClick={() => {
              setNextStep(4);
            }}
          >
            Ok i'm ready
          </Button>
        </span>
      </div>
      <div
        className={
          nextStep === 4 ? "finish-explainer" : "finish-explainer hidden"
        }
      >
        <span>
          <span className="step">
            <span className="step-number">3</span>
            <h3>Step 3</h3>
          </span>
          <p>When you feel like you are done, press the finish button.</p>
          <Button
            onClick={(e) => {
              setNextStep(0);
              onClick(e);
            }}
          >
            Ok i'm ready
          </Button>
        </span>
      </div> */}
    </div>
  );
};

export default OnBoarding;
