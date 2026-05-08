import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api, { fetcher } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Loader2, Clock, Calendar, CheckSquare, Edit2, Trash2, CheckCircle, Paperclip } from 'lucide-react';
import { format } from 'date-fns';

const COLUMNS = {
  'Pending': { id: 'Pending', title: 'Pending' },
  'In Progress': { id: 'In Progress', title: 'In Progress' },
  'Completed': { id: 'Completed', title: 'Completed' }
};

const Tasks = () => {
  const { user, searchQuery = '' } = useAuth();
  const { data: rawTasks = [], isLoading: loadingTasks, mutate: mutateTasks } = useSWR('/tasks', fetcher);
  const { data: projects = [], isLoading: loadingProjects } = useSWR('/projects', fetcher);
  const { data: users = [], isLoading: loadingUsers } = useSWR(user?.role === 'Admin' ? '/auth/users' : null, fetcher);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium', dueDate: '', projectId: '', assignedTo: '', fileUrl: '', fileName: '' });
  const [editingTask, setEditingTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loading = loadingTasks || loadingProjects || loadingUsers;

  const tasks = useMemo(() => {
    const groupedTasks = {
      'Pending': [],
      'In Progress': [],
      'Completed': []
    };
    rawTasks.forEach(task => {
      if (groupedTasks[task.status]) {
        groupedTasks[task.status].push(task);
      }
    });
    return groupedTasks;
  }, [rawTasks]);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      const newTasks = [...rawTasks];
      const taskIndex = newTasks.findIndex(t => t._id === draggableId);
      
      if (taskIndex > -1) {
        newTasks[taskIndex] = { ...newTasks[taskIndex], status: destination.droppableId };
        mutateTasks(newTasks, false);
      }

      try {
        await api.put(`/tasks/${draggableId}`, { status: destination.droppableId });
        mutateTasks();
      } catch (error) {
        console.error('Failed to update status', error);
        mutateTasks();
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setNewTask({ ...newTask, fileUrl: res.data.data.fileUrl, fileName: res.data.data.fileName });
    } catch (error) {
      console.error('File upload failed', error);
      alert('Failed to upload file. File may be too large.');
    }
  };

  const handleCreateOrUpdateTask = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...newTask };
      if (!payload.assignedTo) delete payload.assignedTo;

      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, payload);
      } else {
        await api.post('/tasks', payload);
      }
      setIsModalOpen(false);
      setEditingTask(null);
      setNewTask({ title: '', description: '', priority: 'Medium', dueDate: '', projectId: '', assignedTo: '', fileUrl: '', fileName: '' });
      mutateTasks();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      mutateTasks();
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

  const priorityColors = {
    'Low': 'bg-slate-100 text-slate-600 border border-slate-200',
    'Medium': 'bg-blue-50 text-blue-700 border border-blue-200',
    'High': 'bg-rose-50 text-rose-700 border border-rose-200'
  };

  return (
    <div className="space-y-6 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tasks Board</h1>
          <p className="text-slate-500 mt-1">Drag and drop tasks to update status</p>
        </div>
        {user?.role === 'Admin' && (
          <button
            onClick={() => { setEditingTask(null); setNewTask({ title: '', description: '', priority: 'Medium', dueDate: '', projectId: '', assignedTo: '', fileUrl: '', fileName: '' }); setIsModalOpen(true); }}
            className="flex items-center px-5 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl hover:from-primary-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-primary-500/30 transform hover:-translate-y-0.5 font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Task
          </button>
        )}
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 pt-2">
        <DragDropContext onDragEnd={onDragEnd}>
          {Object.entries(COLUMNS).map(([columnId, column]) => (
            <div key={columnId} className="flex-1 min-w-[320px] glass rounded-3xl p-5 flex flex-col border border-white/60">
              <div className="flex items-center justify-between mb-5 px-2">
                <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${columnId === 'Pending' ? 'bg-amber-400' : columnId === 'In Progress' ? 'bg-primary-500' : 'bg-emerald-500'}`}></div>
                  {column.title}
                </h2>
                <span className="bg-slate-100 text-slate-600 font-bold text-xs py-1 px-2.5 rounded-lg border border-slate-200">
                  {tasks[columnId].length}
                </span>
              </div>
              
              <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 min-h-[200px] rounded-2xl transition-all duration-300 p-2 ${snapshot.isDraggingOver ? 'bg-slate-50/80 shadow-inner' : ''}`}
                  >
                    {tasks[columnId].filter(task => {
                      if (!searchQuery) return true;
                      const query = searchQuery.toLowerCase();
                      return task.title.toLowerCase().includes(query) || 
                             task.description.toLowerCase().includes(query);
                    }).map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-5 mb-4 bg-white rounded-2xl border transition-all duration-300 group ${snapshot.isDragging ? 'shadow-2xl shadow-primary-500/20 border-primary-400 scale-105 rotate-2 z-50' : 'shadow-sm border-slate-200 hover:shadow-md hover:border-slate-300'} ${columnId === 'Completed' && !snapshot.isDragging ? 'opacity-60 bg-slate-50 border-emerald-100 hover:opacity-100' : ''}`}
                            style={{ ...provided.draggableProps.style }}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h3 className={`text-base font-bold line-clamp-2 pr-2 flex items-center gap-2 ${columnId === 'Completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                {columnId === 'Completed' && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
                                {task.title}
                              </h3>
                              {user?.role === 'Admin' && (
                                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 rounded-lg p-0.5 border border-slate-100">
                                  <button onClick={() => { setEditingTask(task); setNewTask({ title: task.title, description: task.description, priority: task.priority, dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '', projectId: task.projectId?._id || '', assignedTo: task.assignedTo?._id || '', fileUrl: task.fileUrl || '', fileName: task.fileName || '' }); setIsModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-primary-600 rounded-md hover:bg-white transition-colors">
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => handleDeleteTask(task._id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-white transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">{task.description}</p>
                            
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                              <span className={`text-[11px] px-2.5 py-1 rounded-md font-semibold ${priorityColors[task.priority]}`}>
                                {task.priority}
                              </span>
                              {task.projectId && (
                                <span className="text-[11px] px-2.5 py-1 rounded-md font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 line-clamp-1 max-w-[120px]">
                                  {task.projectId.title}
                                </span>
                              )}
                              {task.fileUrl && (
                                <a href={`http://localhost:5000${task.fileUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-[11px] px-2.5 py-1 rounded-md font-semibold bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition-colors" title={task.fileName} onClick={(e) => e.stopPropagation()}>
                                  <Paperclip className="w-3 h-3 mr-1" />
                                  <span className="line-clamp-1 max-w-[80px]">{task.fileName}</span>
                                </a>
                              )}
                            </div>

                            <div className="flex justify-between items-center border-t border-slate-100 pt-4">
                              <div className="flex items-center text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md">
                                <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                {format(new Date(task.dueDate), 'MMM d')}
                              </div>
                              {task.assignedTo && (
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center text-[11px] font-bold shadow-sm" title={task.assignedTo.name}>
                                  {task.assignedTo.name.charAt(0)}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </DragDropContext>
      </div>

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative inline-block w-full max-w-md p-8 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-3xl border border-slate-100 animate-in zoom-in-95 duration-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">{editingTask ? 'Edit Task' : 'Create New Task'}</h3>
              <form onSubmit={handleCreateOrUpdateTask}>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                    <input
                      type="text"
                      required
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all shadow-sm"
                      placeholder="e.g. Design Login Page"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                    <textarea
                      required
                      rows={2}
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all shadow-sm resize-none"
                      placeholder="Add specific details or instructions for this task..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                      <select
                        value={newTask.priority}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                        className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all shadow-sm appearance-none"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Due Date</label>
                      <input
                        type="date"
                        required
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                        className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Project</label>
                      <select
                        required
                        value={newTask.projectId}
                        onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                        className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all shadow-sm appearance-none"
                      >
                        <option value="" disabled>Select a project</option>
                        {projects.map(p => (
                          <option key={p._id} value={p._id}>{p.title}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Assign To</label>
                      <select
                        value={newTask.assignedTo}
                        onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                        className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all shadow-sm appearance-none"
                      >
                        <option value="">Unassigned</option>
                        {users.map(u => (
                          <option key={u._id} value={u._id}>{u.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Attachment (Optional)</label>
                    <div className="flex items-center gap-4">
                      <label className="flex-1 cursor-pointer flex flex-col items-center px-4 py-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl hover:bg-slate-100 transition-colors">
                        <Paperclip className="w-6 h-6 text-slate-400 mb-2" />
                        <span className="text-sm text-slate-500 font-medium">Click to upload file</span>
                        <input type="file" className="hidden" onChange={handleFileUpload} />
                      </label>
                      {newTask.fileName && (
                        <div className="flex-1 bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-center justify-between">
                          <span className="text-sm text-blue-700 font-medium truncate max-w-[150px]">{newTask.fileName}</span>
                          <button type="button" onClick={() => setNewTask({...newTask, fileUrl: '', fileName: ''})} className="text-blue-400 hover:text-blue-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
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
                    {editingTask ? 'Update Task' : 'Create Task'}
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

export default Tasks;
