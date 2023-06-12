import axios from "axios";
import { NFTContract, StakeContract, caver, LockContract } from "./UseCaver";


const fetchMetadata = async (tokenId) => {
  const [name, metadataUrl] = await Promise.all([
    NFTContract.methods.name().call(),
    NFTContract.methods.tokenURI(tokenId).call(),
  ]);
  const response = await axios.get(metadataUrl);
  const image = response.data.image.substring(7);
  const tokenName = name + tokenId;

  return { tokenName, image };
};

const fetchNftData = async (tokenId) => {
  const { tokenName, image } = await fetchMetadata(tokenId);
  const uri = `https://coffee-bean.infura-ipfs.io/ipfs/${image}`;
  return { name: tokenName, uri, id: tokenId };
};

export const fetchStakeNfts = async (address) => {
  const stakedTokens = await StakeContract.methods
    .getStakedTokens(address)
    .call();
  const stakeNfts = await Promise.all(stakedTokens.map((tokenId) => fetchNftData(tokenId)));

  return stakeNfts;
};

export const fetchNfts = async (address) => {
  const balance = await NFTContract.methods.balanceOf(address).call();
  const tokenIds = await Promise.all(
    Array.from({ length: balance }, (_, i) =>
      NFTContract.methods.tokenOfOwnerByIndex(address, i).call()
    )
  );
  const nfts = await Promise.all(tokenIds.map((tokenId) => fetchNftData(tokenId)));

  return nfts;
};

export const getBalance = async (address) => {
  const response = await caver.klay.getBalance(address);
  const balance = caver.utils.convertFromPeb(response);
  return balance;
};

////////////////////////////////////////////////////////////////////////////////

export const lockFetchNfts = async (address) => {
  const lockTokens = await LockContract.methods.getUserTokens(address).call();
  const lockNfts = await Promise.all(lockTokens.map((tokenId) => fetchNftData(tokenId)));
  return lockNfts;
};