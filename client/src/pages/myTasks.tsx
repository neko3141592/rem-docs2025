import React, { useContext, useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { AuthContext } from '../AuthContext';
import CountUp from 'react-countup';
import NavBar from '../components/NavBar';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';

const TABS = [
    { key: 'all', label: 'すべて' },
    { key: 'doing', label: '進行中' },
    { key: 'done', label: '完了' },
    { key: 'todo', label: '未着手' },
    { key: 'expired', label: '期限切れ' }
];

const MyTasks = () => {
    const userState = useContext(AuthContext);
    const user = userState?.user;
    const [tasks, setTasks] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchTasks = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
                const snapshot = await getDocs(q);
                const userTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setTasks(userTasks);
            } catch (err) {
                console.error('タスク取得エラー:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, [user]);

    const filteredTasks = tasks.filter((task: any) => {
        if (activeTab === 'all') return true;
        if (activeTab === 'expired') {
            const now = new Date();
            const dueDate = task.dueDate ? new Date(task.dueDate.seconds * 1000) : null;
            return dueDate && dueDate < now && task.status !== 'done';
        }
        return task.status === activeTab;
    });

    const getProgressColor = (value: number) => {
        if (value >= 80) return 'bg-green-500';
        if (value >= 50) return 'bg-yellow-500';
        if (value >= 20) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case '高': return 'bg-red-200 text-red-800';
            case '中': return 'bg-yellow-200 text-yellow-800';
            case '低': return 'bg-blue-200 text-blue-800';
            default: return 'bg-gray-200 text-gray-800';
        }
    };

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

    return (
        <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white"   >
            <NavBar />
            <div className="p-6 pt-28 container mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">マイタスク一覧</h1>

                <div className="flex border-b border-gray-300 dark:border-gray-600 space-x-4 mb-6 overflow-x-auto whitespace-nowrap">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`py-2 px-4 text-lg font-semibold rounded-t-lg transition ${
                                activeTab === tab.key
                                    ? 'border-b-4 border-yellow-400 text-yellow-500 dark:text-yellow-400'
                                    : 'text-gray-500 hover:text-yellow-400 dark:text-gray-400 dark:hover:text-yellow-300'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <Loading />
                ) : (
                    <>
                        <div className="mb-4 text-gray-600 dark:text-gray-300 text-xl">
                            <span className="text-yellow-500 text-3xl font-bold mr-2">
                                {filteredTasks.length}
                            </span>
                            件のタスクを表示中
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-9">
                            {filteredTasks.length > 0 ? (
                                filteredTasks.map((task) => {
                                    const progress = task.progress || 0;
                                    const dueDate = task.dueDate ? new Date(task.dueDate.seconds * 1000) : null;
                                    const isExpired = dueDate && dueDate < new Date() && task.status !== 'done';
                                    const displayStatus = isExpired ? 'expired' : task.status;

                                    return (
                                        <div
                                            key={task.id}
                                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
                                            onClick={() => navigate(`/tasks/${task.id}`)}
                                        >
                                            <div className="p-5 flex-grow">
                                                <div className="flex justify-between items-center mb-3">
                                                    {getStatusBadge(displayStatus)}
                                                    {task.priority && (
                                                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                                                            優先度:{task.priority}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex">
                                                    <h2 className="text-xl font-bold mb-2 mr-1 text-gray-900 dark:text-white line-clamp-2">
                                                        {task.title || '（タイトルなし）'}
                                                    </h2>
                                                    {task.tags && task.tags.map((tag) => (
                                                        <span key={tag} className="inline-block pl-1 py-1 text-xs font-semibold rounded-full text-blue-500">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>

                                                <p className={`text-sm mb-4 ${isExpired ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                                                    <span className="font-medium">期限: </span>
                                                    {dueDate ? dueDate.toLocaleDateString() : '未設定'}
                                                    {isExpired && ' (期限切れ)'}
                                                </p>

                                                <div className="mb-2">
                                                    <div className="mb-1 text-sm text-gray-700 dark:text-gray-300 flex justify-between">
                                                        <span>進捗</span>
                                                        <span>{progress}%</span>
                                                    </div>
                                                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${getProgressColor(progress)} transition-all duration-500`}
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="col-span-full text-center text-gray-500 dark:text-gray-400 py-6">
                                    このタブに該当するタスクはありません。
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>

            <button
                onClick={() => navigate('./add')}
                className="fixed bottom-6 right-6 bg-yellow-400 hover:bg-yellow-500 text-white text-xl font-bold rounded-full w-16 h-16 shadow-lg flex items-center justify-center transition-all duration-300 z-50"
                aria-label="タスクを追加"
            >
                ＋
            </button>
        </main>
    );
};

export default MyTasks;
