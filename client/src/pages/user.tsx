import NavBar from "../components/NavBar";
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import logo from '../assets/logo.png';
import { auth } from '../firebase';
import CountUp from 'react-countup';
import ReactMarkdown from 'react-markdown';
import Loading from '../components/Loading';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

type Tab = {
    key: string;
    label: string;
};

type ProgressData = {
    title: string;
    height: string;
    segments: {
        label: string;
        value: number;
        color: string;
    }[];
};

const User = () => {
    const { userId } = useParams();
    const [userName, setUserName] = useState('');
    const [bio, setBio] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userAuth, setUserAuth] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [animatedData, setAnimatedData] = useState<ProgressData[]>([]);

    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) return;
            const db = getFirestore();
            try {
                const userDoc = await getDoc(doc(db, 'users', userId));
                const userProfile = await getDoc(doc(db, 'users', userId, 'profile', 'main'));
                const userAuth = await getDoc(doc(db, 'users', userId, 'auth', 'main'));
                if (userDoc.exists() && userProfile.exists() && userAuth.exists()) {
                    setUserName(userDoc.data().displayName || '名無し');
                    setBio(userDoc.data()?.bio || '');
                    setIsPublic(userProfile.data()?.isPublic || false);
                    setUserAuth(userAuth.data() || false);
                } else {
                    setUserName('不明なユーザー');                                        
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [userId]);

    const tabs: Tab[] = [
        { key: 'overview', label: '概要' },
        { key: 'chart', label: '統計' },
    ];

    const progressData: ProgressData[] = [
        {
            title: '成功率',
            height: 'h-14',
            segments: [
                { label: '成功', value: 67, color: 'bg-green-400' },
                { label: '失敗', value: 13, color: 'bg-red-400' },
                { label: '保留', value: 20, color: 'bg-yellow-400' },
            ],
        },
        {
            title: '学習進捗',
            height: 'h-14',
            segments: [
                { label: '数学', value: 40, color: 'bg-blue-400' },
                { label: '英語', value: 35, color: 'bg-purple-400' },
                { label: 'その他', value: 25, color: 'bg-gray-400' },
            ],
        },
    ];

    useEffect(() => {
        if (activeTab === 'chart') {
            const timer = setTimeout(() => {
                setAnimatedData(progressData);
            }, 200);
            return () => clearTimeout(timer);
        } else {
            setAnimatedData([]);
        }
    }, [activeTab]);

    if (loading) {
        return (
            <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                <NavBar />
                <div className="flex items-center justify-center min-h-screen">
                    <Loading />
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <NavBar />
            <div className="container mx-auto px-6 pt-32 flex flex-col md:flex-row items-center gap-10">
                <div className="flex-shrink-0">
                    <img
                        src={auth.currentUser?.photoURL || logo}
                        alt="Rem-Docsイメージ"
                        className="w-36 h-36 md:w-64 md:h-64 object-contain"
                    />
                </div>
                <div className="text-center md:text-left">
                    <h1 className="text-5xl font-bold mb-2">{userName}</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">
                        {isPublic ? '公開' : '非公開'}プロフィール/
                        {userAuth?.teacher ? '指導者' : '学習者'}
                    </p>
                </div>
            </div>
            <div className="container mx-auto px-6">
                <div className="mt-12">
                    {/* タブボタン */}
                    <div className="flex border-b border-gray-300 dark:border-gray-600">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`py-3 px-6 text-lg font-semibold transition-colors duration-200 ${
                                    activeTab === tab.key
                                        ? 'border-b-4 border-yellow-400 text-yellow-500 dark:text-yellow-400'
                                        : 'text-gray-500 hover:text-yellow-400 dark:text-gray-400 dark:hover:text-yellow-300'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* タブ中身 */}
                    <div className="mt-6 p-6 rounded-xl">
                        {activeTab === 'overview' && (
                            <div className="text-gray-600 dark:text-gray-200 profile-markdown">
                                <ReactMarkdown
                                    components={{
                                        code({node, inline, className, children, ...props}) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        return !inline && match ? (
                                            <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" {...props}>
                                            {String(children).replace(/\n$/, '')}
                                            </SyntaxHighlighter>
                                        ) : (
                                            <code className={className} {...props}>{children}</code>
                                        );
                                        }
                                    }}
                                >
                                    {bio}
                                </ReactMarkdown>
                            </div>
                        )}
                        {activeTab === 'chart' && (
                            <div className="md:flex">
                                <div className="md:w-1/4">
                                    <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">作成タスク数</h2>
                                    <CountUp end={30} duration={2} suffix="" className="h-full text-8xl text-center flex justify-center items-center" />
                                </div>
                                <div className="space-y-10 md:w-3/4 mt-10 md:mt-0">
                                    {animatedData.map((data, i) => (
                                        <div key={i}>
                                            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">{data.title}</h2>
                                            <div className={`relative w-full ${data.height} bg-gray-200 rounded overflow-hidden shadow flex`}>
                                                {data.segments.map((seg, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`${seg.color} h-full flex items-center justify-center text-white text-sm font-semibold transition-all duration-1000 ease-out`}
                                                        style={{ width: `${seg.value}%` }}
                                                    >
                                                        <CountUp end={seg.value} duration={2} suffix="%" className="text-xl" />
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-2 flex flex-wrap gap-4 text-sm">
                                                {data.segments.map((seg, idx) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <div className={`w-5 h-5 rounded ${seg.color}`} />
                                                        <span className="text-gray-700 dark:text-gray-300">{seg.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default User;
