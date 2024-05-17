import React, { useState } from 'react'
import Modal from '../../modal/Modal';
import { List, Type } from 'react-feather';
import CustomInput from '../../CustomInput/CustomInput';
import { dbApiCall } from '../../../helpers/DataAccess';
import moment from 'moment';
import { IBoard } from '../../../types/interfaces';

interface Props {
    onClose: (refetch?: boolean) => void;
    editBoard: { board_name: string, board_id?: number };
    activeBoardId: number | null;
    activeProjectId: number | null;
}

function BoardInfo({ onClose, editBoard, activeBoardId, activeProjectId }: Props) {

    const [newBoard, setNewBoard] = useState(editBoard);

    const updateData = (v: string, key: string) => {
        setNewBoard(prev => ({ ...prev, [key]: v }))
    }
    console.log(newBoard)

    const saveNewBoard = async (e: any) => {
        e.preventDefault();

        await dbApiCall({
            method: "POST", query: 'insert_board', parameters: {
                name: newBoard.board_name,
                project_id: activeProjectId,
                status: 1
            }
        })

        onClose(true);
    }

    const updateBoard = async (e: any) => {
        e.preventDefault();
        const id = newBoard?.board_id;
        if (!id)
            return;

        await dbApiCall({
            method: "POST", query: 'update_board', parameters: {
                name: newBoard.board_name,
                where: { board_id: id }
            }
        })


        onClose(true);
    }

    return (
        <Modal onClose={onClose}>
            <div className="cardinfo">
                <div className="cardinfo-box">
                    <div className="cardinfo-box-title">
                        <Type />
                        <p>Board Name</p>
                    </div>
                    <CustomInput
                        defaultValue={newBoard.board_name}
                        text={newBoard.board_name || "Add a Title"}
                        placeholder="Enter Title"
                        onSubmit={(v) => updateData(v, 'board_name')}
                    />
                </div>
                <div className="actions">
                    <button type="button" disabled={!newBoard.board_name} className="save-btn" onClick={newBoard.board_id ? updateBoard : saveNewBoard}>Save</button>
                </div>
            </div>
        </Modal >
    )
}

export default BoardInfo