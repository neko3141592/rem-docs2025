// src/pages/addTask.jsx
import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import NavBar from '../components/NavBar';
import Notification from '../components/Notification';

type NotificationType = {
message: string;
type: 'success' | 'error';
};

const AddTask = () => {
    const [title, setTitle] = useState<string>('');
    const [type, setType] = useState<'問題集' | '単語帳'>('問題集');
    const [startPage, setStartPage] = useState<string>('');
    const [endPage, setEndPage] = useState<string>('');
    const [startQuestion, setStartQuestion] = useState<string>('');
    const [endQuestion, setEndQuestion] = useState<string>('');
    const [subQuestions, setSubQuestions] = useState<string>('');
    const [vocabCount, setVocabCount] = useState<string>('');
    const [dueDate, setDueDate] = useState<string>('');
    const [priority, setPriority] = useState<'高' | '中' | '低'>('中');
    const [notify, setNotify] = useState<boolean>(false);
    const [notifyTime, setNotifyTime] = useState<string>('');
    const [tags, setTags] = useState<string[]>([]);
    const [newTagInput, setNewTagInput] = useState<string>('');
    const [notification, setNotification] = useState<NotificationType | null>(null);

    const handleAddTag = () => {
        if (newTagInput.trim() !== '' && !tags.includes(newTagInput.trim())) {
        setTags([...tags, newTagInput.trim()]);
        setNewTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        const updatedTags = tags.filter(tag => tag !== tagToRemove);
        setTags(updatedTags);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!title || !dueDate) {
        setNotification({ message: 'タイトルと期限は必須です', type: 'error' });
        return;
        }

        try {
        await addDoc(collection(db, 'tasks'), {
            userId: auth.currentUser?.uid,
            title,
            type,
            status: 'todo',
            progress: 0,
            startPage: type === '問題集' && startPage !== '' ? Number(startPage) : null,
            endPage: type === '問題集' && endPage !== '' ? Number(endPage) : null,
            startQuestion: type === '問題集' && startQuestion !== '' ? Number(startQuestion) : null,
            endQuestion: type === '問題集' && endQuestion !== '' ? Number(endQuestion) : null,
            subQuestions: type === '問題集' && subQuestions ? Number(subQuestions) : null,
            vocabCount: type === '単語帳' ? Number(vocabCount) : null,
            priority,
            dueDate: new Date(dueDate),
            notify,
            notifyTime: notify ? new Date(notifyTime) : null,
            tags: tags,
            createdAt: serverTimestamp(),
            completedPages: null,
            completedQuestionsList: [],
            completedVocab: null
        });
        setTitle('');
        setType('問題集');
        setStartPage('');
        setEndPage('');
        setStartQuestion('');
        setEndQuestion('');
        setSubQuestions('');
        setVocabCount('');
        setDueDate('');
        setPriority('中');
        setNotify(false);
        setNotifyTime('');
        setTags([]);
        setNewTagInput('');
        setNotification({ message: 'タスクを追加しました！', type: 'success' });
        } catch (err) {
        console.error(err);
        setNotification({ message: '登録に失敗しました', type: 'error' });
        }
    };

    return (
        <main className="min-h-screen font-default flex justify-center items-center dark:bg-gray-900 text-gray-900 dark:text-white">
        <NavBar />
        <div className="container mx-auto p-6 mt-24">
            <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <h1 className="text-3xl font-bold mb-6 text-yellow-600 dark:text-yellow-400">タスクを追加</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                <label className="block mb-1 font-semibold">タイトル</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border p-3 rounded bg-yellow-50 dark:bg-gray-700 border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                    placeholder="例：第3章 練習問題"
                />
                </div>

                <div>
                <label className="block mb-1 font-semibold">タスクのタイプ</label>
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value as '問題集' | '単語帳')}
                    className="w-full border p-3 rounded bg-yellow-50 dark:bg-gray-700 border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                >
                    <option value="問題集">問題集</option>
                    <option value="単語帳">単語帳</option>
                </select>
                </div>

                <div>
                <label className="block mb-1 font-semibold">優先度</label>
                <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as '高' | '中' | '低')}
                    className="w-full border p-3 rounded bg-yellow-50 dark:bg-gray-700 border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                >
                    <option value="高">高</option>
                    <option value="中">中</option>
                    <option value="低">低</option>
                </select>
                </div>

                {type === '問題集' && (
                <>
                    <div className="flex gap-4">
                    <div className="w-1/2">
                        <label className="block mb-1 font-semibold">開始ページ</label>
                        <input
                        type="number"
                        value={startPage}
                        onChange={(e) => setStartPage(e.target.value)}
                        className="w-full border p-3 rounded bg-yellow-50 dark:bg-gray-700 border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                        placeholder="例：1"
                        min="0"
                        />
                    </div>
                    <div className="w-1/2">
                        <label className="block mb-1 font-semibold">終了ページ</label>
                        <input
                        type="number"
                        value={endPage}
                        onChange={(e) => setEndPage(e.target.value)}
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
                        value={startQuestion}
                        onChange={(e) => setStartQuestion(e.target.value)}
                        className="w-full border p-3 rounded bg-yellow-50 dark:bg-gray-700 border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                        placeholder="例：1"
                        min="0"
                        />
                    </div>
                    <div className="w-1/2">
                        <label className="block mb-1 font-semibold">終了問題</label>
                        <input
                        type="number"
                        value={endQuestion}
                        onChange={(e) => setEndQuestion(e.target.value)}
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
                        value={subQuestions}
                        onChange={(e) => setSubQuestions(e.target.value)}
                        className="w-full border p-3 rounded bg-yellow-50 dark:bg-gray-700 border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                        placeholder="例：60"
                        min="0"
                    />
                    </div>
                </>
                )}

                {type === '単語帳' && (
                <div>
                    <label className="block mb-1 font-semibold">単語数</label>
                    <input
                    type="number"
                    value={vocabCount}
                    onChange={(e) => setVocabCount(e.target.value)}
                    className="w-full border p-3 rounded bg-yellow-50 dark:bg-gray-700 border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                    placeholder="例：100"
                    min="0"
                    />
                </div>
                )}

                <div className="border border-yellow-200 dark:border-gray-600 rounded-lg p-4">
                <label className="block mb-2 font-semibold">タグ</label>
                <div className="flex mb-3">
                    <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    className="flex-grow border p-2 rounded-l bg-yellow-50 dark:bg-gray-700 border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                    placeholder="タグ名を入力 (例: 重要, 試験対策)"
                    onKeyPress={(e) => {
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
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2">
                    {tags.map((tag, index) => (
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
                )}
                {tags.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">タグはまだありません。</p>
                )}
                </div>

                <div>
                <label className="block mb-1 font-semibold">期限</label>
                <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full border p-3 rounded bg-yellow-50 dark:bg-gray-700 border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                />
                </div>

                <div className="space-y-2">
                <label className="inline-flex items-center cursor-pointer">
                    <input
                    type="checkbox"
                    checked={notify}
                    onChange={(e) => setNotify(e.target.checked)}
                    className="h-5 w-5 text-yellow-500 rounded focus:ring-yellow-400"
                    />
                    <span className="ml-2 text-gray-800 dark:text-gray-200">通知を有効にする</span>
                </label>
                {notify && (
                    <input
                    type="datetime-local"
                    value={notifyTime}
                    onChange={(e) => setNotifyTime(e.target.value)}
                    className="w-full border p-3 rounded bg-yellow-50 dark:bg-gray-700 border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                    />
                )}
                </div>

                <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded transition shadow-md hover:shadow-lg"
                >
                タスクを追加
                </button>
            </form>
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

export default AddTask;