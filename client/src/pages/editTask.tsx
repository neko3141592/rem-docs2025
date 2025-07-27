// src/pages/EditTask.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import NavBar from '../components/NavBar';
import Notification from '../components/Notification';
import { Task, PriorityType, StatusType, TaskType, DefaultTask } from '../types/index';
import { NotificationType } from '../components/Notification'



const EditTask: React.FC = () => {
    const { taskId } = useParams<{ taskId: string }>();
    const navigate = useNavigate();

    const [task, setTask] = useState<Task>(DefaultTask);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState<NotificationType | null>(null);
    const [newTagInput, setNewTagInput] = useState('');
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [dragInitialState, setDragInitialState] = useState<boolean | null>(null);

    useEffect(() => {
        const fetchTask = async () => {
        try {
            const docRef = doc(db, 'tasks', String(taskId));
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
            const data = docSnap.data();
            setTask({
                id: docSnap.id,
                title: data.title || '',
                type: data.type || '問題集',
                startPage: data.startPage ?? undefined,
                endPage: data.endPage ?? undefined,
                startQuestion: data.startQuestion ?? undefined,
                endQuestion: data.endQuestion ?? undefined,
                subQuestions: data.subQuestions ?? undefined,
                vocabCount: data.vocabCount ?? undefined,
                priority: data.priority || '中',
                dueDate: data.dueDate ? new Date(data.dueDate.seconds * 1000) : new Date(),
                notify: data.notify || false,
                notifyTime: data.notifyTime ? new Date(data.notifyTime.seconds * 1000) : undefined,
                status: data.status || 'todo',
                tags: data.tags || [],
                completedPages: data.completedPages || 0,
                completedVocab: data.completedVocab || 0,
                completedQuestionsList: data.completedQuestionsList || [],
            });
                setLoading(false);
            } else {
                setNotification({ message: 'タスクが見つかりません。', type: 'error' });
                setLoading(false);
            }
        } catch (err) {
            setNotification({ message: 'タスクの読み込み中にエラーが発生しました。', type: 'error' });
            setLoading(false);
        }
        };
        fetchTask();
    }, [taskId]);

    useEffect(() => {
        const handleMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
                setDragInitialState(null);
            }
        };
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const handleChange = <K extends keyof Task>(key: K, value: Task[K]) => {
        setTask((prev) => ({ ...prev, [key]: value }));
    };

    const calculateProgress = () => {
        if (!task) return 0;
        let newProgress = 0;
        if (task.type === '問題集') {
            const totalPages = (Number(task.endPage) - Number(task.startPage) + 1) > 0 ? (Number(task.endPage) - Number(task.startPage) + 1) : 0;
            const totalQuestions = (Number(task.endQuestion) - Number(task.startQuestion) + 1) > 0 ? (Number(task.endQuestion) - Number(task.startQuestion) + 1) : 0;
            const currentCompletedPagesValue = Number(task.completedPages) || 0;
            const currentCompletedQuestionsCount = task.completedQuestionsList.length;

            let pageProgress = 0;
            if (totalPages > 0) {
                pageProgress = Math.min(100, Math.round((currentCompletedPagesValue / totalPages) * 100));
            } else if (totalQuestions === 0) {
                pageProgress = 100;
            }

            let questionProgress = 0;
            if (totalQuestions > 0) {
                questionProgress = Math.min(100, Math.round((currentCompletedQuestionsCount / totalQuestions) * 100));
            } else if (totalPages === 0) {
                questionProgress = 100;
            }

            if (totalPages > 0 && totalQuestions > 0) {
                newProgress = Math.min(pageProgress, questionProgress);
            } else if (totalPages > 0) {
                newProgress = pageProgress;
            } else if (totalQuestions > 0) {
                newProgress = questionProgress;
            } else {
                newProgress = 0;
            }
        } else if (task.type === '単語帳') {
            const totalVocab = Number(task.vocabCount);
            const currentCompletedVocabValue = Number(task.completedVocab) || 0;
            if (totalVocab > 0) {
                newProgress = Math.min(100, Math.round((currentCompletedVocabValue / totalVocab) * 100));
            } else {
                newProgress = 0;
            }
        }
        return newProgress;
    };

    const handleSaveProgressAndStatus = async () => {
        setNotification(null);
        if (!task || !taskId) return;

        const newProgress = calculateProgress();
        let newStatus: StatusType = task.status;
        if (newProgress >= 100) {
            newStatus = 'done';
        } else if (newProgress > 0) {
            newStatus = 'doing';
        } else {
            newStatus = 'todo';
        }

        try {
            const docRef = doc(db, 'tasks', String(taskId));
            await updateDoc(docRef, {
                progress: newProgress,
                status: newStatus,
                completedPages: Number(task.completedPages) || 0,
                completedVocab: Number(task.completedVocab) || 0,
                completedQuestionsList: task.completedQuestionsList,
            });
            setTask((prev) => ({ ...prev, progress: newProgress, status: newStatus }));
            setNotification({ message: '進捗状況を更新しました', type: 'success' });
        } catch (err) {
            setNotification({ message: '進捗状況の更新に失敗しました', type: 'error' });
        }
    };

    const handleSaveTask = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setNotification(null);

        if (!task.title || !task.dueDate) {
        setNotification({ message: 'タイトルと期限は必須です', type: 'error' });
        return;
        }

        try {
            const docRef = doc(db, 'tasks', String(taskId));
            await updateDoc(docRef, {
                title: task.title,
                type: task.type,
                startPage: task.type === '問題集' && task.startPage !== undefined ? Number(task.startPage) : null,
                endPage: task.type === '問題集' && task.endPage !== undefined ? Number(task.endPage) : null,
                startQuestion: task.type === '問題集' && task.startQuestion !== undefined ? Number(task.startQuestion) : null,
                endQuestion: task.type === '問題集' && task.endQuestion !== undefined ? Number(task.endQuestion) : null,
                subQuestions: task.type === '問題集' && task.subQuestions !== undefined ? Number(task.subQuestions) : null,
                vocabCount: task.type === '単語帳' ? Number(task.vocabCount) : null,
                priority: task.priority,
                dueDate: task.dueDate,
                notify: task.notify,
                notifyTime: task.notify ? task.notifyTime : null,
                status: task.status,
                tags: task.tags,
                updatedAt: serverTimestamp(),
            });
            setNotification({ message: 'タスク情報を更新しました', type: 'success' });
        } catch (err) {
            setNotification({ message: 'タスク情報の更新に失敗しました', type: 'error' });
        }
    };

    const handleAddTag = async () => {
        const tagToAdd = newTagInput.trim();
        if (tagToAdd !== '' && !task.tags.includes(tagToAdd)) {
        try {
            const docRef = doc(db, 'tasks', String(taskId));
            await updateDoc(docRef, { tags: arrayUnion(tagToAdd) });
            handleChange('tags', [...task.tags, tagToAdd]);
            setNewTagInput('');
            setNotification({ message: 'タグを追加しました', type: 'success' });
        } catch (err) {
            setNotification({ message: 'タグの追加に失敗しました', type: 'error' });
        }
        }
    };

    const handleRemoveTag = async (tagToRemove: string) => {
        try {
        const docRef = doc(db, 'tasks', String(taskId));
        await updateDoc(docRef, { tags: arrayRemove(tagToRemove) });
        handleChange('tags', task.tags.filter(tag => tag !== tagToRemove));
        setNotification({ message: 'タグを削除しました', type: 'success' });
        } catch (err) {
        setNotification({ message: 'タグの削除に失敗しました', type: 'error' });
        }
    };

    const handleDeleteTask = async () => {
        try {
        const docRef = doc(db, 'tasks', String(taskId));
        await deleteDoc(docRef);
        setNotification({ message: 'タスクを削除しました', type: 'success' });
        navigate('/myTasks');
        } catch (err) {
        setNotification({ message: 'タスクの削除に失敗しました', type: 'error' });
        }
    };

    // ドラッグによる完了問題番号の選択
    const handleQuestionMouseDown = (questionNumber: number) => {
        let updatedList;
        const isCurrentlyCompleted = task.completedQuestionsList.includes(questionNumber);

        if (isCurrentlyCompleted) {
        updatedList = task.completedQuestionsList.filter(qNum => qNum !== questionNumber);
        setDragInitialState(false);
        } else {
        updatedList = [...task.completedQuestionsList, questionNumber].sort((a, b) => a - b);
        setDragInitialState(true);
        }
        handleChange('completedQuestionsList', updatedList);
        setIsDragging(true);
    };

    const handleQuestionMouseEnter = (questionNumber: number) => {
        if (isDragging && dragInitialState !== null) {
        handleChange('completedQuestionsList', (() => {
            const prevList = task.completedQuestionsList;
            const isCurrentlyCompleted = prevList.includes(questionNumber);
            if (dragInitialState && !isCurrentlyCompleted) {
            return [...prevList, questionNumber].sort((a, b) => a - b);
            } else if (!dragInitialState && isCurrentlyCompleted) {
            return prevList.filter(qNum => qNum !== questionNumber);
            }
            return prevList;
        })());
        }
    };

    if (loading) {
        return (
        <main className="min-h-screen font-default flex justify-center items-center dark:bg-gray-900 text-gray-900 dark:text-white">
            <NavBar />
            <div className="text-center text-gray-500 dark:text-gray-400 py-16 text-xl">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-yellow-400 border-t-transparent mx-auto mb-4" />
            </div>
        </main>
        );
    }

    const totalQuestionsInEdit = (Number(task.endQuestion) - Number(task.startQuestion) + 1);
    const totalQuestionsArray = totalQuestionsInEdit > 0 ? Array.from({ length: totalQuestionsInEdit }, (_, i) => Number(task.startQuestion) + i) : [];

    return (
        <main className="min-h-screen flex justify-center items-center dark:bg-gray-900 text-gray-900 dark:text-white pb-20">
        <NavBar />
        <div className="container mx-auto p-6 mt-24">
            <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <h1 className="text-3xl font-bold mb-6 text-yellow-600 dark:text-yellow-400">タスクを編集</h1>

            <form onSubmit={handleSaveTask} className="space-y-6 border-b pb-6 mb-6 border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">基本情報</h2>
                <div>
                <label className="block mb-1 font-semibold">タイトル</label>
                <input
                    type="text"
                    value={task.title}
                    onChange={e => handleChange('title', e.target.value)}
                    className="w-full border p-3 rounded bg-yellow-50 dark:bg-gray-700 border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                    placeholder="例：第3章 練習問題"
                />
                </div>

                <div>
                <label className="block mb-1 font-semibold">タスクのタイプ</label>
                <select
                    value={task.type}
                    onChange={e => handleChange('type', e.target.value as TaskType)}
                    className="w-full border p-3 rounded bg-yellow-50 dark:bg-gray-700 border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                >
                    <option value="問題集">問題集</option>
                    <option value="単語帳">単語帳</option>
                </select>
                </div>

                <div>
                <label className="block mb-1 font-semibold">優先度</label>
                <select
                    value={task.priority}
                    onChange={e => handleChange('priority', e.target.value as PriorityType)}
                    className="w-full border p-3 rounded bg-yellow-50 dark:bg-gray-700 border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                >
                    <option value="高">高</option>
                    <option value="中">中</option>
                    <option value="低">低</option>
                </select>
                </div>

                {task.type === '問題集' && (
                <>
                    <div className="flex gap-4">
                    <div className="w-1/2">
                        <label className="block mb-1 font-semibold">開始ページ</label>
                        <input
                        type="number"
                        value={task.startPage ?? ''}
                        onChange={e => handleChange('startPage', e.target.value === '' ? undefined : Number(e.target.value))}
                        className="w-full border p-3 rounded bg-yellow-50 dark:bg-gray-700 border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                        placeholder="例：1"
                        min="0"
                        />
                    </div>
                    <div className="w-1/2">
                        <label className="block mb-1 font-semibold">終了ページ</label>
                        <input
                        type="number"
                        value={task.endPage ?? ''}
                        onChange={e => handleChange('endPage', e.target.value === '' ? undefined : Number(e.target.value))}
                        className="w-full border p-3 rounded bg-yellow-50 dark:bg-gray-700 border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                        placeholder="例：10"
                        min="0"
                        />
                    </div>
                    </div>
                    <div className="flex gap-4">
                    <div className="w-1/2">
                        <label className="block mb-1 font-semibold">開始問題</label>
                        <input
                        type="number"
                        value={task.startQuestion ?? ''}
                        onChange={e => handleChange('startQuestion', e.target.value === '' ? undefined : Number(e.target.value))}
                        className="w-full border p-3 rounded bg-yellow-50 dark:bg-gray-700 border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                        placeholder="例：1"
                        min="0"
                        />
                    </div>
                    <div className="w-1/2">
                        <label className="block mb-1 font-semibold">終了問題</label>
                        <input
                        type="number"
                        value={task.endQuestion ?? ''}
                        onChange={e => handleChange('endQuestion', e.target.value === '' ? undefined : Number(e.target.value))}
                        className="w-full border p-3 rounded bg-yellow-50 dark:bg-gray-700 border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                        placeholder="例：20"
                        min="0"
                        />
                    </div>
                    </div>
                    <div>
                    <label className="block mb-1 font-semibold">小問数（任意）</label>
                    <input
                        type="number"
                        value={task.subQuestions ?? ''}
                        onChange={e => handleChange('subQuestions', e.target.value === '' ? undefined : Number(e.target.value))}
                        className="w-full border p-3 rounded bg-yellow-50 dark:bg-gray-700 border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                        placeholder="例：60"
                        min="0"
                    />
                    </div>
                </>
                )}

                {task.type === '単語帳' && (
                <div>
                    <label className="block mb-1 font-semibold">総単語数</label>
                    <input
                    type="number"
                    value={task.vocabCount ?? ''}
                    onChange={e => handleChange('vocabCount', e.target.value === '' ? undefined : Number(e.target.value))}
                    className="w-full border p-3 rounded bg-yellow-50 dark:bg-gray-700 border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                    placeholder="例：100"
                    min="0"
                    />
                </div>
                )}

                <div>
                <label className="block mb-1 font-semibold">期限</label>
                <input
                    type="date"
                    value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                    onChange={e => handleChange('dueDate', new Date(e.target.value))}
                    className="w-full border p-3 rounded bg-yellow-50 dark:bg-gray-700 border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                />
                </div>

                <div className="space-y-2">
                <label className="inline-flex items-center cursor-pointer">
                    <input
                    type="checkbox"
                    checked={task.notify}
                    onChange={e => handleChange('notify', e.target.checked)}
                    className="h-5 w-5 text-yellow-500 rounded focus:ring-yellow-400"
                    />
                    <span className="ml-2 text-gray-800 dark:text-gray-200">通知を有効にする</span>
                </label>
                {task.notify && (
                    <input
                    type="datetime-local"
                    value={task.notifyTime ? new Date(task.notifyTime).toISOString().slice(0, 16) : ''}
                    onChange={e => handleChange('notifyTime', new Date(e.target.value))}
                    className="w-full border p-3 rounded bg-yellow-50 dark:bg-gray-700 border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                    />
                )}
                </div>

                <div>
                <label className="block mb-1 font-semibold">現在のステータス</label>
                <select
                    value={task.status}
                    onChange={e => handleChange('status', e.target.value as StatusType)}
                    className="w-full border p-3 rounded bg-yellow-50 dark:bg-gray-700 border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                >
                    <option value="todo">未着手</option>
                    <option value="doing">進行中</option>
                    <option value="done">完了</option>
                </select>
                </div>

                <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded transition shadow-md hover:shadow-lg"
                >
                タスク情報を保存
                </button>
            </form>

            {/* Progress Update Section */}
            <div className="space-y-6 border-b pb-6 mb-6 border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">進捗状況</h2>
                {task.type === '問題集' ? (
                <>
                    <div className="space-y-4">
                    <div>
                        <label className="block mb-1 font-semibold">完了ページ数</label>
                        <input
                        type="number"
                        value={task.completedPages ?? ''}
                        onChange={e => handleChange('completedPages', e.target.value === '' ? 0 : Number(e.target.value))}
                        className="w-full border p-3 rounded bg-yellow-50 dark:bg-gray-700 border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                        placeholder={`現在の進捗: ${task.completedPages || 0} / ${ (Number(task.endPage) - Number(task.startPage) + 1) > 0 ? (Number(task.endPage) - Number(task.startPage) + 1) : 0} ページ`}
                        min="0"
                        max={ (Number(task.endPage) - Number(task.startPage) + 1) > 0 ? (Number(task.endPage) - Number(task.startPage) + 1) : 0}
                        />
                    </div>
                    {totalQuestionsArray.length > 0 && (
                        <div>
                        <label className="block mb-3 font-semibold">完了した問題番号</label>
                        <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 p-2 dark:border-gray-700 rounded-lg dark:bg-gray-700 select-none">
                            {totalQuestionsArray.map((qNum) => (
                            <div
                                key={qNum}
                                className="flex items-center justify-center"
                                onMouseDown={() => handleQuestionMouseDown(qNum)}
                                onMouseEnter={() => handleQuestionMouseEnter(qNum)}
                            >
                                <input
                                type="checkbox"
                                id={`q-${qNum}`}
                                checked={task.completedQuestionsList.includes(qNum)}
                                onChange={() => {}}
                                className="hidden"
                                />
                                <label
                                htmlFor={`q-${qNum}`}
                                className={`w-20 h-10 flex items-center justify-center rounded cursor-pointer text-sm font-semibold transition-all duration-200
                                    ${task.completedQuestionsList.includes(qNum)
                                    ? 'bg-yellow-500 text-white shadow-md'
                                    : 'bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                                    }`
                                }
                                title={`問題 ${qNum}`}
                                >
                                {qNum}
                                </label>
                            </div>
                            ))}
                        </div>
                        {totalQuestionsArray.length === 0 && (
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">総問題数が設定されていません。</p>
                        )}
                        </div>
                    )}
                    </div>
                </>
                ) : (
                <div>
                    <label className="block mb-1 font-semibold">完了単語数</label>
                    <input
                    type="number"
                    value={task.completedVocab ?? ''}
                    onChange={e => handleChange('completedVocab', e.target.value === '' ? 0 : Number(e.target.value))}
                    className="w-full border p-3 rounded bg-yellow-50 dark:bg-gray-700 border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                    placeholder={`現在の進捗: ${task.completedVocab || 0} / ${task.vocabCount || 0} 単語`}
                    min="0"
                    max={task.vocabCount || 0}
                    />
                </div>
                )}
                <button
                type="button"
                onClick={handleSaveProgressAndStatus}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded transition shadow-md hover:shadow-lg"
                >
                進捗を保存
                </button>
            </div>

            {/* Tag Section */}
            <div className="space-y-4 border-b pb-6 mb-6 border-gray-200 dark:border-gray-700">
                <h2 className="2xl font-semibold text-gray-800 dark:text-white">タグ</h2>
                <div className="flex mb-3">
                <input
                    type="text"
                    value={newTagInput}
                    onChange={e => setNewTagInput(e.target.value)}
                    className="flex-grow border p-2 rounded-l bg-yellow-50 dark:bg-gray-700 border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                    placeholder="タグ名を入力 (例: #重要, #試験対策)"
                    onKeyPress={e => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                    }
                    }}
                />
                <button
                    type="button"
                    onClick={handleAddTag}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-r flex items-center justify-center transition"
                >
                    ＋
                </button>
                </div>
                {task.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2">
                    {task.tags.map((tag, index) => (
                    <span
                        key={index}
                        className="inline-flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full shadow-sm dark:bg-blue-900 dark:text-blue-200"
                    >
                        #{tag}
                        <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100 transition"
                        aria-label={`${tag} タグを削除`}
                        >
                        ×
                        </button>
                    </span>
                    ))}
                </div>
                ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">タグはまだありません。</p>
                )}
            </div>

            {/* Delete Task Button */}
            <div className="flex justify-center items-center">
                <div className="mt-8 mr-10 text-center">
                    <button
                    type="button"
                    onClick={() => navigate('/tasks')}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded transition shadow-md hover:shadow-lg flex items-center justify-center mx-auto"
                    >
                    完了
                    </button>
                </div>
                <div className="mt-8 text-center">
                    <button
                    type="button"
                    onClick={handleDeleteTask}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded transition shadow-md hover:shadow-lg flex items-center justify-center mx-auto"
                    >
                    タスクを削除
                    </button>
                </div>
                
            </div>
            </div>
        </div>

        {notification && (
            <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
            />
        )}
        </main>
    );
};

export default EditTask;