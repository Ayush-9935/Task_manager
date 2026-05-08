import { useState } from 'react';
import useSWR from 'swr';
import api, { fetcher } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FolderKanban, Plus, Loader2, Users, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const Projects = () => {
  const { user, searchQuery = '' } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '' });
  const [editingProject, setEditingProject] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: projects = [], isLoading: loading, mutate } = useSWR('/projects', fetcher);

  const handleCreateOrUpdateProject = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingProject) {
        await api.put(`/projects/${editingProject._id}`, newProject);
      } else {
        await api.post('/projects', newProject);
      }
      setIsModalOpen(false);
      setEditingProject(null);
      setNewProject({ title: '', description: '' });
      mutate();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      mutate();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    );
  }

  const filteredProjects = projects.filter(project => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return project.title.toLowerCase().includes(query) || 
           project.description.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Projects</h1>
          <p className="text-slate-500 mt-1">Manage your team projects and collaborations</p>
        </div>
        {user?.role === 'Admin' && (
          <button
            onClick={() => { setEditingProject(null); setNewProject({ title: '', description: '' }); setIsModalOpen(true); }}
            className="flex items-center px-5 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl hover:from-primary-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-primary-500/30 transform hover:-translate-y-0.5 font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center glass rounded-3xl border border-dashed border-primary-200">
            <div className="p-5 rounded-full bg-primary-50 mb-5">
              <FolderKanban className="w-12 h-12 text-primary-400" />
            </div>
            <p className="text-lg font-medium text-slate-700 mb-2">No projects found</p>
            <p className="text-sm text-slate-500">{searchQuery ? 'Try adjusting your search.' : 'Create your first project to get started.'}</p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div key={project._id} className="glass rounded-3xl p-7 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300 group border border-white/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/10 to-purple-500/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              
              <div className="flex justify-between items-start mb-5 relative z-10">
                <h3 className="text-xl font-bold text-slate-800 line-clamp-1 pr-2 group-hover:text-primary-600 transition-colors">{project.title}</h3>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-600 border border-primary-100">
                    Active
                  </span>
                  {user?.role === 'Admin' && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
                      <button onClick={() => { setEditingProject(project); setNewProject({ title: project.title, description: project.description }); setIsModalOpen(true); }} className="p-1 text-slate-400 hover:text-indigo-600 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteProject(project._id)} className="p-1 text-slate-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-500 line-clamp-2 mb-6 h-10 relative z-10 leading-relaxed">
                {project.description}
              </p>
              <div className="flex items-center justify-between border-t border-slate-100 pt-5 relative z-10">
                <div className="flex items-center text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <Users className="w-4 h-4 mr-2 text-primary-500" />
                  {project.members.length} members
                </div>
                <div className="text-xs font-medium text-slate-400">
                  {format(new Date(project.createdAt), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative inline-block w-full max-w-md p-8 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-3xl border border-slate-100 animate-in zoom-in-95 duration-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">{editingProject ? 'Edit Project' : 'Create New Project'}</h3>
              <form onSubmit={handleCreateOrUpdateProject}>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                    <input
                      type="text"
                      required
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all shadow-sm"
                      placeholder="e.g. Website Redesign"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all shadow-sm resize-none"
                      placeholder="Briefly describe the goals and scope of this project..."
                    />
                  </div>
                </div>
                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors focus:outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-indigo-600 rounded-xl hover:from-primary-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg focus:outline-none flex items-center"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {editingProject ? 'Update Project' : 'Create Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
