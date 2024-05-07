import React, { useState } from "react";
import { MoreHorizontal } from "react-feather";

import Card from "../Card/Card";
import Dropdown from "../Dropdown/Dropdown";
import CustomInput from "../CustomInput/CustomInput";

import "./Board.css";
import { IBoard, ICard } from "../../interfaces/kanban";

interface BoardProps {
  board: IBoard;
  addCard: (boardId: number, title: string) => void;
  removeBoard: (boardId: number) => void;
  removeCard: (boardId: number, cardId: number) => void;
  onDragEnd: (boardId: number, cardId: number) => void;
  onDragEnter: (boardId: number, cardId: number) => void;
  updateCard: (boardId: number, cardId: number, card: ICard) => void;
}

function Board(props: BoardProps) {
  const {
    board,
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
      <div className="board-inner" key={board?.category_id}>
        <div className="board-header">
          <p className="board-header-title">
            {board?.title}
            <span>{board?.cards?.length || 0}</span>
          </p>
          <div
            className="board-header-title-more"
          >
            <MoreHorizontal onClick={() => setShowDropdown(prev => !prev)}/>
            {showDropdown && (
              <Dropdown
                class="board-dropdown"
              >
                <p onClick={() => onClose(board.category_id)}>Delete Board</p>
              </Dropdown>
            )}
          </div>
        </div>
        <div className="board-cards">
          {board?.cards?.map((item) => (
            <Card
              key={item.card_id}
              card={item}
              boardId={board.category_id}
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
            onSubmit={(value: string) => addCard(board?.category_id, value)}
          />
        </div>
      </div>
    </div>
  );
}

export default Board;
