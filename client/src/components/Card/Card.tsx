import React, { useState } from "react";
import { AlignLeft, CheckSquare, Clock, MoreHorizontal } from "react-feather";
import { formatDate } from "../../helpers/helpers";
import { ICard } from "../../types/interfaces";
import Chip from "../Common/Chip";
import Dropdown from "../Dropdown/Dropdown";

import "./Card.css";
import CardInfo from "./CardInfo/CardInfo";
interface CardProps {
  card: ICard;
  categoryId: number;
  removeCard: (categoryId: number, cardId: number) => void;
  onDragEnd: (categoryId: number, cardId: number) => void;
  onDragEnter: (categoryId: number, cardId: number) => void;
  updateCard: (categoryId: number, cardId: number, card: ICard) => void;
}
function Card(props: CardProps) {
  const { card, categoryId, removeCard, onDragEnd, onDragEnter, updateCard } =
    props;
  const { card_id, title, description, date, tasks, labels } = card;
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {showModal && (
          <CardInfo
            onClose={() => setShowModal(false)}
            card={card}
            categoryId={categoryId}
            updateCard={updateCard}
            />
      )}
      <div
        className="card"
        key={card.card_id}
        draggable
        onDragEnd={() => onDragEnd(categoryId, card_id)}
        onDragEnter={() => onDragEnter(categoryId, card_id)}
        onClick={() => setShowModal(true)}
      >
        <div className="card-top">
          <div className="card-top-labels">
            {labels?.map((item, index) => (
              <Chip key={index} item={item} />
            ))}
          </div>
          <div
            className="card-top-more"
            onClick={(event) => {
              event.stopPropagation();
              setShowDropdown(true);
            }}
          >
            <MoreHorizontal />
            {showDropdown && (
              <Dropdown
                class="board-dropdown"
                onClose={() => setShowDropdown(false)}
              >
                <p onClick={() => removeCard(categoryId, card_id)}>Delete Card</p>
              </Dropdown>
            )}
          </div>
        </div>
        <div className="card-title">{title}</div>
        <div>
          <p title={description}>
            <AlignLeft />
          </p>
        </div>
        <div className="card-footer">
          {date && (
            <p className="card-footer-item">
              <Clock className="card-footer-icon" />
              {formatDate(date)}
            </p>
          )}
          {tasks && tasks?.length > 0 && (
            <p className="card-footer-item">
              <CheckSquare className="card-footer-icon" />
              {tasks?.filter((item) => item.completed)?.length}/{tasks?.length}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default Card;
