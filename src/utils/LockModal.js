import { useState,useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { LockContract, caver } from "../caver/UseCaver";
import { useSelector } from "react-redux";

const LockModal = ({lockupNftId,show,onHide}) => {
  const userAddress = useSelector((state) => state.userAddress);
  const [lockupNftInfo, setLockupNftInfo] = useState([]);


  useEffect(() => {
    if(show){
      getLockInfo();
    }
  }, [show])
  

  const getLockInfo = async() => {
    const info = await LockContract.methods.getLockupInfo(lockupNftId).call();
    setLockupNftInfo(info);
  }

  const watering = async() => {
    caver.klay.sendTransaction({
      type: "SMART_CONTRACT_EXECUTION",
      from: userAddress,
      to: LockContract._address,
      data: LockContract.methods.watering(lockupNftId).encodeABI(),
      gas:"300000",
    })
    .once("receipt", (receipt) => {
      console.log("receipt", receipt);
    })
    .once("error", (error) => {
      console.log("error", error);
    });
  };

  const reward = async() => {
    caver.klay.sendTransaction({
      type: "SMART_CONTRACT_EXECUTION",
      from: userAddress,
      to: LockContract._address,
      data: LockContract.methods.reward(lockupNftId).encodeABI(),
      gas:"300000",
    })
    .once("receipt", (receipt) => {
      console.log("receipt", receipt);
    })
    .once("error", (error) => {
      console.log("error", error);
    });
  };

  const enhancer = async() => {
    caver.klay.sendTransaction({
      type: "SMART_CONTRACT_EXECUTION",
      from: userAddress,
      to: LockContract._address,
      data: LockContract.methods.activeEnhancer(lockupNftId).encodeABI(),
      gas:"300000",
    })
    .once("receipt", (receipt) => {
      console.log("receipt", receipt);
    })
    .once("error", (error) => {
      console.log("error", error);
    });
  }

  const fertilizer = async() => {
    caver.klay.sendTransaction({
      type: "SMART_CONTRACT_EXECUTION",
      from: userAddress,
      to: LockContract._address,
      data: LockContract.methods.activeFertilizer(lockupNftId).encodeABI(),
      gas:"300000",
    })
    .once("receipt", (receipt) => {
      console.log("receipt", receipt);
    })
    .once("error", (error) => {
      console.log("error", error);
    });
  }

  const sprink = async() => {
    caver.klay.sendTransaction({
      type: "SMART_CONTRACT_EXECUTION",
      from: userAddress,
      to: LockContract._address,
      data: LockContract.methods.activeSprink(lockupNftId).encodeABI(),
      gas:"300000",
    })
    .once("receipt", (receipt) => {
      console.log("receipt", receipt);
    })
    .once("error", (error) => {
      console.log("error", error);
    });
  }

  const pesticide = async() => {
    caver.klay.sendTransaction({
      type: "SMART_CONTRACT_EXECUTION",
      from: userAddress,
      to: LockContract._address,
      data: LockContract.methods.activePesticide(lockupNftId).encodeABI(),
      gas:"300000",
    })
    .once("receipt", (receipt) => {
      console.log("receipt", receipt);
    })
    .once("error", (error) => {
      console.log("error", error);
    });
  }

  return (
    <>
      <Modal
        show={show}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            Info
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul>
          <li>Grow : {lockupNftInfo.grow}</li>
          <li>waterfrequency : {lockupNftInfo.waterfrequency}</li>
          <li>waterLimit : {lockupNftInfo.waterLimit}</li>
          <li>usePesticide : {lockupNftInfo.usePesticide ? "true" : "false"}</li>
          </ul>
          <Button variant="outline-success" style={{marginRight:"10px"}} onClick={()=>enhancer()}>Enhancer</Button>
          <Button variant="outline-success" style={{marginRight:"10px"}} onClick={()=>fertilizer()}>Fertilizer</Button>
          <Button variant="outline-success" style={{marginRight:"10px"}} onClick={()=>sprink()}>Sprink</Button>
          {lockupNftInfo.usePesticide ? null : <Button variant="outline-success" onClick={()=>pesticide()}>Pesticide</Button>}
        </Modal.Body>
        <Modal.Footer>
          {lockupNftInfo.grow == 4 ? <Button onClick={() =>reward()}>Claim</Button>: null}
          <Button variant="outline-primary" onClick={() => watering()}>Wartering</Button>
          <Button variant="outline-danger" onClick={onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default LockModal;
