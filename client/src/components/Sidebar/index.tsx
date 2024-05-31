import React, { useState } from 'react'
import './Sidebar.css'
import BoardInfo from './BoardInfo';
import { IBoard, IProject } from '../../types/interfaces';
import { Edit } from 'react-feather';
import ProjectInfo from './ProjectInfo';

interface SidebarProps {
    activeBoardId: number | null;
    activeProjectId: number | null;
    boards: IBoard[];
    projects: IProject[];
    fetchBoards: () => void;
    fetchProjects: () => void;
}

const defaultBoard = {
    board_name: '',
}
const defaultProject = {
    project_name: '',
}

function Sidebar({ activeProjectId, activeBoardId, boards, projects, fetchBoards, fetchProjects }: SidebarProps) {

    const [showBoard, setShowBoard] = useState(false);
    const [showProject, setShowProject] = useState(false);

    const [editBoard, setEditBoard] = useState(defaultBoard);
    const [editProject, setEditProject] = useState(defaultProject);

    const closeBoardModal = (refetch?: boolean) => {
        setShowBoard(false);
        setEditBoard(defaultBoard);
        if (refetch)
            fetchBoards()
    }

    const closeProjectModal = (refetch?: boolean) => {
        setShowProject(false);
        setEditProject(defaultProject);
        if (refetch)
            fetchProjects()
    }
    const changeBoard = (boardId: number) => {
        if (!boardId)
            return;

        window.location.replace(`/projects/boards?project_id=${activeProjectId}&board_id=${boardId}`);
    }
    const changeProject = (e: any) => {
        const projectId = projects.find(x => x.project_name === e.target.value)?.project_id
        if (!projectId)
            return;

        window.location.replace(`/projects/boards?project_id=${projectId}`);
    }

    const current = projects.find(x => activeProjectId === x.project_id)

    return (
        <div className="sidebar">
            {showProject && <ProjectInfo onClose={closeProjectModal} editProject={editProject} activeProjectId={activeProjectId} />}
            {showBoard && <BoardInfo onClose={closeBoardModal} editBoard={editBoard} activeBoardId={activeBoardId} activeProjectId={activeProjectId} />}
            <div className="project-list">
                <h2 className="sidebar-heading">Projects</h2>
                <button className="add-button" onClick={() => setShowBoard(true)}>
                    Add New Project
                </button>
                <select className='select-project' onChange={(e) => changeProject(e)} value={current?.project_name}>
                    {projects.map(x => (<option key={x.project_id} value={x.project_name}>{x.project_name}</option>))}
                </select>
            </div>
            <div>
                <h2 className="sidebar-heading">Boards</h2>
            </div>
            <ul className="board-list">
                {boards.map(board => (
                    <li key={board.board_id} className={`board-item ${activeBoardId === board.board_id ? 'active' : ''}`}>
                        <button className='link' onClick={() => changeBoard(board.board_id)}>
                            {board.board_name}
                        </button>
                        <Edit size={16} onClick={() => {
                            setShowBoard(true)
                            setEditBoard(board)
                        }} />
                    </li>
                ))}
            </ul>
            <button className="add-button" onClick={() => setShowBoard(true)}>
                Add New Board
            </button>
        </div>
    )
}

export default Sidebar;