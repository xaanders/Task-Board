import React, { useState } from 'react'
import Modal from '../../modal/Modal';
import { List, Type } from 'react-feather';
import CustomInput from '../../CustomInput/CustomInput';
import { dbApiCall, getAllData } from '../../../helpers/DataAccess';
import moment from 'moment';
import { IProject } from '../../../types/interfaces';

interface Props {
    onClose: () => void;
    editProject: IProject
}


const ProjectInfo = ({ onClose, editProject }: Props) => {

    const [newProject, setNewProject] = useState(editProject);

    const updateData = (v: string, key: string) => {
        setNewProject(prev => ({ ...prev, [key]: v }))
    }

    const saveNewProject = async (e: any) => {
        e.preventDefault();

        const res = await dbApiCall({
            method: "POST", query: 'insert_project', parameters: {
                ...newProject,
                status: 1
            }
        })
        await getAllData(res[0].lastInsertId);

        onClose();
    }

    const updateProject = async (e: any) => {}

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
                        onSubmit={(v) => updateData(v, 'name')}
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