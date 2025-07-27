import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from '../firebase';
import { doc, setDoc } from "firebase/firestore";
import TopBar from '../components/TopBar';

type RegisterErrors = {
    email?: string;
    displayName?: string;
    password?: string;
    confirmPassword?: string;
};

const Register = () => {
    const [email, setEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [theme, setTheme] = useState('light');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<RegisterErrors>({});
    const [firebaseError, setFirebaseError] = useState('');
    const [success, setSuccess] = useState(false);

    const validate = () => {
        const newErrors: RegisterErrors = {};
        if (!email) {
            newErrors.email = 'メールアドレスを入力してください';
        } else if (!/^[\w\-.]+@[\w\-.]+\.[a-zA-Z]{2,}$/.test(email)) {
            newErrors.email = '有効なメールアドレスを入力してください';
        }
        if (!displayName) {
            newErrors.displayName = '表示名を入力してください';
        }
        if (!password) {
            newErrors.password = 'パスワードを入力してください';
        } else if (password.length < 6) {
            newErrors.password = 'パスワードは6文字以上で入力してください';
        }
        if (!confirmPassword) {
            newErrors.confirmPassword = '確認用パスワードを入力してください';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'パスワードが一致しません';
        }
        return newErrors;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFirebaseError('');
        setSuccess(false);
        const validationErrors = validate();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length === 0) {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                // Firestoreにユーザー情報を保存（初期化）
                await setDoc(doc(db, "users", user.uid), {
                    email: user.email,
                    displayName,
                    theme,
                    createdAt: new Date(),
                });
                await setDoc(doc(db, "users", user.uid, "profile", "main"), {
                    bio:""
                });
                await setDoc(doc(db, "users", user.uid, "settings", "default"), {
                    theme: "light",
                    notifications: true,
                });
                await setDoc(doc(db, "users", user.uid, "auth", "main"), {
                    teacher: false,
                    admin: false,
                });
                setSuccess(true);
            } catch (error: any) {
                if (error.code === "auth/email-already-in-use") {
                    setFirebaseError('このメールアドレスは既に登録されています');
                } else {
                    setFirebaseError('登録に失敗しました');
                }
                console.error("Firebase register error:", error);
            }
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center font-default">
            <TopBar />
            <div className="w-full max-w-md bg-white rounded-xl p-8">
                <h1 className="text-3xl font-bold text-center mb-8 text-yellow-700 tracking-tight">Rem-Docs新規登録</h1>
                <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
                    <div>
                        <input
                            className={`border p-3 rounded w-full focus:outline-none focus:ring-2 transition bg-yellow-50 placeholder-yellow-400 ${
                                errors.email
                                    ? 'border-red-400 focus:ring-red-300'
                                    : 'border-yellow-300 focus:ring-yellow-400'
                            }`}
                            type="text"
                            placeholder="メールアドレス"
                            autoComplete="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                    </div>
                    <div>
                        <input
                            className={`border p-3 rounded w-full focus:outline-none focus:ring-2 transition bg-yellow-50 placeholder-yellow-400 ${
                                errors.displayName
                                    ? 'border-red-400 focus:ring-red-300'
                                    : 'border-yellow-300 focus:ring-yellow-400'
                            }`}
                            type="text"
                            placeholder="表示名"
                            value={displayName}
                            onChange={e => setDisplayName(e.target.value)}
                        />
                        {errors.displayName && (
                            <p className="text-red-500 text-xs mt-1">{errors.displayName}</p>
                        )}
                    </div>
                    {/* <div>
                        <select
                            title="テーマ選択"
                            className="border p-3 rounded w-full focus:outline-none focus:ring-2 transition bg-yellow-50 border-yellow-300 focus:ring-yellow-400"
                            value={theme}
                            onChange={e => setTheme(e.target.value)}
                        >
                            <option value="light">ライトテーマ</option>
                            <option value="dark">ダークテーマ</option>
                        </select>
                    </div> */}
                    <div>
                        <input
                            className={`border p-3 rounded w-full focus:outline-none focus:ring-2 transition bg-yellow-50 placeholder-yellow-400 ${
                                errors.password
                                    ? 'border-red-400 focus:ring-red-300'
                                    : 'border-yellow-300 focus:ring-yellow-400'
                            }`}
                            type="password"
                            placeholder="パスワード"
                            autoComplete="new-password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                        )}
                    </div>
                    <div>
                        <input
                            className={`border p-3 rounded w-full focus:outline-none focus:ring-2 transition bg-yellow-50 placeholder-yellow-400 ${
                                errors.confirmPassword
                                    ? 'border-red-400 focus:ring-red-300'
                                    : 'border-yellow-300 focus:ring-yellow-400'
                            }`}
                            type="password"
                            placeholder="パスワード（確認用）"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                        />
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                        )}
                    </div>
                    {firebaseError && (
                        <p className="text-red-500 text-xs text-center">{firebaseError}</p>
                    )}
                    {success && (
                        <p className="text-green-600 text-xs text-center">登録が完了しました！ログインしてください。</p>
                    )}
                    <button
                        type="submit"
                        className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded font-semibold transition"
                    >
                        新規登録
                    </button>
                </form>
                <div className="text-center text-sm text-yellow-700 mt-6 font-default">
                    アカウントをお持ちですか? <a href="/login" className="text-yellow-500 hover:underline">ログイン</a>
                </div>
            </div>
        </main>
    );
};

export default Register;