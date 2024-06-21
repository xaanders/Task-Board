import React, { useState } from 'react'
import Modal from '../../modal/Modal';
import { Type, X } from 'react-feather';
import CustomInput from '../../CustomInput/CustomInput';
import { apiCall, dbApiCall } from '../../../helpers/DataAccess';
import { IProject } from '../../../types/interfaces';
import { useAuth } from '../../../store/auth';
import { useAppContext } from '../../../store';
import { toast } from 'react-toastify';

interface Props {
    onClose: (refetch?: boolean) => void;
    editProject: IProject;
    activeProjectId: number | null;

}

type NewUser = {
    email: string;
    name: string
}

function ProjectInfo({ onClose, editProject, activeProjectId }: Props) {

    const [newProject, setNewProject] = useState(editProject);
    const [invitedUsers, setInvitedUsers] = useState<NewUser[]>([]);
    const [newUser, setNewUser] = useState<NewUser>({ email: "", name: "" })
    const [isAddUser, setIsAddUser] = useState<boolean>(false);

    const { accessToken, user } = useAuth();
    const { showLoading } = useAppContext();

    const updateData = (v: string, key: string) => {
        setNewProject(prev => ({ ...prev, [key]: v }))
    }

    const saveNewProject = async (e: any) => {
        e.preventDefault();

        if (!user)
            return;

        showLoading(true)
        const res = await dbApiCall({
            method: "POST", query: 'insert_project', accessToken, parameters: {
                name: newProject.project_name,
                user_id: user.id,
                status: 1
            }
        })

        const projectId = res[0].lastInsertId

        if (!projectId) {
            toast.error("No project id");
            return
        }

        for (let i = 0; i < invitedUsers.length; i++) {
            await apiCall({
                method: "POST", accessToken, parameters: {
                    inviteUser: true,
                    sendEmail: invitedUsers[i].email,
                    sendName: invitedUsers[i].name,
                    projectId,
                    projectName: newProject.project_name
                }
            })
        }

        showLoading(false)
        toast.success("Project successfully created.");
        onClose();
    }

    const updateProject = async (e: any) => {
        e.preventDefault();
        const id = newProject.project_id;
        if (!id)
            return;

        const newProjectId: any[] = await dbApiCall({
            method: "POST", query: 'update_project', accessToken: accessToken, parameters: {
                name: newProject.project_name,
                where: { project_id: id }
            }
        })
        console.log(newProjectId)

        onClose();
    }

    const changeNewUser = (value: string, key: string) => {
        console.log(value, key);
        setNewUser(prev => ({ ...prev, [key]: value }))
    }

    const saveNewUser = (e: any) => {
        e.preventDefault();
        if (invitedUsers.some(x => x.email === newUser.email)) {
            toast.error('Such email already added to the list');
            return;
        }

        if (newUser.email && newUser.name) {
            setInvitedUsers(prev => [...prev, newUser]);
            setNewUser({ email: "", name: "" });
            setIsAddUser(false);
        }
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

                    <div className="cardinfo-box-title">
                        <Type />
                        <p>Invite Users</p>
                    </div>
                    {isAddUser ?
                        <form onSubmit={saveNewUser} style={{ textAlign: 'left' }}>
                            <div className="input-box">
                                <label htmlFor="email">Email:</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={newUser.email}
                                    required
                                    onChange={(e) => changeNewUser(e.target.value, 'email')}
                                />
                            </div>
                            <div className="input-box">
                                <label htmlFor="name">Name:</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={newUser.name}
                                    required
                                    onChange={(e) => changeNewUser(e.target.value, 'name')}
                                />
                            </div>
                            <button className='add-btn' style={{ margin: '0 auto', display: 'block' }}>Save</button>
                        </form>
                        :
                        <button className='custom-input-display' onClick={() => setIsAddUser(true)}>Invite User</button>
                    }
                    <div>
                        <h4 className='users-title'>{invitedUsers.length > 0 ? "Invite users:" : ""}</h4>
                        <ul className="users-list">
                            {invitedUsers.map(u => (
                                <li className="list-item" key={u.email}><span>{u.name}</span><span>-</span><span>{u.email}</span><span> <X width="16" height="16" onClick={() => setInvitedUsers(prev => prev.filter(x => x.email !== u.email))} /></span></li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="actions">
                    <button type="button" disabled={!newProject.project_name} className="secondary-btn" onClick={newProject.project_id ? updateProject : saveNewProject}>Save</button>
                </div>
            </div>
        </Modal >
    )
}

export default ProjectInfo