import React, { useEffect, useState } from "react";
import { Calendar, CheckSquare, List, Tag, Trash, Type, X } from "react-feather";
import { colorsList } from "../../../helpers/helpers";
import Modal from "../../modal/Modal";
import CustomInput from "../../CustomInput/CustomInput";

import "./CardInfo.css";
import { ICard, ILabel, ITask } from "../../../types/interfaces";
import Chip from "../../Common/Chip";
import moment from "moment";

interface CardInfoProps {
  onClose: () => void;
  card: ICard;
  categoryId: number;
  updateCard: (categoryId: number, cardId: number, card: ICard) => void;
  createCard: (categoryId: number, card: ICard) => void;
}

function CardInfo({ onClose, card, categoryId, updateCard, createCard }: CardInfoProps) {
  const [selectedColor, setSelectedColor] = useState("");
  const [cardValues, setCardValues] = useState<ICard>({
    ...card,
  });

  const updateState = (value: string, key: string) => {
    setCardValues(prev => ({ ...prev, [key]: value }));
  };

  const addLabel = (label: ILabel) => {
    const index = cardValues.labels.findIndex(
      (item) => item.text === label.text,
    );
    if (index > -1) return; //if label text already exist then return

    setSelectedColor("");
    setCardValues(prev => ({
      ...prev,
      labels: [...cardValues.labels, label],
    }));
  };

  const removeLabel = (label: ILabel) => {
    console.log(label)
    if (!label.label_id) {
      setCardValues(prev => ({
        ...prev,
        labels: prev.labels.filter(l => l.text !== label.text),
      }));
      return;
    }

    const labels = cardValues.labels
      .map(x => {
        if (label.label_id && x.label_id === label.label_id)
          return { ...x, status: 0 }
        else
          return x
      })

    setCardValues(prev => ({
      ...prev,
      labels,
    }));
  };

  const addTask = (value: string) => {
    const task: ITask = {
      completed: false,
      text: value,
    };
    setCardValues(prev => ({
      ...prev,
      tasks: [...cardValues.tasks, task],
    }));
  };

  const removeTask = (id?: number) => {
    if (!id)
      return;

    const tasks = cardValues.tasks.map(x => {
      if (x.task_id === id)
        return { ...x, status: 0 }
      else
        return x
    })

    setCardValues(prev => ({
      ...prev,
      tasks,
    }));

  };

  const updateTask = (value: boolean, id?: number) => {
    const tasks = [...cardValues.tasks];

    const index = tasks.findIndex((item) => item.task_id === id);
    if (index < 0) return;

    tasks[index].completed = Boolean(value);

    setCardValues(prev => ({
      ...prev,
      tasks,
    }));
  };

  const calculatePercent = () => {
    if (!cardValues.tasks?.length) return 0;
    const completed = cardValues.tasks?.filter(
      (item) => item.completed,
    )?.length;
    return (completed / cardValues.tasks?.length) * 100;
  };


  const calculatedPercent = calculatePercent();

  async function saveCard(e: any) {
    e.preventDefault();
    const cardId = cardValues.card_id || null;

    if (!cardValues.title)
      return;

    if (cardId)
      updateCard(categoryId, cardId, cardValues);
    else
      createCard(categoryId, cardValues);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <div className="cardinfo">
        <div className="cardinfo-box">
          <div className="cardinfo-box-title">
            <Type />
            <p>Title</p>
          </div>
          <CustomInput
            defaultValue={cardValues.title}
            text={cardValues.title || "Add a Title"}
            placeholder="Enter Title"
            onSubmit={(v) => updateState(v, 'title')}
          />
        </div>

        <div className="cardinfo-box">
          <div className="cardinfo-box-title">
            <List />
            <p>Description</p>
          </div>
          <CustomInput
            textArea
            defaultValue={cardValues.description}
            text={cardValues.description || "Add a Description"}
            placeholder="Enter description"
            onSubmit={(v) => updateState(v, 'description')}
          />
        </div>

        <div className="cardinfo-box">
          <div className="cardinfo-box-title">
            <Calendar />
            <p>Date</p>
          </div>
          <input
            type="date"
            defaultValue={moment(cardValues.date).format("YYYY-MM-DD")}
            min={new Date().toISOString().substr(0, 10)}
            onChange={(e) => e.target.value && updateState(e.target.value, 'date')}
          />
        </div>

        <div className="cardinfo-box">
          <div className="cardinfo-box-title">
            <Tag />
            <p>Labels</p>
          </div>
          <div className="cardinfo-box-labels">
            {cardValues.labels?.map((item, index) => (
              <Chip
                key={index}
                item={item}
                classes={item.status === 0 ? "disabled" : ""}
                removeLabel={() => removeLabel(item)}
              />
            ))}
          </div>
          <ul>
            {colorsList.map((item, index) => (
              <li
                key={index}
                style={{ backgroundColor: item }}
                className={selectedColor === item ? "li-active" : ""}
                onClick={() => setSelectedColor(item)}
              />
            ))}
          </ul>
          <CustomInput
            text="Add Label"
            placeholder="Enter label text"
            onSubmit={(value: string) =>
              addLabel({ color: selectedColor, text: value })
            }
          />
        </div>

        <div className="cardinfo-box">
          <div className="cardinfo-box-title">
            <CheckSquare />
            <p>Tasks</p>
          </div>
          <div>
            <p>Progress bar:</p>
            <div className="cardinfo-box-progress-bar">
              <div
                className="cardinfo-box-progress"
                style={{
                  width: `${calculatedPercent}%`,
                  backgroundColor: calculatedPercent === 100 ? "limegreen" : "",
                }}
              />
            </div>
          </div>
          <div className="cardinfo-box-task-list">
            {cardValues.tasks?.map((item) => (
              <div key={item.task_id} className="cardinfo-box-task-checkbox">
                <input
                  type="checkbox"
                  disabled={item.status === 0}
                  className={item.status === 0 ? "disabled" : ""}
                  defaultChecked={item.completed}
                  onChange={(event) =>
                    updateTask(event.target.checked, item.task_id)
                  }
                />
                <p className={item.completed ? "completed" : ""}>{item.text}</p>
                <Trash onClick={() => removeTask(item.task_id)} className={item.status === 0 ? "disabled" : ""} />
              </div>
            ))}
          </div>
          <CustomInput
            text={"Add a Task"}
            placeholder="Enter task"
            onSubmit={addTask}
          />
        </div>

        <div className="actions">
          <button type="button" disabled={!cardValues.title} className="save-btn" onClick={saveCard}>Save</button>
        </div>
      </div>
    </Modal>
  );
}

export default CardInfo;

