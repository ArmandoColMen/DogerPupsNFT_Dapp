import './App.css';
import { getProviderOrSigner } from './helpers/walletProvider';
import Web3Modal from "web3modal";
import { Contract, ethers } from "ethers";
import { useEffect, useRef, useState } from "react";
import {DOGERINU_CONTRACT_ADDRESS, DOGERPUPSNFT_CONTRACT_ADDRESS, dogerInuAbi} from './helpers/constants';
import GridItem from './components/GridItem';
import {Toaster, toast} from 'react-hot-toast'

function App() {

  const [walletConnected, setWalletConnected] = useState(false);
  const [allowance, setAllowance] = useState("");
  const [approvalLoading,setApprovalLoading] = useState(false);

  const web3ModalRef = useRef();
  const maxNfts = 10;

  const handleConnect = async () => {
    try {
      const theSigner = await getProviderOrSigner(true, web3ModalRef);
      const currentWalletAddress = await theSigner.getAddress();

      setWalletConnected(true);
      getAllowance(currentWalletAddress);
    } catch (err) {
      console.error(err);
    }
  }

  const handleDisconnect = () => {
    setWalletConnected(false);
  }

  const getAllowance = async (address) => {
    try {
      const provider = await getProviderOrSigner(false, web3ModalRef);
      const tokenContract = new Contract(
        DOGERINU_CONTRACT_ADDRESS,
        dogerInuAbi,
        provider
      );

      const _allowanceBalance =
        await tokenContract.allowance(address.toString(), DOGERPUPSNFT_CONTRACT_ADDRESS.toString());
      setAllowance(ethers.utils.formatEther(_allowanceBalance.toString()));
    } catch (err) {
      console.error(err);
    }
  }

  const handleApprove = async (e) => {
    e.preventDefault();
    try {
      const signer = await getProviderOrSigner(true, web3ModalRef);
      const approvalAmount = ethers.utils.parseEther("200", 18);
      const currentAddress = await signer.getAddress();
      
      const tokenContract = new Contract(
        DOGERINU_CONTRACT_ADDRESS,
        dogerInuAbi,
        signer
      );

      const approvalStatus = await tokenContract.approve(DOGERPUPSNFT_CONTRACT_ADDRESS, approvalAmount);
      setApprovalLoading(true);
      await approvalStatus.wait();
      setApprovalLoading(false);
      toast.success("Approved! you can mint now!");
      getAllowance(currentAddress);
    } catch (err) {
      if(err.code.toString() === "ACTION_REJECTED"){
        toast.error("User rejected transaction");
      } else {
        toast.error("Approval failed, kindly make sure you have enough Doger Inu in your wallet and ETH to pay for gas.");
      }
    }
  }

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "sepolia",
        providerOptions: {},
        disableInjectedProvider: false,
      });
    }
  }, [walletConnected]);

  return (
    <div className="App">
      <Toaster/>
      <header className="App-header">
        <h2>Doger Pups NFTs</h2>
        {walletConnected ? (
          <>
          <h4 style={{'margin':'10px 0px'}}>Price: 1 DGI</h4>
          <button className='button disconnect' onClick={(e) => handleDisconnect(e)}>Disconnect</button>
          {parseInt(allowance) <= 0 ? (
            <>
            <div className='approveDescription'>
              <p>Approve the NFT contract for processing minting {' '}
              <button onClick={(e) => handleApprove(e)} className='button'>{approvalLoading ? 'approving...' : 'approve'}</button></p>
            </div>
            </>
          ) : ''}
          <div className='gridWrapper'>
            {Array(maxNfts).fill().map((v, i) => {
              return (
                <>
                  <GridItem key={i} tokenId={parseInt(i+1)} allowance={parseInt(allowance)} web3ModalRef={web3ModalRef}/>
                </>
              )
            })}
          </div>
          </>
        ) : (
          <>
            <p>Please connect you wallet</p>
            <button className='button' onClick={(e) => handleConnect(e)}>Connect wallet</button>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
