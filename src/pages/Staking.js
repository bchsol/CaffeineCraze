import { useState, useEffect } from "react";
import { Row, Col, Card, Button } from "react-bootstrap";
import * as s from "../Style/globalStyles";
import { fetchNfts, fetchStakeNfts } from "../caver/FetchNfts";
import { StakeContract, NFTContract, caver } from "../caver/UseCaver";
import { useSelector } from "react-redux";

const Staking = () => {
  const [nfts, setNfts] = useState([]);
  const [stakeNfts, setStakeNfts] = useState([]);
  const [rewardTokens, setRewardTokens] = useState(0);

  const userAddress = useSelector((state) => state.userAddress);

  useEffect(() => {
    fetchMyNfts();
    rewardToken();
  }, [nfts,stakeNfts]);

  const fetchMyNfts = async () => {
    const [_nfts, _stakeNfts] = await Promise.all([
      fetchNfts(userAddress),
      fetchStakeNfts(userAddress),
    ]);
    setNfts(_nfts);
    setStakeNfts(_stakeNfts);
  };

  const approveNFT = async () => {
    const approve = await NFTContract.methods
      .isApprovedForAll(userAddress, StakeContract._address)
      .call();

    if (!approve) {
      return caver.klay.sendTransaction({
        from: userAddress,
        to: NFTContract._address,
        data: NFTContract.methods
          .setApprovalForAll(StakeContract._address, true)
          .encodeABI(),
        gas: "300000",
      });
    }
  };

  const stake = async (tokenId) => {
    approveNFT();

    // Stake Contract
    caver.klay
      .sendTransaction({
        type: "SMART_CONTRACT_EXECUTION",
        from: userAddress,
        to: StakeContract._address,
        data: StakeContract.methods.stake(tokenId).encodeABI(),
        gas: "300000",
      })
      .once("receipt", (receipt) => {
        console.log("receipt", receipt);
      })
      .once("error", (error) => {
        console.log("error", error);
      });
  };

  const unstake = async (tokenId) => {
    // Unstake Contract
    caver.klay
      .sendTransaction({
        type: "SMART_CONTRACT_EXECUTION",
        from: userAddress,
        to: StakeContract._address,
        data: StakeContract.methods.unstake(tokenId).encodeABI(),
        gas: "300000",
      })
      .once("receipt", (receipt) => {
        console.log("receipt", receipt);
      })
      .once("error", (error) => {
        console.log("error", error);
      });
  };

  const rewardToken = async () => {
    const balance = await StakeContract.methods
      .calculateRewards(userAddress)
      .call();
    setRewardTokens(balance / 10 ** 18);
  };

  return (
    <s.Screen style={{ backgroundImage: "url(images/stakingbg.jpg)" }}>
      <s.Container
        className="container"
        style={{
          padding: "0 10px 50px",
          width: "100%",
        }}
      >
        <span style={{ fontSize: 20 }}> Address : {userAddress}</span>
        <span style={{ fontSize: 20 }}> Reward Token : {rewardTokens} CG</span>

        <h1>Stake</h1>
        <Row xs={1} sm={2} md={3} lg={4} xl={5} xxl={5} gap={4}>
          {stakeNfts?.map((stakeNft) => (
            <Col key={stakeNft.id} style={{ marginRight: 0, paddingRight: 50 }}>
              <Card
                border="dark"
                className="text-center"
                style={{ width: "10rem" }}
              >
                <Card.Img src={stakeNft.uri} />
                <Card.Title>{stakeNft.name}</Card.Title>
                <Card.Footer>
                  <Button
                    variant="success"
                    onClick={() => {
                      unstake(stakeNft.id);
                    }}
                    style={{ width: 100, borderRadius: "20px" }}
                  >
                    UnStake
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      </s.Container>
      <s.Container
        className="container"
        style={{
          padding: "0 10px 50px",
          width: "100%",
        }}
      >
        <h1>UnStake</h1>
        <Row xs={1} sm={2} md={3} lg={4} xl={5} xxl={5} gap={4}>
          {nfts?.map((nft) => (
            <Col
              key={nft.id}
              style={{
                paddingRight: 50,
              }}
            >
              <Card
                border="dark"
                className="text-center"
                style={{ width: "150px" }}
              >
                <Card.Img src={nft.uri} />
                <Card.Title>{nft.name}</Card.Title>
                <Card.Footer>
                  <Button
                    variant="success"
                    onClick={() => {
                      stake(nft.id);
                    }}
                    style={{ width: 100, borderRadius: "20px" }}
                  >
                    Stake
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      </s.Container>
    </s.Screen>
  );
};
export default Staking;
