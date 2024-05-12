import React from 'react'
import './Sidebar.css'
interface Project {
    project_id: number;
    name: string;
}
interface SidebarProps {
    projects: Project[];
}

const Sidebar = ({ projects }: SidebarProps) => {
    return (
        <div className="sidebar">
            <h2 className="sidebar-heading">Projects</h2>
            <ul className="project-list">
                {projects.map(project => (
                    <li key={project.project_id} className="project-item">
                        {project.name}
                    </li>
                ))}
            </ul>
            <button className="add-button" >
                Add New Project
            </button>
        </div>
    )
}

export default Sidebar;