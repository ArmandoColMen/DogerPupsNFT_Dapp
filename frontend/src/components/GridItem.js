import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Contract } from "ethers";
import { DOGERPUPSNFT_CONTRACT_ADDRESS, dogerPupsNFTAbi } from '../helpers/constants';
import { toast } from 'react-hot-toast';
import { getProviderOrSigner } from '../helpers/walletProvider';

function GridItem({ tokenId, allowance, web3ModalRef }) {

  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [owner, setOwner] = useState("");
  const [loading, setLoading] = useState(false);
  const [minting, setMinting] = useState(false);

  const jsonIpfsUrl = "https://ipfs.io/ipfs/QmdMVVSzy2zALppnMPcDEH9mTwys2zJpJDHdpYqGe3YKdW/";

  useEffect(() => {
    if (tokenId) {
      getNFTData(tokenId);
      getOwnerOf(tokenId);
    }
  }, [])

  const getNFTData = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(jsonIpfsUrl + id + '.json');
      const jsonData = res.data;
      setName(jsonData.name);
      setImageUrl(getIpfsUrl(jsonData.image));
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  }

  const getIpfsUrl = (ipfsUrl) => {
    let ipfsId = ipfsUrl.split("/")[2];
    let imagePath = ipfsUrl.split("/")[3];
    return 'https://ipfs.io/ipfs/' + ipfsId + '/' + imagePath;
  }


  /* --------------------------- 👀 ⬇ ------------------------------ */
  const getOwnerOf = async (ID) => {
    try {
      const provider = await getProviderOrSigner(false, web3ModalRef);
      const NFTContract = new Contract(
        DOGERPUPSNFT_CONTRACT_ADDRESS,
        dogerPupsNFTAbi,
        provider
      )

      const ownerOfNFT = await NFTContract.ownerOf(parseInt(ID));
      console.log("Owner Address:", ownerOfNFT); // Borrar esto después que descubra el error
      setOwner(ownerOfNFT.toString());
      console.log("Owner State:", owner); // Borrar esto después que descubra el error
    } catch (err) {
      console.log("Error finding owner:", tokenId);
    }
  }
  /* ---------------------------  👀 ⬆ ------------------------------ */


  const mintNFT = async (e, tokenID) => {
    try {
      const signer = await getProviderOrSigner(true, web3ModalRef);
      const NFTContract = new Contract(
        DOGERPUPSNFT_CONTRACT_ADDRESS,
        dogerPupsNFTAbi,
        signer
      )

      const mintNFT = await NFTContract.mint(tokenID);
      console.log(`Mint: ${mintNFT}`)
      setMinting(true);
      await mintNFT.wait();
      setMinting(false);
      toast.success("NFT minted!");
      getOwnerOf(tokenID);
    } catch (err) {
      toast.error("Error minting NFT, Get Doger Inu token and approve before minting.");
    }
  }

  return (
    <div className='gridItem'>
      {loading ? 'Loading...' : (
        <>
          <img className='gridImage' src={imageUrl} />
          <p>{name}</p>
          {owner ? (
            <>
              <p title={owner}>Owner: {owner.substring(0, 10) + '...'}</p>
            </>
          ) : (            
              <>
                <button className='mintButton' onClick={(e) => mintNFT(e, tokenId)}>{minting ? 'Minting...' : 'MINT ME!'}</button>
              </>          
          )}
        </>
      )}
    </div>
  )
}

export default GridItem