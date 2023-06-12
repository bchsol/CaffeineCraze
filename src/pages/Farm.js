import { useState, useEffect } from "react";
import { Row, Col, Card, Button, Modal, ModalHeader } from "react-bootstrap";
import * as s from "../Style/globalStyles";
import { fetchNfts, lockFetchNfts } from "../caver/FetchNfts";
import { caver, NFTContract, LockContract } from "../caver/UseCaver";
import { useSelector } from "react-redux";

import LockModal from "../utils/LockModal";

const Farm = () => {
  const [nfts, setNfts] = useState([]);
  const [lockupNfts, setLockupNfts] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLockupNftId, setSelectedLockupNftId] = useState(null);
  const [userItems, setUserItems] = useState([]);

  const userAddress = useSelector((state) => state.userAddress);

  useEffect(() => {
    fetchMyNfts();
  }, [nfts, lockupNfts]);

  useEffect(() => {
    getItemInfo();
  },[])

  const fetchMyNfts = async () => {
    const [_nfts, _lockupNfts] = await Promise.all([
      fetchNfts(userAddress),
      lockFetchNfts(userAddress),
    ]);
    setNfts(_nfts);
    setLockupNfts(_lockupNfts);
  };

  const approveNFT = async () => {
    const approve = await NFTContract.methods
      .isApprovedForAll(userAddress, LockContract._address)
      .call();

    if (!approve) {
      return caver.klay.sendTransaction({
        from: userAddress,
        to: NFTContract._address,
        data: NFTContract.methods
          .setApprovalForAll(LockContract._address, true)
          .encodeABI(),
        gas: "300000",
      });
    }
  };

  const lockUp = async (tokenId) => {
    approveNFT();

    // Stake Contract
    caver.klay
      .sendTransaction({
        type: "SMART_CONTRACT_EXECUTION",
        from: userAddress,
        to: LockContract._address,
        data: LockContract.methods.lockupNFT(tokenId).encodeABI(),
        gas: "300000",
      })
      .once("receipt", (receipt) => {
        console.log("receipt", receipt);
      })
      .once("error", (error) => {
        console.log("error", error);
      });
  };

  const releaseNFT = async (tokenId) => {
    // Unstake Contract
    caver.klay
      .sendTransaction({
        type: "SMART_CONTRACT_EXECUTION",
        from: userAddress,
        to: LockContract._address,
        data: LockContract.methods.releaseNFT(tokenId).encodeABI(),
        gas: "300000",
      })
      .once("receipt", (receipt) => {
        console.log("receipt", receipt);
      })
      .once("error", (error) => {
        console.log("error", error);
      });
  };

  const getItemInfo = async() => {
    const itemInfo = await LockContract.methods.getUserItem(userAddress).call();
    setUserItems(itemInfo);
  }


  return (
    <s.Screen style={{ backgroundImage: "url(images/stakingbg.jpg)" }}>
      <s.Container
        className="container"
        style={{
          padding: "0 10px 50px",
          width: "100%",
        }}
      >
        {selectedLockupNftId && (
        <LockModal show={isModalOpen} onHide={() => setIsModalOpen(false)} lockupNftId={selectedLockupNftId}/>
        )}
        <span style={{ fontSize: 20 }}> Address : {userAddress}</span>
        <ul>
          <li>Enhancer : {userItems.enhancer}</li>
          <li>Fertilizer : {userItems.fertilizer}</li>
          <li>Sprink : {userItems.sprink}</li>
          <li>Pesticide : {userItems.pesticide}</li>
        </ul>

        <h1>Lock</h1>
        <Row xs={1} sm={2} md={3} lg={4} xl={5} xxl={5} gap={4}>
          {lockupNfts?.map((lockupNft) => (
            <Col key={lockupNft.id} style={{ marginRight: 0, paddingRight: 50 }}>
              <Card
                border="dark"
                className="text-center"
                style={{ width: "10rem" }}
              >
                <Card.Img src={lockupNft.uri} />
                <Card.Title>{lockupNft.name}</Card.Title>
                <Card.Footer>
                  <Button
                    variant="success"
                    onClick={() => {
                      releaseNFT(lockupNft.id);
                    }}
                    style={{ width: 100, borderRadius: "20px" }}
                  >
                    Release
                  </Button>
                  <Button style={{marginTop:"10px"}}onClick={() => {setSelectedLockupNftId(lockupNft.id); setIsModalOpen(true);}}>Info</Button>
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
        <h1>Release</h1>
        <Row xs={1} sm={2} md={3} lg={4} xl={5} xxl={5} gap={4}>
          {nfts?.map((nft) => (
            <Col
              key={nft.id}
              style={{
                marginRight: 0,
                paddingRight: 50,
              }}
            >
              <Card
                border="dark"
                className="text-center"
                style={{ width: "10rem" }}
              >
                <Card.Img src={nft.uri} />
                <Card.Title>{nft.name}</Card.Title>
                <Card.Footer>
                  <Button
                    variant="success"
                    onClick={() => {
                      lockUp(nft.id);
                    }}
                    style={{ width: 100, borderRadius: "20px" }}
                  >
                    Lock
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
export default Farm;
