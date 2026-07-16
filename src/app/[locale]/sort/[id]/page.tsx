"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import SplitPane from "react-split-pane";

import List from "elements/sorting/List";
import * as uiActions from "actions/sorting/uiAction";
import StateSchema from "reducers/StateSchema";
import ConfirmPopUp from "elements/sorting/ConfirmPopUp";
import ErrorToast from "elements/sorting/ErrorToast";
import Board from "elements/sorting/Board";
import OnBoarding from "elements/sorting/OnBoarding";
import DescriptionPopup from "elements/sorting/DescriptionPopup";
import InstructionsPopup from "elements/sorting/InstructionsPopup";
import CommentPopup from "elements/sorting/CommentPopup";
import { useTranslations } from "next-intl";
import LoadSortData from "elements/sorting/LoadSortData";
import { useParams } from "next/navigation";
import ShowAllCards from "elements/sorting/ShowAllCards";

export default function page() {
  const { id } = useParams<{ id: string }>();
  const t = useTranslations("SortingPage");

  // State
  const showOnboarding = useSelector(
    (state: StateSchema) => state.sortingUi.showOnBoarding,
  );
  const showAllCards = useSelector(
    (state: StateSchema) => state.sortingUi.showAllCards,
  );
  const errorNoCategories = useSelector(
    (state: StateSchema) => state.sortingUi.errors.noCategoriesCreated,
  );
  const errorNoTitle = useSelector(
    (state: StateSchema) => state.sortingUi.errors.categoryMissingTitle,
  );
  const errorSameCategories = useSelector(
    (state: StateSchema) => state.sortingUi.errors?.categoriesHaveTheSameName,
  );
  const sameCategoryNames = useSelector(
    (state: StateSchema) => state.sortingUi.errors?.sameCategoryList,
  );
  const commentSaved = useSelector(
    (state: StateSchema) => state.sortingUi.commentSaved,
  );

  // Dispatch
  const dispatch = useDispatch<any>();

  useEffect(() => {
    if (commentSaved) {
      const timer = setTimeout(() => {
        dispatch(uiActions.setCommentSaved(false));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [commentSaved]);

  return (
    <>
      <LoadSortData id={id} />
      <DndProvider backend={HTML5Backend}>
        <div id="main-panel">
          {/*@ts-ignore*/}
          {/* <SplitPane
            className="split-pane"
            split="horizontal"
            minSize={200}
            maxSize={-300}
            defaultSize={'18rem'}
          > */}
          {!showOnboarding && !showAllCards && <Board />}
          {!showOnboarding && !showAllCards && <List />}

          {/* </SplitPane> */}
        </div>
      </DndProvider>

      <CommentPopup />
      <DescriptionPopup />
      <InstructionsPopup />
      <ConfirmPopUp />

      {showOnboarding && <OnBoarding />}
      {showAllCards && <ShowAllCards />}

      {errorNoCategories && (
        <ErrorToast message={t("error no categories created")} />
      )}

      {errorNoTitle && <ErrorToast message={t("error empty title")} />}

      {errorSameCategories && (
        <ErrorToast
          message={
            t("error duplicate titles") + (sameCategoryNames || []).join(", ")
          }
        />
      )}

      {commentSaved && <ErrorToast message={t("comment saved")} />}
    </>
  );
}
