import React, { useEffect, useState } from "react";
import { caver, NFTContract } from "../caver/UseCaver";
import * as s from "../Style/globalStyles";
import { ProgressBar, Button, Modal } from "react-bootstrap";
import { useSelector } from "react-redux";

global.Buffer = global.Buffer || require("buffer").Buffer; //webpack5 error

function Mint() {
  const [mintAmount, setMintAmount] = useState(1);
  const [totalSupply, setTotalSupply] = useState(0);
  const [maxMintAmount,setMaxMintAmount] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [modalHeader, setModalHeader] = useState("");
  const [modalContent, setModalContent] = useState("");

  const userAddress = useSelector((state) => state.userAddress);

  useEffect(() => {
    const fetchData = async () => {
      let _totalSupply = await NFTContract.methods.totalSupply().call();
      setTotalSupply(_totalSupply);

      let _maxMintAmount = await NFTContract.methods.maxMintAmount().call();
      setMaxMintAmount(_maxMintAmount);
    };

    fetchData();
  }, [NFTContract.methods]);

  const handleMint = async () => {
    if (window.klaytn.networkVersion === 8217) {
      alert("Baobab으로 변경해주세요");
      return;
    }
    caver.klay
      .sendTransaction({
        type: "SMART_CONTRACT_EXECUTION",
        from: userAddress,
        to: NFTContract._address,
        data: NFTContract.methods.mint(userAddress, mintAmount).encodeABI(),
        value: 0,
        gas: "300000",
      })
      .once("receipt", (receipt) => {
        console.log("receipt", receipt);
        setModalHeader("민팅 성공");
        setModalContent("지갑에서 NFT를 확인하세요!");
        setShowModal(true);
      })
      .once("error", (error) => {
        console.log("error", error);
        if (totalSupply === 1000) {
          setModalHeader("민팅 마감");
          setModalContent("완판되었습니다!");
          setShowModal(true);
        } else {
          setModalHeader("민팅 실패");
          setModalContent("다시 시도해 주세요");
          setShowModal(true);
        }
      });
  };

  const handleDecrement = () => {
    if (mintAmount <= 1) return;
    setMintAmount(mintAmount - 1);
  };

  const handleIncrement = () => {
    setMintAmount(mintAmount + 1);
  };

  return (
    <s.Screen>
      <s.Container
        flex={1}
        ai={"center"}
        style={{
          backgroundImage: "url(images/mintbg.jpg)",
          textAlign: "center",
        }}
      >
        <Modal
          size="sm"
          show={showModal}
          onHide={() => setShowModal(false)}
          aria-labelledby="modal"
        >
          <Modal.Header closeButton>
            <Modal.Title id="modal">{modalHeader}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{modalContent}</Modal.Body>
        </Modal>
        <div
          className="mint-card"
          style={{ top: "20vmin", width: "50vmin", position: "absolute" }}
        >
          <div
            className="card-top"
            style={{
              paddingBottom: 24,
              borderBottom: "2px solid rgb(0,0,0)",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span
              className="Title"
              style={{
                fontSize: 24,
                fontWeight: "bold",
                marginTop: 24,
              }}
            >
              Mint
            </span>
          </div>
          <div
            className="card-middle"
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 24,
              marginBottom: 24,
            }}
          ></div>
          <ProgressBar
            label={`${totalSupply} / 1000`}
            now={totalSupply}
            max={1000}
          />

          <div
            className="card-bottom"
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 24,
            }}
          >
            <div
              style={{
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <button
                style={{
                  borderRadius: "30%",
                  border: "none",
                  fontWeight: "bold",
                  fontSize: "15px",
                  width: "30px",
                  height: "30px",
                  cursor: "pointer",
                  boxShadow: "0px 4px 0px -2px rgba(250, 250, 250, 0.3)",
                }}
                disabled={mintAmount == 1}
                onClick={handleDecrement}
              >
                -
              </button>
              <div style={{ padding: "0px 24px 0px 24px", fontSize: "16px" }}>
                {mintAmount}
              </div>
              <button
                style={{
                  borderRadius: "30%",
                  border: "none",
                  fontWeight: "bold",
                  fontSize: "15px",
                  width: "30px",
                  height: "30px",
                  cursor: "pointer",
                  boxShadow: "0px 4px 0px -2px rgba(250, 250, 250, 0.3)",
                }}
                disabled={mintAmount == maxMintAmount}
                onClick={handleIncrement}
              >
                +
              </button>
            </div>
            <Button size="sm" onClick={handleMint}>
              Mint
            </Button>
          </div>
          <div className="explan" style={{ fontSize: 17, marginTop: 60 }}>
            <p>클레이튼 테스트넷인 바오밥으로 실행됩니다.<br />
            민팅 최대 개수는 3개입니다.<br />
            </p>
          </div>
        </div>
      </s.Container>
    </s.Screen>
  );
}
export default Mint;
