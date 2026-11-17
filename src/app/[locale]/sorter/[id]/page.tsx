"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";

import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
  pointerWithin,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import * as uiActions from "actions/sorting/uiAction";
import * as sortingBoardAction from "actions/sorting/sortingBoardAction";
import StateSchema from "reducers/StateSchema";
import ConfirmPopUp from "elements/sorting/ConfirmPopUp";
import ErrorToast from "elements/sorting/ErrorToast";
import DescriptionPopup from "elements/sorting/DescriptionPopup";
import GamifiedInstructionsPopup from "elements/sorting/GamifiedInstructionsPopup";
import CommentPopup from "elements/sorting/CommentPopup";
import { useTranslations } from "next-intl";
import LoadSortData from "elements/sorting/LoadSortData";
import { useParams } from "next/navigation";
import ShowAllCards from "elements/sorting/ShowAllCards";
import OnBoardingPartTwo from "elements/sorting/OnBoardingPartTwo";
import { playSound } from "utils/audio/sounds";
import GamifiedBoard from "elements/sorting/GamifiedBoard";
import GamifiedList from "elements/sorting/GamifiedList";
import OnBoardingPartOne from "elements/sorting/OnBoardingPartOne";

export default function page() {
  const { id } = useParams<{ id: string }>();
  const t = useTranslations("SortingPage");

  // State
  const showOnboarding = useSelector(
    (state: StateSchema) => state.sortingUi.showOnBoarding,
    // (state: StateSchema) => true,
  );
  const showOnboardingPartOne = useSelector(
    (state: StateSchema) => state.sortingUi.showOnBoardingPartOne,
  );
  const showOnboardingPartTwo = useSelector(
    (state: StateSchema) => state.sortingUi.showOnBoardingPartTwo,
    // (state: StateSchema) => true,
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
  const errorNoComment = useSelector(
    (state: StateSchema) => state.sortingUi.errors.noCommentAdded,
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
  const categories = useSelector(
    (state: StateSchema) => state.sortingBoard.categories,
  );

  const categoryOrder = useSelector(
    (state: StateSchema) => state.sortingBoard.categoryOrder,
  );

  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const activeCategory = activeCategoryId ? categories[activeCategoryId] : null;

  const pointerOptions = { activationConstraint: { distance: 6 } };

  const sensors = useSensors(useSensor(PointerSensor, pointerOptions));

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "category") {
      setActiveCategoryId(event.active.id as number);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCategoryId(null);

    const { active, over } = event;
    if (
      active.data.current?.type !== "category" ||
      !over ||
      over.data.current?.type !== "category" ||
      active.id === over.id
    ) {
      return;
    }

    const oldIndex = categoryOrder.indexOf(active.id as number);
    const newIndex = categoryOrder.indexOf(over.id as number);
    if (oldIndex < 0 || newIndex < 0) return;
    const newOrder = arrayMove(categoryOrder, oldIndex, newIndex);
    playSound("hand");
    dispatch(sortingBoardAction.reorderCategories({ orderedIDs: newOrder }));
  };

  const handleDragCancel = () => {
    setActiveCategoryId(null);
  };
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
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        autoScroll={{
          canScroll: (element) => element.id !== "list",
        }}
      >
        <div id="main-panel">
          {(!showOnboarding || showOnboardingPartTwo) && !showAllCards && (
            <GamifiedBoard activeCategory={activeCategory} />
          )}
          {(!showOnboarding || showOnboardingPartTwo) && !showAllCards && (
            <GamifiedList />
          )}
        </div>
      </DndContext>
      <CommentPopup />
      <DescriptionPopup />
      <GamifiedInstructionsPopup />
      <ConfirmPopUp />

      {showOnboardingPartOne && showOnboarding && <OnBoardingPartOne />}
      {showOnboardingPartTwo && showOnboarding && <OnBoardingPartTwo />}

      {showAllCards && <ShowAllCards />}

      {errorNoCategories && (
        <ErrorToast message={t("error no categories created")} />
      )}

      {errorNoTitle && <ErrorToast message={t("error empty title")} />}

      {errorNoComment && <ErrorToast message={t("comment required")} />}

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
