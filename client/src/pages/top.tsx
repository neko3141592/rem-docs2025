import React from 'react';
import logo from '../assets/logo.png';
import TopBar from '../components/TopBar';

const Top = () => (
    <main className="flex items-center justify-center font-default">
        <TopBar />
        <div className="container mx-auto py-32 px-4">
            <div className="bg-white rounded-3xl p-12 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12 my-40 sm:my-64">
                {/* テキスト・ボタン */}
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-5xl sm:text-7xl font-extrabold mb-6 tracking-tight text-gray-900">
                        <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                            Rem-Docs
                        </span>
                    </h1>
                    <p className="text-xl mb-10 text-yellow-800 font-medium">
                        タスク管理を、もっとスマートに。<br />
                        シンプル＆美しいUIで、あなたの毎日をサポートします。
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 mt-8">
                        <a
                            href="/register"
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-10 py-3 rounded-full font-bold transition border-2 border-yellow-500 text-lg"
                        >
                            はじめる
                        </a>
                        <a
                            href="/login"
                            className="bg-white hover:bg-yellow-100 text-yellow-700 px-10 py-3 rounded-full font-bold border-2 border-yellow-500 text-lg transition"
                        >
                            ログイン
                        </a>
                    </div>
                </div>
                {/* 画像スペース */}
                <div className="flex-1 flex items-center justify-center">
                    <img
                        src={logo}
                        alt="Rem-Docsイメージ"
                        className="w-64 h-64 object-contain rounded-2xl "
                    />
                </div>
            </div>

            {/* Rem-Docsの紹介セクション */}
            <section className="mt-20 max-w-4xl mx-auto">
                <h2 className="text-4xl sm:text-5xl font-bold text-yellow-700 mb-10 text-center">Rem-Docsの特徴</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="bg-yellow-50 rounded-xl p-8 border border-yellow-100 shadow-xl">
                        <h3 className="text-2xl font-semibold text-yellow-800 mb-2">直感的な操作性</h3>
                        <p className="text-yellow-900 text-xl">
                            Rem-DocsはシンプルなUIで、誰でもすぐに使いこなせます。タスクの追加・編集・削除が直感的に行え、日々の業務効率を向上させます。
                        </p>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-8 border border-yellow-100 shadow-xl">
                        <h3 className="text-2xl font-semibold text-yellow-800 mb-2">マルチデバイス対応</h3>
                        <p className="text-yellow-900 text-xl">
                            PC・スマートフォン・タブレットなど、どのデバイスからでも快適にアクセス可能。外出先でもタスク管理ができます。
                        </p>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-8 border border-yellow-100 shadow-xl">
                        <h3 className="text-2xl font-semibold text-yellow-800 mb-2">カスタマイズ性</h3>
                        <p className="text-yellow-900 text-xl">
                            タグやカラー、優先度設定など、自分好みにタスクを整理できます。あなたのワークスタイルに合わせて柔軟にカスタマイズ可能です。
                        </p>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-8 border border-yellow-100 shadow-xl">
                        <h3 className="text-2xl font-semibold text-yellow-800 mb-2">安全なデータ管理</h3>
                        <p className="text-yellow-900 text-xl">
                            あなたのタスクデータは安全に保存され、プライバシーも守られます。安心してご利用いただけます。
                        </p>
                    </div>
                </div>
                <div className="mt-16 text-center">
                    <h3 className="text-2xl font-bold text-yellow-700 mb-4">Rem-Docsで、あなたの毎日をもっと快適に。</h3>
                    <p className="text-yellow-900 text-lg">
                        今すぐ無料で始めて、タスク管理の新しい体験を手に入れましょう！
                    </p>
                </div>
            </section>

            <div className="mt-16 text-center text-yellow-400 text-sm">
                &copy; 2025 Rem-Docs. All rights reserved.
            </div>
        </div>
    </main>
);

export default Top;