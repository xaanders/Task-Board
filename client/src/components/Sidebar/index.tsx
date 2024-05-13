import React, { useEffect, useState } from 'react'
import './Sidebar.css'
import ProjectInfo from './ProjectInfo';
import { dbApiCall } from '../../helpers/DataAccess';
import { IProject } from '../../types/interfaces';
import { Edit } from 'react-feather';

interface SidebarProps {
    projects: IProject[];
    activeProject?: number
}
const defaultProject = {
    project_name: ''
}

const Sidebar = ({ projects, activeProject }: SidebarProps) => {

    const [showProject, setShowProject] = useState(false);
    const [editProject, setEditProject] = useState(defaultProject);

    const closeModal = () => {
        setShowProject(false);
        setEditProject(defaultProject);
    }

    return (
        <div className="sidebar">
            {showProject && <ProjectInfo onClose={closeModal} editProject={editProject} />}
            <h2 className="sidebar-heading">Projects</h2>
            <button className="add-button" onClick={() => setShowProject(true)}>
                Add New Project
            </button>
            <ul className="project-list">
                {projects.map(project => (
                    <li key={project.project_id} className={`project-item ${activeProject === project.project_id ? 'active' : ''}`}>
                        <a href={`/projects?project_id=${project.project_id}`} className='link'>
                            {project.project_name}
                        </a>
                        <Edit size={16} onClick={() => {
                            setShowProject(true)
                            setEditProject(project)
                        }} />
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Sidebar;