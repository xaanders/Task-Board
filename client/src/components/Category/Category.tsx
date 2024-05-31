import React, { useState } from "react";
import { MoreHorizontal } from "react-feather";

import Card from "../Card/Card";
import Dropdown from "../Dropdown/Dropdown";
import "./Category.css";
import { ICategory, ICard } from "../../types/interfaces";
import CardInfo from "../Card/CardInfo/CardInfo";
interface CategoryProps {
  category: ICategory;
  addCard: (categoryId: number, title: string) => void;
  removeCategory: (categoryId: number) => void;
  removeCard: (categoryId: number, cardId: number) => void;
  onDragEnd: (categoryId: number, cardId: number, card: ICard) => void;
  onDragEnter: (e: any, categoryId: number) => void;
  updateCard: (categoryId: number, cardId: number, card: ICard) => void;
  createCard: (categoryId: number, card: ICard) => void;
}

function Category({ category,
  removeCategory,
  removeCard,
  onDragEnd,
  onDragEnter,
  updateCard,
  createCard }: CategoryProps) {

  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  async function onClose(id: number) {
    setShowDropdown(prev => !prev);
    removeCategory(id);
  }

  return (
    <div className="board" onDragEnter={(e) => onDragEnter(e, category.category_id)}>
      <div className="board-inner" key={category?.category_id}>
        <div className="board-header">
          <p className="board-header-title">
            {category?.title}
            <span>{`${category?.cards?.length} cards`|| "0 cards"}</span>
          </p>
          <div
            className="board-header-title-more"
          >
            <MoreHorizontal onClick={() => setShowDropdown(prev => !prev)} />
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
              onDragEnd={onDragEnd}
              updateCard={updateCard}
              createCard={createCard}
            />
          ))}
          {/* <CustomInput
            text="+ Add Card"
            placeholder="Enter Card Title"
            displayClass="board-add-card"
            editClass="board-add-card-edit"
            onSubmit={(value: string) => addCard(category?.category_id, value)}
          /> */}
          <button onClick={() => setShowAddCardModal(true)} className="add-btn">+ Add Card</button>
          {showAddCardModal && (
            <CardInfo
              onClose={() => setShowAddCardModal(false)}
              card={{
                card_id: 0,
                title: "",
                labels: [],
                date: "",
                tasks: [],
                description: ""
              }}
              categoryId={category.category_id}
              updateCard={updateCard}
              createCard={createCard}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Category;
