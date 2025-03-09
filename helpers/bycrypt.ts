import CryptoJS from "crypto-js";
import dotenv from "dotenv";
dotenv.config();

const CRYPTO_SECRET_KEY = process.env.CRYPTO_SECRET_KEY!;

export const encryptPrivateKey = (privateKey: string) => {
  return CryptoJS.AES.encrypt(privateKey, CRYPTO_SECRET_KEY).toString();
};

export const decryptPrivateKey = (encryptedKey: string) => {
  const bytes = CryptoJS.AES.decrypt(encryptedKey, CRYPTO_SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};
