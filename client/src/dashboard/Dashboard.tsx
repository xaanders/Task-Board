import React, { useCallback, useEffect, useState } from "react";
import Board from "../components/Board/Board";
import "./Dashboard.css";
import CustomInput from "../components/CustomInput/CustomInput";
import { ICard, IBoard } from "../types/interfaces";
import { apiCall, dbApiCall, fetchBoardList, updateLocalStorageBoards } from "../helpers/DataAccess";
import { useAppContext } from "../store";
import moment from "moment";

function Dashboard() {
  const { showLoading } = useAppContext();

  const [categories, setCategories] = useState<IBoard[]>([]);

  const fetchData = useCallback(async function () {
    try {
      const categories: IBoard[] = await fetchBoardList();
      if (categories.length > 0)
        setCategories(categories);
    } catch (error) {
      setCategories([]);
    }
  }, [setCategories])

  useEffect(() => {
    showLoading(true);
    fetchData();
    showLoading(false);
  }, [showLoading, fetchData]);

  // const [targetCard, setTargetCard] = useState({
  //   boardId: 0,
  //   cardId: 0,
  // });

  const addBoardHandler = async (name: string) => {
    if (!name)
      return;

    showLoading(true)
    await dbApiCall({ method: 'POST', query: 'insert_board', parameters: { title: name, status: 1 } })
    fetchData()
    showLoading(false)
  };

  const removeBoard = async (boardId: number) => {

    const categoryIndex = categories.findIndex((item: IBoard) => item.category_id === boardId);
    if (categoryIndex < 0) return;

    const tempBoardsList = [...categories];
    const res = await dbApiCall({ method: 'PUT', query: 'update_board', parameters: { status: 0, where: { id: boardId } } });

    if (!res) return;

    tempBoardsList.splice(categoryIndex, 1);
    setCategories(tempBoardsList);
  };

  const addCardHandler = async (categoryId: number, title: string) => {
    const categoryIndex = categories.findIndex((item: IBoard) => item.category_id === categoryId);
    if (categoryIndex < 0) return;

    console.log(moment().utc().format("YYYY-MM-DD HH:MM:ss"))

    showLoading(true);

    await dbApiCall({
      method: "POST", query: 'insert_card', parameters: {
        title,
        date: moment().utc().format("YYYY-MM-DD HH:MM:ss"),
        description: "",
        category_id: categoryId,
        status: 1
      }
    })
    fetchData();
    showLoading(false);
  };

  const removeCard = async (boardId: number, cardId: number) => {
    const boardIndex = categories.findIndex((item: IBoard) => item.category_id === boardId);
    if (boardIndex < 0) return;
    showLoading(true);
    await dbApiCall({
      method: "PUT", query: 'update_card', parameters: {
        status: 0,
        where: {
          id: cardId,
        }
      }
    })
    fetchData();
    showLoading(false);
  };

  const updateCard = async (categoryId: number, cardId: number, card: ICard) => {
    const boardIndex = categories.findIndex((item) => item.category_id === categoryId);
    if (boardIndex < 0) return;
    console.log('card to update', card)

    showLoading(true);

    await dbApiCall({ // update card data
      method: "PUT", query: 'update_card', parameters: {
        title: card.title,
        date: card.date,
        description: card.description,
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
        parameters: {
          table: "label",
          updateArray: oldLabels.map(x => ({ color: x.color, text: x.text, status: x.status === 0 ? 0 : 1, where: { id: x.label_id } }))
        }
      })

    if (newTasks.length > 0)
      await apiCall({ // insert its tasks
        method: "POST",
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
        parameters: {
          table: "task",
          updateArray: oldTasks.map(x => ({ completed: x.completed, text: x.text, status: x.status === 0 ? 0 : 1, where: { id: x.task_id } }))
        }
      })

    fetchData();
    // showLoading(false);
  };

  const createCard = async (categoryId: number, card: ICard) => {
    const boardIndex = categories.findIndex((item) => item.category_id === categoryId);
    if (boardIndex < 0) return;
    console.log('card to update', card)

    showLoading(true);

    const res = await dbApiCall({ // insert card data
      method: "POST", query: 'insert_card', parameters: {
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
        parameters: {
          table: "task",
          insertArray: card.tasks,
          insertStatic: { status: 1, card_id: id },
          returnInsertedId: false
        }
      })

    fetchData();
    showLoading(false);

  }
  // const onDragEnd = (boardId: number, cardId: number) => {
  //   const sourceBoardIndex = boards.findIndex(
  //     (item: IBoard) => item.id === boardId,
  //   );
  //   if (sourceBoardIndex < 0) return;

  //   const sourceCardIndex = boards[sourceBoardIndex]?.cards?.findIndex(
  //     (item) => item.id === cardId,
  //   );
  //   if (sourceCardIndex < 0) return;

  //   const targetBoardIndex = boards.findIndex(
  //     (item: IBoard) => item.id === targetCard.boardId,
  //   );
  //   if (targetBoardIndex < 0) return;

  //   const targetCardIndex = boards[targetBoardIndex]?.cards?.findIndex(
  //     (item) => item.id === targetCard.cardId,
  //   );
  //   if (targetCardIndex < 0) return;

  //   const tempBoardsList = [...boards];
  //   const sourceCard = tempBoardsList[sourceBoardIndex].cards[sourceCardIndex];
  //   tempBoardsList[sourceBoardIndex].cards.splice(sourceCardIndex, 1);
  //   tempBoardsList[targetBoardIndex].cards.splice(
  //     targetCardIndex,
  //     0,
  //     sourceCard,
  //   );
  //   setCategories(tempBoardsList);

  //   setTargetCard({
  //     boardId: 0,
  //     cardId: 0,
  //   });
  // };

  // const onDragEnter = (boardId: number, cardId: number) => {
  //   if (targetCard.cardId === cardId) return;
  //   setTargetCard({
  //     boardId: boardId,
  //     cardId: cardId,
  //   });
  // };

  useEffect(() => {
    updateLocalStorageBoards(categories);
  }, [categories]);
  return (
    <div className="app">
      <div className="app-nav">
        <h1>Task Board</h1>
      </div>
      <div className="app-boards-container">
        <div className="app-boards">
          {categories.map((item) => (
            <Board
              key={item.category_id}
              category={item}
              addCard={addCardHandler}
              removeBoard={removeBoard}
              removeCard={removeCard}
              onDragEnd={() => { }/*onDragEnd*/}
              onDragEnter={() => { }/*onDragEnter*/}
              updateCard={updateCard}
              createCard={createCard}
            />
          ))}
          <div className="app-boards-last">
            <CustomInput
              displayClass="app-boards-add-board"
              editClass="app-boards-add-board-edit"
              placeholder="Enter Board Name"
              text="Add Board"
              buttonText="Add Board"
              onSubmit={addBoardHandler}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
export default Dashboard;