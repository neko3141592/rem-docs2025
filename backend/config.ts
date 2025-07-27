const secret = process.env.JWT_SECRET;
if (!secret) {
    console.log(secret);
    throw new Error("JWT_SECRETが環境変数に設定されていません");
}


export default {
    jwt: {
        secret, 
    }
}