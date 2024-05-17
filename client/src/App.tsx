import './App.css';
import Dashboard from './dashboard/Dashboard';
import { Bounce, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAppContext } from './store';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import Loading from './components/Common/Loading';
import { IBoard, IProject } from './types/interfaces';
import { dbApiCall } from './helpers/DataAccess';
import NoBoard from './dashboard/NoBoard';


const getActiveIds = () => {
  const params = new URLSearchParams(window.location.search);
  const board_id = params.get('board_id');

  const project_id = params.get('project_id');

  let boardId = board_id ? +board_id : null;
  let projectId = project_id ? +project_id : null;

  return { boardId, projectId }
}

function App() {
  const { isLoading } = useAppContext();

  const [activeBoardId, setActiveBoardId] = useState<number | null>(null)
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null)

  const [boards, setBoards] = useState<IBoard[]>([]);
  const [projects, setProjects] = useState<IProject[]>([]);

  const fetchBoards = useCallback(async () => {
    if (!activeProjectId)
      return

    let boards: IBoard[] = await dbApiCall({
      method: "GET", query: 'select_board', parameters: { project_id: activeProjectId }
    });
    setBoards(boards)
  }, [activeProjectId])

  async function fetchProjects() {
    let projects: IProject[] = await dbApiCall({
      method: "GET", query: 'select_project'
    });
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
    <div className="app">
      <Sidebar activeBoardId={activeBoardId}
        activeProjectId={activeProjectId}
        fetchBoards={fetchBoards}
        fetchProjects={fetchProjects}
        boards={boards}
        projects={projects}
      />
      {activeProjectId && !activeBoardId && <NoBoard />}
      {activeProjectId && activeBoardId && <Dashboard activeBoardId={activeBoardId} activeBoardName={activeBoardName} />}

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
      {isLoading ?
        <Loading /> : <></>
      }
    </div>
  )

}

export default App;
