import React, { useContext, useState, useEffect, useMemo } from 'react';
import { AuthContext } from '../AuthContext';
import NavBar from '../components/NavBar';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

import Loading from '../components/Loading';

import ReactMarkdown from 'react-markdown';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import 'simplemde/dist/simplemde.min.css';

const SETTINGS_TABS = [
    { key: 'profile', label: 'プロフィール' },
    { key: 'notifications', label: '通知' },
    { key: 'account', label: 'アカウント' }
];

const Settings = () => {
    const userState = useContext(AuthContext);
    const user = userState?.user;
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);

    // プロフィール編集用
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [editSuccess, setEditSuccess] = useState('');
    const [editError, setEditError] = useState('');

    useEffect(() => {
        const getUserProfile = async () => {
            if (!user) return;
            const userDoc = doc(db, 'users', user.uid);
            try {
                const userSnapshot = await getDoc(userDoc);
                setLoading(false);
                if (userSnapshot.exists()) {
                    const userData = userSnapshot.data();
                    setDisplayName(userData.displayName || '');
                    setBio(userData.bio || '');
                }
            } catch (error) {
                setLoading(false);
                console.error('ユーザープロフィールの取得に失敗:', error);
            }
        };
        if (user) {
            setDisplayName(user.displayName || '');
            setBio(user.bio || '');
            getUserProfile();
        }
    }, [user]);

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setEditSuccess('');
        setEditError('');
        if (!user) return;
        try {
            await updateDoc(doc(db, "users", user.uid), {
                displayName,
                bio,
            });
            setEditSuccess('プロフィールを更新しました！');
        } catch (err) {
            setEditError('プロフィールの更新に失敗しました');
        }
    };

    const simpleMDEOptions = useMemo(() => ({
        spellChecker: false,
        placeholder: "自己紹介をMarkdownで入力できます",
    }), []);

    if (loading) {
        return (
            <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
                <NavBar />
                <div className="flex items-center justify-center min-h-screen">
                    <Loading />
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
            <NavBar />
            <div className="p-6 pt-28 container mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">設定</h1>
                <div className="flex border-b border-gray-300 dark:border-gray-600 space-x-4 mb-6 overflow-x-auto whitespace-nowrap">
                    {SETTINGS_TABS.map(tab => (
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
                <div className="bg-white dark:bg-gray-900 rounded-xl p-8 mb-8">
                    {!user ? (
                        <p className="text-gray-400 py-12 text-xl">ログインしていません。</p>
                    ) : (
                        <>
                            {activeTab === 'profile' && (
                                <form className="space-y-8 " onSubmit={handleProfileSave}>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-300 via-yellow-500 to-yellow-700 dark:from-yellow-700 dark:via-yellow-500 dark:to-yellow-300 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                            {displayName ? displayName[0] : user.email[0]}
                                        </div>
                                        <div>
                                            <div className="text-3xl font-bold text-gray-900 dark:text-white">{displayName || '表示名未設定'}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-2">表示名</label>
                                        <input
                                            type="text"
                                            className="border-none outline-none w-60 bg-gray-100 dark:bg-gray-800 p-4 rounded-xl w-full text-lg shadow focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500 transition"
                                            value={displayName}
                                            onChange={e => setDisplayName(e.target.value)}
                                            maxLength={20}
                                            required
                                            placeholder="表示名を入力"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-2">自己紹介（Markdown形式）</label>
                                        <SimpleMDE
                                            value={bio}
                                            onChange={setBio}
                                            options={simpleMDEOptions}
                                        />
                                        <div className="mt-4 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 shadow text-base">
                                            <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2 ">プレビュー</div>
                                            <div className="prose prose-sm dark:prose-invert max-w-none profile-markdown">
                                                <ReactMarkdown>{bio}</ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-6 mt-4">
                                        <div>
                                            <span className="font-semibold text-gray-700 dark:text-gray-300">ユーザーID: </span>
                                            <span className="text-gray-900 dark:text-white">{user.uid}</span>
                                        </div>
                                    </div>
                                    {editSuccess && <p className="text-green-600 text-sm mt-2">{editSuccess}</p>}
                                    {editError && <p className="text-red-500 text-sm mt-2">{editError}</p>}
                                    <button
                                        type="submit"
                                        className="w-full bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-500 text-white py-3 rounded-xl font-bold text-lg shadow transition"
                                    >
                                        プロフィールを保存
                                    </button>
                                </form>
                            )}
                            {activeTab === 'notifications' && (
                                <div className="space-y-6 max-w-lg">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-gray-700 dark:text-gray-300 text-lg">通知設定</span>
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="form-checkbox h-6 w-6 text-yellow-500" defaultChecked />
                                            <span className="ml-3 text-gray-700 dark:text-gray-300 text-base">通知を受け取る</span>
                                        </label>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'account' && (
                                <div className="space-y-8 max-w-lg">
                                    <div className="flex flex-col items-start">
                                        <span className="font-semibold text-gray-700 dark:text-gray-300 text-lg mb-4">アカウント操作</span>
                                        <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold shadow transition">退会する</button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}

export default Settings;