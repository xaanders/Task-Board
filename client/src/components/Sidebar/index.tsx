import React, { useState } from 'react'
import './Sidebar.css'
import BoardInfo from './BoardInfo';
import { IBoard, IProject } from '../../types/interfaces';
import { Edit } from 'react-feather';
import ProjectInfo from './ProjectInfo';
import { useAuth } from '../../store/auth';
import { useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { dbApiCall } from '../../helpers/DataAccess';
import { toast } from 'react-toastify';

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
interface IDefaultProject {
    project_name: '';
}
const defaultProject: IDefaultProject = {
    project_name: '',
}

function Sidebar({ activeProjectId, activeBoardId, boards, projects, fetchBoards, fetchProjects }: SidebarProps) {

    const [showBoard, setShowBoard] = useState(false);
    const [showProject, setShowProject] = useState(false);

    const [editBoard, setEditBoard] = useState(defaultBoard);
    const [editProject, setEditProject] = useState<IDefaultProject | IProject>(defaultProject);

    const { signOut, accessToken } = useAuth();
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

    const removeProject = async () => {
        const project = projects.find(x => x.project_id === activeProjectId)
        const confirm = window.confirm(`Are you sure you want to remove project ${project?.project_name}?`)

        if(!confirm || !project)
            return;

        const {error} = await dbApiCall({method: 'POST', query: "update_project", accessToken, parameters: {status: 0, where: {project_id: project.project_id}}});
        if(error)
            return;

        toast.success(`Successfully remove a project ${project?.project_name}`)
        await fetchProjects();
        navigate(`/dashboard?project_id=${projects[0].project_id}`)
    }

    const editCurrentProject = () => {
        const project = projects.find(x => x.project_id === activeProjectId)
        if(!project)
            return;
        
        setEditProject(project);
        setShowProject(true);
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
                    <button className="add-button" onClick={() => setShowProject(true)}>
                        Add New Project
                    </button>
                    <div style={{textAlign: 'left', display: 'flex', justifyContent: 'space-between', gap: '10px'}}>
                    <button className="edit-button" onClick={removeProject}>Remove This Project</button>
                    <button className="edit-button" onClick={editCurrentProject}>Edit This Project</button>
                    </div>
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