import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import ToggleButtons from "./LotteryButton";
import { LotteryContract, TokenContract,caver } from "../caver/UseCaver";

import { useSelector } from "react-redux";


const LotteryBuyModal = (props) => {
  const userAddress = useSelector((state) => state.userAddress);

  const [numbers, setNumbers] = useState();

  const BuyTicket = async (numbers) => {
    const klayPrice = await LotteryContract.methods.TICKET_PRICE().call();
    caver.klay
      .sendTransaction({
        type: "SMART_CONTRACT_EXECUTION",
        from: userAddress,
        to: LotteryContract._address,
        data: LotteryContract.methods.buy(numbers).encodeABI(),
        value: klayPrice,
        gas: "3000000",
      })
      .once("receipt", (receipt) => {
        console.log("receipt", receipt);
      })
      .once("error", (error) => {
        console.log("error", error);
      });
  };

  const approveToken = async () => {
    const tokenPrice = await LotteryContract.methods.TICKET_TOKEN_PRICE().call();

    caver.klay.sendTransaction({
      type:"SMART_CONTRACT_EXECUTION",
      from:userAddress,
      to:TokenContract._address,
      data:TokenContract.methods.approve(LotteryContract._address,tokenPrice).encodeABI(),
      gas:"3000000",
    }).then(console.log);
    
  };

  const TokenBuyTicket = async (numbers) => {

    approveToken();

    caver.klay
      .sendTransaction({
        type: "SMART_CONTRACT_EXECUTION",
        from: userAddress,
        to: LotteryContract._address,
        data: LotteryContract.methods.tokenBuy(numbers).encodeABI(),
        gas: "3000000",
      })
      .once("receipt", (receipt) => {
        console.log("receipt", receipt);
      })
      .once("error", (error) => {
        console.log("error", error);
      });
  };

  return (
    <>
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            Buy Ticket
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>Pick 6 numbers</h4>
          <ToggleButtons setNumbers={setNumbers} />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => BuyTicket(numbers)}>KlayBuy</Button>
          <Button onClick={() => TokenBuyTicket(numbers)}>TokenBuy</Button>
          <Button onClick={props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default LotteryBuyModal;
