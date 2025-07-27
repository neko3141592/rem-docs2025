import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase'; 
import TopBar from '../components/TopBar';
import { useNavigate } from 'react-router-dom';

type LoginErrors = {
    email?: string;
    password?: string;
};

const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<LoginErrors>({});
    const [firebaseError, setFirebaseError] = useState('');
    const navigate = useNavigate();

    const validate = () => {
        const newErrors: LoginErrors = {};
        if (!email) {
            newErrors.email = 'メールアドレスを入力してください';
        } else if (!/^[\w\-.]+@[\w\-.]+\.[a-zA-Z]{2,}$/.test(email)) {
            newErrors.email = '有効なメールアドレスを入力してください';
        }
        if (!password) {
            newErrors.password = 'パスワードを入力してください';
        } else if (password.length < 6) {
            newErrors.password = 'パスワードは6文字以上で入力してください';
        }
        return newErrors;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFirebaseError('');
        const validationErrors = validate();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length === 0) {
            try {
                await signInWithEmailAndPassword(auth, email, password);
                navigate(`/user/${auth.currentUser.uid}`);
            } catch (error) {
                setFirebaseError('メールアドレスまたはパスワードが正しくありません');
                console.error("Firebase authentication error:", error);
            }
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center font-default">
            <TopBar />
            <div className="w-full max-w-md bg-white rounded-xl p-8 ">
                <h1 className="text-3xl font-bold text-center mb-8 text-yellow-700 tracking-tight">Rem-Docsへログイン</h1>
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
                                errors.password
                                    ? 'border-red-400 focus:ring-red-300'
                                    : 'border-yellow-300 focus:ring-yellow-400'
                            }`}
                            type="password"
                            placeholder="パスワード"
                            autoComplete="current-password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                        )}
                    </div>
                    {firebaseError && (
                        <p className="text-red-500 text-xs text-center">{firebaseError}</p>
                    )}
                    <button
                        type="submit"
                        className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded font-semibold transition"
                    >
                        ログイン
                    </button>
                </form>
                <div className="text-center text-sm text-yellow-700 mt-6 font-default">
                    アカウントをお持ちでない方は <a href="/register" className="text-yellow-500 hover:underline">新規登録</a>
                </div>
            </div>
        </main>
    );
};

export default Login;