import React, { useEffect, useState } from "react";
import Board from "../components/Board/Board";
import "./Dashboard.css";
import CustomInput from "../components/CustomInput/CustomInput";
import { ICard, IBoard } from "../interfaces/kanban";
import { dbApiCall, fetchBoardList, updateLocalStorageBoards } from "../helpers/DataAccess";

function Dashboard() {
  const [boards, setBoards] = useState<IBoard[]>([]);
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const boards: IBoard[] = await fetchBoardList();
      setBoards(boards);
    } catch (error) {
      setBoards([]);
    }
  }
  // const [targetCard, setTargetCard] = useState({
  //   boardId: 0,
  //   cardId: 0,
  // });

  const addBoardHandler = async (name: string) => {
    if(!name)
      return;

    await dbApiCall({method: 'POST', query:'insert_board', parameters: {title: name}})
    fetchData()
  };

  const removeBoard = async (boardId: number) => {
      console.log(boardId)
      const boardIndex = boards.findIndex((item: IBoard) => item.category_id === boardId);
      if (boardIndex < 0) return;
  
      const tempBoardsList = [...boards];
      const res = await dbApiCall({method: 'PUT', query:'update_board', parameters: {status: 0, where: {id: boardId}}});
  
      if (!res) return;
  
      tempBoardsList.splice(boardIndex, 1);
      setBoards(tempBoardsList);
  };

  // const addCardHandler = (boardId: number, title: string) => {
  //   const boardIndex = boards.findIndex((item: IBoard) => item.id === boardId);
  //   if (boardIndex < 0) return;

  //   const tempBoardsList = [...boards];
  //   tempBoardsList[boardIndex].cards.push({
  //     id: Date.now() + Math.random() * 2,
  //     title,
  //     labels: [],
  //     date: "",
  //     tasks: [],
  //     description: "",
  //   });
  //   setBoards(tempBoardsList);
  // };

  // const removeCard = (boardId: number, cardId: number) => {
  //   const boardIndex = boards.findIndex((item: IBoard) => item.id === boardId);
  //   if (boardIndex < 0) return;

  //   const tempBoardsList = [...boards];
  //   const cards = tempBoardsList[boardIndex].cards;

  //   const cardIndex = cards.findIndex((item) => item.id === cardId);
  //   if (cardIndex < 0) return;

  //   cards.splice(cardIndex, 1);
  //   setBoards(tempBoardsList);
  // };

  // const updateCard = (boardId: number, cardId: number, card: ICard) => {
  //   const boardIndex = boards.findIndex((item) => item.id === boardId);
  //   if (boardIndex < 0) return;

  //   const tempBoardsList = [...boards];
  //   const cards = tempBoardsList[boardIndex].cards;

  //   const cardIndex = cards.findIndex((item) => item.id === cardId);
  //   if (cardIndex < 0) return;

  //   tempBoardsList[boardIndex].cards[cardIndex] = card;

  //   setBoards(tempBoardsList);
  // };

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
  //   setBoards(tempBoardsList);

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
    updateLocalStorageBoards(boards);
  }, [boards]);
  return (
    <div className="app">
      <div className="app-nav">
        <h1>Task Board</h1>
      </div>
      <div className="app-boards-container">
        <div className="app-boards">
          {boards.map((item) => (
            <Board
              key={item.category_id}
              board={item}
              addCard={() => {} /*addCardHandler*/}
              removeBoard={removeBoard}
              removeCard={() => {}/*removeCard*/}
              onDragEnd={() => {}/*onDragEnd*/}
              onDragEnter={() => {}/*onDragEnter*/}
              updateCard={() => {}/*updateCard*/}
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

