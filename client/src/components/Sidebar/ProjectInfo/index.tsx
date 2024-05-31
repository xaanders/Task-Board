import React, { useState } from 'react'
import Modal from '../../modal/Modal';
import { Type } from 'react-feather';
import CustomInput from '../../CustomInput/CustomInput';
import { dbApiCall } from '../../../helpers/DataAccess';
import { IProject } from '../../../types/interfaces';

interface Props {
    onClose: () => void;
    editProject: IProject;
    activeProjectId: number | null;

}


function ProjectInfo({ onClose, editProject, activeProjectId }: Props) {

    const [newProject, setNewProject] = useState(editProject);

    const updateData = (v: string, key: string) => {
        setNewProject(prev => ({ ...prev, [key]: v }))
    }

    const saveNewProject = async (e: any) => {
        e.preventDefault();

        await dbApiCall({
            method: "POST", query: 'insert_project', parameters: {
                ...newProject,
                status: 1
            }
        })
        onClose();
    }

    const updateProject = async (e: any) => {
        e.preventDefault();
        const id = newProject.project_id;
        if (!id)
            return;

        await dbApiCall({
            method: "POST", query: 'update_project', parameters: {
                name: newProject.project_name,
                where: { project_id: id }
            }
        })


        onClose();
    }

    return (
        <Modal onClose={onClose}>
            <div className="cardinfo">
                <div className="cardinfo-box">
                    <div className="cardinfo-box-title">
                        <Type />
                        <p>Project Name</p>
                    </div>
                    <CustomInput
                        defaultValue={newProject.project_name}
                        text={newProject.project_name || "Add a Title"}
                        placeholder="Enter Title"
                        onSubmit={(v) => updateData(v, 'project_name')}
                    />
                </div>
                <div className="actions">
                    <button type="button" disabled={!newProject.project_name} className="save-btn" onClick={newProject.project_id ? updateProject : saveNewProject}>Save</button>
                </div>
            </div>
        </Modal >
    )
}

export default ProjectInfo