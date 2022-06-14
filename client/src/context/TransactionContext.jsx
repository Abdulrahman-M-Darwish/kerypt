import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constant";

export const TransactionContext = React.createContext();

const { ethereum } = window;

const createEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );
  return transactionContract;
};

export const TransactionProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });
  const [currentAccount, setCurrentAccount] = useState([]);
  const [isloading, setIsloading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(
    localStorage.getItem("transactionCount")
  );
  const [transactions, setTransactions] = useState([]);
  const handelChange = (e, name) => {
    setFormData((prev) => ({ ...prev, [name]: e.target.value }));
  };
  const getAllTransactions = async () => {
    if (!ethereum) return alert("Install metamask");
    const transactionContract = createEthereumContract();
    const availableTransactions =
      await transactionContract.getAllTransactions();
    const structuredTransactions = availableTransactions.map((transaction) => ({
      addressTo: transaction.reciver,
      addressFrom: transaction.sender,
      timestamp: new Date(
        transaction.timestamp.toNumber() * 1000
      ).toLocaleString(),
      message: transaction.message,
      keyword: transaction.keyword,
      amount: parseInt(transaction.amount._hex) / 10 ** 18,
    }));
    setTransactions(structuredTransactions);
  };
  const walletChecker = async () => {
    if (!ethereum) return alert("Install metamask");
    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length) {
      setCurrentAccount(accounts[0]);
      getAllTransactions();
    } else {
      console.log("no accounts fuck off");
    }
  };
  const checkIfTransactionsExists = async () => {
    if (ethereum) {
      const transactionsContract = createEthereumContract();
      const currentTransactionCount =
        await transactionsContract.getTransactionsCount();
      window.localStorage.setItem("transactionCount", currentTransactionCount);
    }
  };
  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Install metamask");
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      throw new Error("no etherum object");
    }
  };
  const sendTransaction = async () => {
    if (!ethereum) alert("Install metamask");
    const { addressTo, amount, keyword, message } = formData;
    const transactionContract = createEthereumContract();
    const parsedValue = ethers.utils.parseEther(amount);
    await ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: currentAccount,
          to: addressTo,
          gas: "0x5208",
          value: parsedValue._hex,
        },
      ],
    });
    const transactionHash = await transactionContract.addToBlockchain(
      addressTo,
      parsedValue,
      message,
      keyword
    );
    setIsloading(true);
    await transactionHash.wait();
    setIsloading(false);
    const transactionCount = await transactionContract.getTransactionCount();
    setTransactionCount(transactionCount);
    window.reload();
  };
  useEffect(() => {
    walletChecker();
    checkIfTransactionsExists();
  }, [transactionCount]);
  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        currentAccount,
        formData,
        sendTransaction,
        handelChange,
        transactions,
        isloading,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
