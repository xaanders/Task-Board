import React, { useState } from 'react'
import './Sidebar.css'
import BoardInfo from './BoardInfo';
import { IBoard, IProject } from '../../types/interfaces';
import { Edit } from 'react-feather';
import ProjectInfo from './ProjectInfo';
import { useAuth } from '../../store/auth';
import { useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';

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

    const { signOut } = useAuth();
    const navigate = useNavigate();

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
   
    const changeProject = (e: any) => {
        const projectId = projects.find(x => x.project_name === e.target.value)?.project_id
        if (!projectId)
            return;

        navigate(`/dashboard?project_id=${projectId}`);
    }

    const current = projects.find(x => activeProjectId === x.project_id)

    return (
        <div className="sidebar">
            <div className='sidebar-content'>
                {showProject && <ProjectInfo onClose={closeProjectModal} editProject={editProject} activeProjectId={activeProjectId} />}
                {showBoard && <BoardInfo onClose={closeBoardModal} editBoard={editBoard} activeBoardId={activeBoardId} activeProjectId={activeProjectId} />}
                <div className="project-list">
                    <h2 className="sidebar-heading">Projects</h2>
                    <select className='select-project' onChange={(e) => changeProject(e)} value={current?.project_name}>
                        {projects.map(x => (<option key={x.project_id} value={x.project_name}>{x.project_name}</option>))}
                    </select>
                    <button className="add-button" onClick={() => setShowBoard(true)}>
                        Add New Project
                    </button>
                </div>
                <div>
                    <h2 className="sidebar-heading">Boards</h2>
                </div>
                <ul className="board-list">
                    {boards.map(board => (
                        <li key={board.board_id} className={`board-item ${activeBoardId === board.board_id ? 'active' : ''}`}>
                            <NavLink className='link' to={`/dashboard?project_id=${activeProjectId}&board_id=${board.board_id}`}>
                                {board.board_name}
                            </NavLink>
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
            <div className='user-actions'>
                <button className="secondary-btn" onClick={() => signOut(() => navigate("/login"))}>
                    Sign Out
                </button>
            </div>
        </div>
    )
}

export default Sidebar;