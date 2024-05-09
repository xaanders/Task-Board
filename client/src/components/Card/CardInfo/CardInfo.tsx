import React, { useEffect, useState } from "react";
import { Calendar, CheckSquare, List, Tag, Trash, Type } from "react-feather";
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
}
function CardInfo(props: CardInfoProps) {
  const { onClose, card, categoryId, updateCard } = props;
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
    const tempLabels = cardValues.labels.filter(
      (item) => item.text !== label.text,
    );

    setCardValues(prev => ({
        ...prev,
        labels: tempLabels,
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

  const removeTask = (id: number) => {
    const tasks = [...cardValues.tasks];

    const tempTasks = tasks.filter((item) => item.task_id !== id);
    setCardValues(prev => ({
        ...prev,
        tasks: tempTasks,
      }));
  };

//   const updateTask = (id: number, value: boolean) => {
//     const tasks = [...cardValues.tasks];

//     const index = tasks.findIndex((item) => item.task_id === id);
//     if (index < 0) return;

//     tasks[index].completed = Boolean(value);

//     setCardValues({
//       ...cardValues,
//       tasks,
//     });
//   };

  const calculatePercent = () => {
    if (!cardValues.tasks?.length) return 0;
    const completed = cardValues.tasks?.filter(
      (item) => item.completed,
    )?.length;
    return (completed / cardValues.tasks?.length) * 100;
  };



//   useEffect(() => {
//     if (updateCard) updateCard(categoryId, cardValues.card_id, cardValues);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [cardValues]);

  console.log(cardValues)
  const calculatedPercent = calculatePercent();

  async function saveCard(e: any) {
    e.preventDefault();
    updateCard(categoryId, cardValues.card_id, cardValues);
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
            text={cardValues.title}
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
            defaultValue={cardValues.date}
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
              <Chip key={index} item={item} removeLabel={removeLabel} />
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
          <div className="cardinfo-box-progress-bar">
            <div
              className="cardinfo-box-progress"
              style={{
                width: `${calculatedPercent}%`,
                backgroundColor: calculatedPercent === 100 ? "limegreen" : "",
              }}
            />
          </div>
          <div className="cardinfo-box-task-list">
            {cardValues.tasks?.map((item) => (
              <div key={item.task_id} className="cardinfo-box-task-checkbox">
                <input
                  type="checkbox"
                  defaultChecked={item.completed}
                //   onChange={(event) =>
                    // updateTask(item.task_id, event.target.checked)
                //   }
                />
                <p className={item.completed ? "completed" : ""}>{item.text}</p>
                {/* <Trash onClick={() => removeTask(item.id)} /> */}
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
          <button type="button" onClick={saveCard}>Save</button>
        </div>
      </div>
    </Modal>
  );
}

export default CardInfo;

