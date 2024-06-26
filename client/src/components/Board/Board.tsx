import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

import Category from "../Category/Category";
import "./Board.css";
import CustomInput from "../CustomInput/CustomInput";
import { ICard, ICategory } from "../../types/interfaces";
import { apiCall, dbApiCall } from "../../helpers/DataAccess";
import { useAppContext } from "../../store";
import moment from "moment";
import { useAuth } from "../../store/auth";
interface BoardProps {
  activeBoardId: number | null;
  activeBoardName: string | null;
  isProject: boolean;
}

async function fetchCategories(activeBoardId: number | null, accessToken: string | null, setCategories: Dispatch<SetStateAction<ICategory[]>>) {
  if (!activeBoardId)
    return;

  let res = await apiCall({ method: "GET", accessToken: accessToken, parameters: { apiGate: 'data', board_id: activeBoardId } });

  setCategories(res && res.length ? res : [])
}

function Board({ activeBoardId, activeBoardName, isProject }: BoardProps) {

  const { showLoading } = useAppContext();
  const { accessToken } = useAuth();

  const [categories, setCategories] = useState<ICategory[]>([]);

  useEffect(() => {
    showLoading(true);
    fetchCategories(activeBoardId, accessToken, setCategories);
    showLoading(false);
  }, [accessToken, activeBoardId, showLoading]);

  const [targetCard, setTargetCard] = useState({
    categoryId: 0,
  });

  const addBoardHandler = async (name: string) => {
    if (!name)
      return;

    showLoading(true)
    await dbApiCall({ method: 'POST', query: 'insert_category', accessToken: accessToken, parameters: { title: name, status: 1, board_id: activeBoardId } })
    fetchCategories(activeBoardId, accessToken, setCategories);
    showLoading(false)
  };

  const removeCategory = async (boardId: number) => {

    const categoryIndex = categories.findIndex((item: ICategory) => item.category_id === boardId);
    if (categoryIndex < 0) return;

    const tempBoardsList = [...categories];
    const res = await dbApiCall({ method: 'PUT', query: 'update_category', accessToken: accessToken, parameters: { status: 0, where: { id: boardId } } });

    if (!res) return;

    tempBoardsList.splice(categoryIndex, 1);
    setCategories(tempBoardsList);
  };

  const addCardHandler = async (categoryId: number, title: string) => {
    const categoryIndex = categories.findIndex((item: ICategory) => item.category_id === categoryId);
    if (categoryIndex < 0) return;

    console.log(moment().utc().format("YYYY-MM-DD HH:MM:ss"))

    showLoading(true);

    await dbApiCall({
      method: "POST", query: 'insert_card', accessToken: accessToken, parameters: {
        title,
        date: moment().utc().format("YYYY-MM-DD HH:MM:ss"),
        description: "",
        category_id: categoryId,
        status: 1
      }
    })
    fetchCategories(activeBoardId, accessToken, setCategories);
    showLoading(false);
  };

  const removeCard = async (boardId: number, cardId: number) => {
    const boardIndex = categories.findIndex((item: ICategory) => item.category_id === boardId);
    if (boardIndex < 0) return;
    showLoading(true);
    await dbApiCall({
      method: "PUT", query: 'update_card', accessToken: accessToken, parameters: {
        status: 0,
        where: {
          id: cardId,
        }
      }
    })
    fetchCategories(activeBoardId, accessToken, setCategories);
    showLoading(false);
  };

  const updateCard = async (categoryId: number, cardId: number, card: ICard) => {
    const boardIndex = categories.findIndex((item) => item.category_id === categoryId);
    if (boardIndex < 0) return;
    console.log('card to update', card)

    showLoading(true);

    await dbApiCall({ // update card data
      method: "PUT", query: 'update_card', accessToken: accessToken, parameters: {
        title: card.title,
        date: card.date,
        description: card.description,
        category_id: categoryId,
        where: {
          id: cardId
        }
      }
    })

    const newLabels = card.labels.filter(x => !x.label_id && !x.card_id);
    const newTasks = card.tasks.filter(x => !x.task_id && !x.card_id);

    const oldLabels = card.labels.filter(x => x.label_id && x.card_id);
    const oldTasks = card.tasks.filter(x => x.task_id && x.card_id);

    if (newLabels.length > 0)
      await apiCall({ // insert new labels
        method: "POST",
        accessToken: accessToken,
        parameters: {
          table: "label",
          insertArray: newLabels,
          insertStatic: { status: 1, card_id: cardId },
          returnInsertedId: false
        }
      })


    if (oldLabels.length > 0)
      await apiCall({ // update old tasks
        method: "PUT",
        accessToken: accessToken,
        parameters: {
          table: "label",
          updateArray: oldLabels.map(x => ({ color: x.color, text: x.text, status: x.status === 0 ? 0 : 1, where: { id: x.label_id } }))
        }
      })

    if (newTasks.length > 0)
      await apiCall({ // insert its tasks
        method: "POST",
        accessToken: accessToken,
        parameters: {
          table: "task",
          insertArray: newTasks,
          insertStatic: { status: 1, card_id: cardId },
          returnInsertedId: false
        }
      })

    if (oldTasks.length > 0)
      await apiCall({ // update old tasks
        method: "PUT",
        accessToken: accessToken,
        parameters: {
          table: "task",
          updateArray: oldTasks.map(x => ({ completed: x.completed, text: x.text, status: x.status === 0 ? 0 : 1, where: { id: x.task_id } }))
        }
      })

    fetchCategories(activeBoardId, accessToken, setCategories);
    showLoading(false);
  };

  const createCard = async (categoryId: number, card: ICard) => {
    const boardIndex = categories.findIndex((item) => item.category_id === categoryId);
    if (boardIndex < 0) return;
    console.log('card to update', card)

    showLoading(true);

    const res = await dbApiCall({ // insert card data
      method: "POST", query: 'insert_card', accessToken: accessToken, parameters: {
        title: card.title,
        date: card.date || null,
        description: card.description || null,
        category_id: categoryId,
        status: 1,
      }
    })

    const id = res[0].lastInsertId;

    if (card.labels.length > 0 && id)
      await apiCall({ // insert its labels
        method: "POST",
        accessToken: accessToken,
        parameters: {
          table: "label",
          insertArray: card.labels,
          insertStatic: { status: 1, card_id: id },
          returnInsertedId: false
        }
      })

    if (card.tasks.length > 0 && id)
      await apiCall({ // insert its tasks
        method: "POST",
        accessToken: accessToken,
        parameters: {
          table: "task",
          insertArray: card.tasks,
          insertStatic: { status: 1, card_id: id },
          returnInsertedId: false
        }
      })

    fetchCategories(activeBoardId, accessToken, setCategories);
    showLoading(false);

  }
  const onDragEnd = async (categoryId: number, cardId: number, card: ICard) => {
    // const sourceBoardIndex = categories.findIndex(
    //   (item: ICategory) => item.category_id === categoryId,
    // );
    // if (sourceBoardIndex < 0) return;

    // const sourceCardIndex = categories[sourceBoardIndex]?.cards?.findIndex(
    //   (item) => item.card_id === cardId,
    // );
    // if (sourceCardIndex < 0) return;

    // const targetBoardIndex = categories.findIndex(
    //   (item: ICategory) => item.category_id === targetCard.categoryId,
    // );
    // if (targetBoardIndex < 0) return;

    // const targetCardIndex = categories[targetBoardIndex]?.cards?.findIndex(
    //   (item) => item.card_id === targetCard.cardId,
    // );
    // if (targetCardIndex < 0) return;
    console.log('targetCard', targetCard)
    console.log('current Card', card)
    if (!categoryId || !cardId)
      return;

    card.category_id = targetCard.categoryId;

    await updateCard(targetCard.categoryId, cardId, card);
    await fetchCategories(activeBoardId, accessToken, setCategories);

    setTargetCard({
      categoryId: 0,
    });
  };

  const onDragEnter = (e: any, categoryId: number) => {
    // if (targetCard.cardId === cardId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";

    setTargetCard({
      categoryId: categoryId,
    });
  };
  return (
    <main className="app-boards-container">
      <header className="app-nav">
        <div className="main-title">
          <h1 style={{ fontSize: '1.5rem' }}>{activeBoardName}</h1>
        </div>
      </header>
      <div className="app-content">
        <ul className="app-boards" onDragOver={(e) => e.preventDefault()}>
          {categories.map((item) => (
            <Category
              key={item.category_id}
              category={item}
              addCard={addCardHandler}
              removeCategory={removeCategory}
              removeCard={removeCard}
              onDragEnd={onDragEnd}
              onDragEnter={onDragEnter}
              updateCard={updateCard}
              createCard={createCard}
            />
          ))}
          <div className="app-boards-last">
            <CustomInput
              displayClass="app-boards-add-board"
              editClass="app-boards-add-board-edit"
              placeholder="Enter Board Name"
              text="Add Category"
              buttonText="Add Category"
              onSubmit={addBoardHandler}
            />
          </div>
        </ul>
      </div>
    </main>
  );
}
export default Board;