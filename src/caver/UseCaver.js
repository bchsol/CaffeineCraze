import Caver from "caver-js";
import StakeContractData from "../contracts/StakingContract";
import NFTContractData from "../contracts/MintContract";
import LotteryContractData from "../contracts/LotteryContract";
import TokenContractData from "../contracts/TokenContract";
import LockContractData from "../contracts/LockContract";

export const caver = new Caver(window.klaytn);

export const StakeContract = new caver.contract(
  StakeContractData.Abi,
  StakeContractData.AddressBaobab
);

export const NFTContract = new caver.contract(
  NFTContractData.Abi,
  NFTContractData.AddressBaobab
);

export const LotteryContract = new caver.contract(
  LotteryContractData.Abi,
  LotteryContractData.AddressBaobab
);

export const TokenContract = new caver.contract(
  TokenContractData.Abi,
  TokenContractData.AddressBaobab
);

export const LockContract = new caver.contract(
  LockContractData.Abi,
  LockContractData.AddressBaobab
);