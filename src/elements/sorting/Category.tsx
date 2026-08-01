import React, {
  ChangeEvent,
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDrop } from "react-dnd";
import { useDispatch, useSelector } from "react-redux";

import CardItem from "./CardItem";
import StateSchema from "reducers/StateSchema";
import * as sortingBoardAction from "actions/sorting/sortingBoardAction";
import { SortingCard } from "../../reducers/sorting/sortingBoardReducer";
import { useTranslations } from "next-intl";
import * as uiActions from "actions/sorting/uiAction";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";

interface CategoryProps {
  id: number;
  title?: string;
  color?: string;
  cards: SortingCard[];
  predefined?: boolean;
  onSortAnimation?: () => void;
}

const Category: React.FC<CategoryProps> = ({
  id,
  title,
  color,
  cards,
  predefined,
  onSortAnimation,
}) => {
  const t = useTranslations("SortingPage");

  const [preliminaryTitle, setPreliminaryTitle] = useState(title || "");
  const [showEditTitle, setShowEditTitle] = useState(false);

  const [bgColor, setBgColor] = useState(color || "#ffffff");
  const [showPicker, setShowPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleColorClick = () => {
    setShowPicker(!showPicker);
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const categories = useSelector(
    (state: StateSchema) => state.sortingBoard.categories,
  );
  const existingTitles = Object.values(categories)
    .filter((cat) => cat.id !== id) // exclude the current one
    .map((cat) => cat.title?.trim().toLowerCase());

  // State
  const isMinimized = useSelector(
    (state: StateSchema) => state.sortingBoard.categories[id].isMinimized,
  );

  // Dispatch
  const dispatch = useDispatch();

  const onTitleClick = (event: MouseEvent<HTMLHeadingElement>) => {
    if (predefined) return;
    event.stopPropagation();
    setShowEditTitle(true);
  };

  const onTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    console.log(event);
    let title = event.target.value || "";
    title = title.replace(/\s\s+/g, " ");
    setPreliminaryTitle(title.length > 0 ? title : "");
  };

  const onTitleFinish = (
    event?: KeyboardEvent<HTMLInputElement | HTMLDivElement>,
  ) => {
    if (event) {
      event.stopPropagation();
      if (event.code !== "Enter") return;
    }

    const normalizedNewTitle = preliminaryTitle.trim().toLowerCase();

    if (existingTitles.includes(normalizedNewTitle)) {
      dispatch(
        uiActions.showCategoriesWithSameNameError({
          categoriesList: [preliminaryTitle],
        }),
      );
      return;
    }

    dispatch(
      sortingBoardAction.renameCategory({
        categoryID: id,
        title: preliminaryTitle,
      }),
    );
    setShowEditTitle(false);
  };

  const onMinimized = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    dispatch(sortingBoardAction.minimizeCategory({ id }));
  };

  const setCategoryColor = () => {
    if (inputRef.current) {
      dispatch(
        sortingBoardAction.addColorCategory({
          categoryID: id,
          color: inputRef.current.value,
        }),
      );
      setBgColor(inputRef.current.value);
    }
  };

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    input.addEventListener("change", setCategoryColor);
    return () => input.removeEventListener("change", setCategoryColor);
  }, []);

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "card-drag",
      drop: (card: { id: number; position: number }) => {
        // Remove card from any other category it may belong
        if (card.position > -1) {
          dispatch(
            sortingBoardAction.removeCardFromCategory({
              cardID: card.id,
              categoryID: card.position,
            }),
          );
        }

        dispatch(
          sortingBoardAction.addCardToCategory({
            categoryID: id,
            cardID: card.id,
          }),
        );
        if (onSortAnimation) {
          onSortAnimation();
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }),
    [id],
  );

  let classString = "category";
  if (isOver) {
    classString += " max-height";
  }
  if (isMinimized) {
    classString += " minimized";
  }

  return (
    // @ts-ignore
    <li className={classString} ref={drop} style={{ backgroundColor: bgColor }}>
      <div className="header">
        {showEditTitle ? (
          <div className="title-input">
            <TextField
              label="Title"
              variant="outlined"
              autoFocus
              value={preliminaryTitle}
              onBlur={() => onTitleFinish()}
              onChange={onTitleChange}
              onKeyUp={onTitleFinish}
            />

            <IconButton
              aria-label="Expand description"
              onClick={() => onTitleFinish}
            >
              <span className="material-symbols-outlined">check</span>
            </IconButton>
          </div>
        ) : (
          <>
            <h3 onClick={onTitleClick} title={title}>
              {title || t("click to rename")}
            </h3>

            <IconButton
              aria-label="Expand description"
              onClick={onMinimized}
              className="minimize"
            >
              <span className="material-symbols-outlined">
                {isMinimized ? "expand_content" : "minimize"}
              </span>
            </IconButton>
          </>
        )}
      </div>
      {isOver && (
        <div className="drop-to-add">
          <span className="material-symbols-outlined">add</span>
          <p>{t("drop to add")}</p>
        </div>
      )}
      <ul>
        {cards.map((card) => (
          <CardItem
            key={card.id}
            id={card.id}
            title={card.name}
            description={card.description}
            minimized={true}
            position={id}
            showDescription={card.descriptionShowing}
          />
        ))}
      </ul>
      <div className="card-count-footer">
        {cards.length} {cards.length === 1 ? "card" : "cards"}
        <button
          onClick={handleColorClick}
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            border: "1px solid #d1d5db",
            background: color
              ? color
              : "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
            cursor: "pointer",
            boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
            outline: "none",
            padding: 0,
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <input
            ref={inputRef}
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="changeColor"
            style={{
              position: "absolute",
              opacity: 0,
              width: 0,
              height: 0,
            }}
          />
        </button>
      </div>
    </li>
  );
};

export default Category;
