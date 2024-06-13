import Board from '../components/Board/Board';
import 'react-toastify/dist/ReactToastify.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { IBoard, IProject } from '../types/interfaces';
import { dbApiCall } from '../helpers/DataAccess';
import NoBoard from '../components/Board/NoBoard';
import { useAuth } from '../store/auth';
import { useNavigate, useSearchParams } from 'react-router-dom';

function Dashboard() {

  const [searchParams] = useSearchParams();
  const [{ board_id, project_id }, setQuery] = useState<{ board_id: number | null, project_id: number | null }>({ board_id: null, project_id: null });

  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [boards, setBoards] = useState<IBoard[]>([]);
  const [projects, setProjects] = useState<IProject[]>([]);

  const fetchBoards = useCallback(async () => {
    if (!projects.length || !project_id)
      return

    let boards: IBoard[] = await dbApiCall({
      method: "GET", query: 'select_board', accessToken: accessToken, parameters: { project_id: project_id }
    });

    setBoards(boards || [])

  }, [project_id, projects, accessToken])

  const fetchProjects = useCallback(async () => {
    let projects: IProject[] = await dbApiCall({
      method: "GET", accessToken: accessToken, query: 'select_project'
    });
    if (projects && projects.length)
      setProjects(projects)

  }, [accessToken]);

  useEffect(() => {
    const board_id = searchParams.get("board_id")
    const project_id = searchParams.get("project_id")

    if (!project_id && projects[0]?.project_id)
      navigate(`/dashboard?project_id=${projects[0].project_id}`)
    else
      setQuery({
        board_id: board_id ? +board_id : null,
        project_id: project_id ? +project_id : null
      })

  }, [navigate, projects, searchParams]);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards, project_id, projects])


  useEffect(() => {
    if (!projects.length) {
      fetchProjects();
      console.log('fetch projects')
    }
  }, [fetchProjects, projects]);


  const activeBoardName = useMemo(() => boards.find(x => board_id && x.board_id === board_id)?.board_name || null, [boards, board_id]);

  return (
    <>
      <Sidebar activeBoardId={board_id}
        activeProjectId={project_id}
        fetchBoards={fetchBoards}
        fetchProjects={fetchProjects}
        boards={boards}
        projects={projects}
      />
      {project_id && !board_id && <NoBoard />}
      {project_id && board_id && <Board activeBoardId={board_id} activeBoardName={activeBoardName} isProject={!!projects.length && !!board_id} />}
    </>
  )

}

export default Dashboard;
