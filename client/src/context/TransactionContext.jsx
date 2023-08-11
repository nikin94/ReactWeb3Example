import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers'

import { contractABI, contractAddress } from '../utils/constants'

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum)
  const signer = provider.getSigner()
  const transactionContract = new ethers.Contract(contractAddress, contractABI, signer)

  return transactionContract
}

export const TransactionProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState('')
  const [formData, setFormData] = useState({ addressTo: '', amount: '', keyword: '', message: '' })
  const [loading, setLoading] = useState()
  const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'))
  const [transactions, setTransactions] = useState([])

  const handleChange = (e, name) => {
    setFormData((prevState) => ({ ...prevState, [name]: e.target.value }))
  }

  const getAllTransactions = async () => {
    try {
      if(!ethereum) return alert('Please install Metamask')
      const transactionContract = getEthereumContract()
      
      const availableTransactions = await transactionContract.getAllTransactions()

      const structuredTransactions = availableTransactions.map(t => ({
        addressTo: t.receiver,
        addressFrom: t.sender,
        timestamp: new Date(t.timestamp.toNumber() * 1000).toLocaleString(),
        message: t.message,
        keyword: t.keyword,
        amount: parseInt(t.amount._hex) / (10 ** 18)
      }))

      setTransactions(structuredTransactions)

    } catch (error) {
      console.log(error)
    }
  }

  const checkIfWalletIsConnected = async () => {
    try {
      if(!ethereum) return alert('Please install Metamask')
  
      const accounts = await ethereum.request({ method: 'eth_accounts' })
  
      if(accounts.length) {
        setCurrentAccount(accounts[0])
      
        getAllTransactions()
      } else {
        console.log('no accounts found')
      }
    } catch (error) {
      console.log(error)
      throw new Error('no eth obj')
    }

  }

  const checkIfTransactionExist = async () => {
    try {
      const transactionContract = getEthereumContract()
      const transactionCount = await transactionContract.getTransactionCount()
      
      window.localStorage.setItem('transactionCount', transactionCount)
    } catch (error) {
      console.log(error)
      throw new Error('no eth obj')
    }
  }

  const connectWallet = async () => {
    try {
      if(!ethereum) return alert('Please install Metamask')
      
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
    
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.log(error)
      throw new Error('no eth obj')
    }
  }

  const sendTransaction = async () => {
    try {
      if (!ethereum) return alert('Please install Metamask')

      const { addressTo, amount, keyword, message } = formData
      const transactionContract = getEthereumContract()
      const parsedAmount = ethers.utils.parseEther(amount)

      await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: currentAccount,
          to: addressTo,
          gas: '0x5208', // 21000 gwei
          value: parsedAmount._hex,
        }]
      })

      const transactionHash = await transactionContract.addToBlockchain(addressTo, parsedAmount, message, keyword)
      
      setLoading(true)
      console.log('loading - ' + transactionHash.hash)
      await transactionHash.wait()
      setLoading()
      console.log('success - ' + transactionHash.hash)

      const transactionCount = await transactionContract.getTransactionCount()

      setTransactionCount(transactionCount.toNumber())

      window.reload()
    } catch (error) {
      console.log(error)
      throw new Error('no eth obj')
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    checkIfTransactionExist();
  }, []);

  return (
    <TransactionContext.Provider value={{ connectWallet, sendTransaction, currentAccount, formData, setFormData, handleChange, transactions, loading }}>
      {children}
    </TransactionContext.Provider>
  )
}