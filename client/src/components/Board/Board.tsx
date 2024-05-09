import React, { useState } from "react";
import { MoreHorizontal } from "react-feather";

import Card from "../Card/Card";
import Dropdown from "../Dropdown/Dropdown";
import CustomInput from "../CustomInput/CustomInput";

import "./Board.css";
import { IBoard, ICard } from "../../types/interfaces";
interface BoardProps {
  category: IBoard;
  addCard: (categoryId: number, title: string) => void;
  removeBoard: (categoryId: number) => void;
  removeCard: (categoryId: number, cardId: number) => void;
  onDragEnd: (categoryId: number, cardId: number) => void;
  onDragEnter: (categoryId: number, cardId: number) => void;
  updateCard: (categoryId: number, cardId: number, card: ICard) => void;
}

function Board(props: BoardProps) {
  const {
    category,
    addCard,
    removeBoard,
    removeCard,
    onDragEnd,
    onDragEnter,
    updateCard,
  } = props;
  const [showDropdown, setShowDropdown] = useState(false);
  console.log(showDropdown)

  async function onClose(id: number) {
    setShowDropdown(prev => !prev);
    removeBoard(id);
  }

  return (
    <div className="board">
      <div className="board-inner" key={category?.category_id}>
        <div className="board-header">
          <p className="board-header-title">
            {category?.title}
            <span>{category?.cards?.length || 0}</span>
          </p>
          <div
            className="board-header-title-more"
          >
            <MoreHorizontal onClick={() => setShowDropdown(prev => !prev)}/>
            {showDropdown && (
              <Dropdown
                class="board-dropdown"
              >
                <p onClick={() => onClose(category.category_id)}>Delete Board</p>
              </Dropdown>
            )}
          </div>
        </div>
        <div className="board-cards">
          {category?.cards?.map((item) => (
            <Card
              key={item.card_id}
              card={item}
              categoryId={category.category_id}
              removeCard={removeCard}
              onDragEnter={onDragEnter}
              onDragEnd={onDragEnd}
              updateCard={updateCard}
            />
          ))}
          <CustomInput
            text="+ Add Card"
            placeholder="Enter Card Title"
            displayClass="board-add-card"
            editClass="board-add-card-edit"
            onSubmit={(value: string) => addCard(category?.category_id, value)}
          />
        </div>
      </div>
    </div>
  );
}

export default Board;
