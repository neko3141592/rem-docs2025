import React, { useState, useEffect} from 'react';
import{ auth } from '../firebase';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc} from 'firebase/firestore';
import { db } from '../firebase';
import { AuthContext } from '../AuthContext';
import { Task } from '../types';
import NavBar from '../components/NavBar';
import { DefaultTask } from '../types/index';
import { PencilIcon } from '@heroicons/react/outline'; // 追加
import Loading from '../components/Loading';

const TaskDetail = () => {
    const {taskId} = useParams<{ taskId: string }>();
    const [taskData, setTaskData] = useState<Task>(DefaultTask);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    

    useEffect(() => {
        const fetchTask = async () => {
            if (!taskId) return;
            setLoading(true);
            const taskDoc = doc(db, 'tasks', taskId);
            try {
                const taskSnapshot = await getDoc(taskDoc);
                if (taskSnapshot.exists()) {
                    const fetchedTask = taskSnapshot.data() as Task;
                    setTaskData(fetchedTask);
                } else {
                    console.log('No such task!');
                }
                setLoading(false);
            } catch (error) {
                console.log(error);

            }
        }
        fetchTask();
    }, [taskId]);

    // ステータス
    const getStatusBadge = (status: string) => {
        let colorClass = '', label = '';
        switch (status) {
            case 'done': colorClass = 'bg-green-100 text-green-800'; label = '完了'; break;
            case 'doing': colorClass = 'bg-yellow-100 text-yellow-800'; label = '進行中'; break;
            case 'todo': colorClass = 'bg-blue-100 text-blue-800'; label = '未着手'; break;
            case 'expired': colorClass = 'bg-red-100 text-red-800'; label = '期限切れ'; break;
            default: colorClass = 'bg-gray-100 text-gray-800'; label = '不明';
        }
        return <span className={`inline-block px-3 py-1 text-sm rounded-full font-semibold ${colorClass}`}>{label}</span>;
    };

    // 優先度
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case '高': return 'bg-red-200 text-red-800';
            case '中': return 'bg-yellow-200 text-yellow-800';
            case '低': return 'bg-blue-200 text-blue-800';
            default: return 'bg-gray-200 text-gray-800';
        }
    };

    return (
        <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
            <NavBar />
            <div className="p-6 pt-28 container mx-auto">
                {loading ? (
                    <Loading />
                ) : (
                    <>
                        <div className="flex items-center mb-6">
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mr-3">{taskData.title}</h1>
                            <button
                                onClick={() => navigate(`/tasks/${taskId}/edit`)} // 編集ページへ遷移
                                type="button"
                                className="flex items-center px-3 py-2 "
                                aria-label="タスク編集"
                            >
                                <PencilIcon className="w-6 h-6 mr-1" />
                            </button>
                        </div>
                        <div className="w-full mb-8">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">進捗</span>
                                <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{taskData.progress ?? 0}%</span>
                            </div>
                            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow">
                                <div
                                    className={`h-full rounded-full ${
                                        (taskData.progress ?? 0) >= 80
                                            ? 'bg-green-500'
                                            : (taskData.progress ?? 0) >= 50
                                            ? 'bg-yellow-500'
                                            : (taskData.progress ?? 0) >= 20
                                            ? 'bg-orange-500'
                                            : 'bg-red-500'
                                    }`}
                                    style={{ width: `${taskData.progress ?? 0}%` }}
                                />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 flex flex-col gap-4">
                            <div className="flex flex-wrap gap-4 items-center">
                                {getStatusBadge(taskData.status)}
                                {taskData.priority && (
                                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColor(taskData.priority)}`}>
                                        優先度: {taskData.priority}
                                    </span>
                                )}
                                {taskData.tags && taskData.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {taskData.tags.map((tag: string) => (
                                            <span key={tag} className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className={`text-sm ${taskData.dueDate ? '' : 'text-gray-400'}`}>
                                    <span className="font-medium">期限: </span>
                                    {taskData.dueDate
                                        ? new Date(taskData.dueDate.seconds * 1000).toLocaleDateString()
                                        : '未設定'}
                                </div>
                                <div className="text-sm">
                                    <span className="font-medium">説明: </span>
                                    {taskData.description || '（説明なし）'}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}

export default TaskDetail;