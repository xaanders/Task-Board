import Board from '../components/Board/Board';
import 'react-toastify/dist/ReactToastify.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { IBoard, IProject } from '../types/interfaces';
import { dbApiCall } from '../helpers/DataAccess';
import NoBoard from '../components/Board/NoBoard';
import { useAuth } from '../store/auth';


const getActiveIds = () => {
  const params = new URLSearchParams(window.location.search);
  const board_id = params.get('board_id');

  const project_id = params.get('project_id');

  let boardId = board_id ? +board_id : null;
  let projectId = project_id ? +project_id : null;

  return { boardId, projectId }
}

function Dashboard() {

  const [activeBoardId, setActiveBoardId] = useState<number | null>(null)
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null)
  const {accessToken} = useAuth();

  const [boards, setBoards] = useState<IBoard[]>([]);
  const [projects, setProjects] = useState<IProject[]>([]);

  const fetchBoards = useCallback(async () => {
    if (!activeProjectId || !projects.length)
      return
    console.log(projects)
    let boards: IBoard[] = await dbApiCall({
      method: "GET", query: 'select_board', accessToken: accessToken, parameters: { project_id: activeProjectId }
    });
    setBoards(boards || [])
  }, [activeProjectId, projects])

  async function fetchProjects() {
    let projects: IProject[] = await dbApiCall({
      method: "GET", accessToken: accessToken, query: 'select_project'
    });
    if (projects && projects.length)
      setProjects(projects)
  }

  useEffect(() => {
    if (!boards.length && !projects.length) {
      const { boardId, projectId } = getActiveIds();
      setActiveBoardId(boardId);
      setActiveProjectId(projectId);
      fetchProjects();
      fetchBoards();
    }
    else if (!boards.length && activeProjectId)
      fetchBoards();
    else if (!projects.length)
      fetchProjects();


  }, [fetchBoards, boards.length, projects.length, activeProjectId])

  const activeBoardName = useMemo(() => boards.find(x => x.board_id === activeBoardId)?.board_name || null, [boards, activeBoardId]);

  return (
    <>
      <Sidebar activeBoardId={activeBoardId}
        activeProjectId={activeProjectId}
        fetchBoards={fetchBoards}
        fetchProjects={fetchProjects}
        boards={boards}
        projects={projects}
      />
      {activeProjectId && !activeBoardId && <NoBoard />}
      {activeProjectId && activeBoardId && <Board activeBoardId={activeBoardId} activeBoardName={activeBoardName} isProject={!!projects.length && !!activeBoardId} />}
    </>
  )

}

export default Dashboard;
