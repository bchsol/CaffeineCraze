import { useState, useEffect } from "react";
import * as s from "../Style/globalStyles";
import { Button } from "react-bootstrap";

import { LotteryContract, caver } from "../caver/UseCaver";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function Admin() {
  const userAddress = useSelector((state) => state.userAddress);
  const [rounds, setRounds] = useState([]);
  const [currentRoundId, setCurrentRoundId] = useState(0);
  const [interval, setInterval] = useState(0);
  const [TicketPrice, setTicketPrice] = useState(0);

  const authorizedAddresses = ["0xb8d0cdb8719ab17308ddf945827d8981ed01f890"];
  let navigate = useNavigate();

  useEffect(() => {
    if (!authorizedAddresses.includes(userAddress)) {
      navigate("/");
    }
  });

  useEffect(() => {
    const getRound = async () => {
      const _currentRoundId = await LotteryContract.methods
        .currentRoundId()
        .call();
      setCurrentRoundId(_currentRoundId);

      const _round = await LotteryContract.methods
        .getRound(_currentRoundId)
        .call();
      setRounds(_round);
    };
    getRound();
  }, []);

  const getDate = (timeStamp) => {
    const milliSecToSec = new Date(timeStamp * 1000);
    return milliSecToSec.toLocaleString();
  };

  const openRound = async () => {
    caver.klay
      .sendTransaction({
        from: userAddress,
        to: LotteryContract._address,
        data: LotteryContract.methods.openRound().encodeABI(),
        gas: "3000000",
      })
      .once("receipt", (receipt) => {
        console.log("receipt", receipt);
      })
      .once("error", (error) => {
        console.log("error", error);
      });
  };

  const closeRound = async () => {
    caver.klay
      .sendTransaction({
        from: userAddress,
        to: LotteryContract._address,
        data: LotteryContract.methods.closeRound().encodeABI(),
        gas: "3000000",
      })
      .once("receipt", (receipt) => {
        console.log("receipt", receipt);
      })
      .once("error", (error) => {
        console.log("error", error);
      });
  };

  const drawNumbers = async () => {
    caver.klay
      .sendTransaction({
        from: userAddress,
        to: LotteryContract._address,
        data: LotteryContract.methods.drawNumbers().encodeABI(),
        gas: "3000000",
      })
      .once("receipt", (receipt) => {
        console.log("receipt", receipt);
      })
      .once("error", (error) => {
        console.log("error", error);
      });
  };

  const countWinner = async () => {
    caver.klay.sendTransaction({
      from: userAddress,
      to: LotteryContract,
      data: LotteryContract.methods.countWinner().encodeABI(),
      gas: "3000000",
    });
  };

  const changeInterval = async () => {
    caver.klay
      .sendTransaction({
        from: userAddress,
        to: LotteryContract._address,
        data: LotteryContract.methods.changeInterval(interval).encodeABI(),
        gas: "3000000",
      })
      .once("receipt", (receipt) => {
        console.log("receipt", receipt);
      })
      .once("error", (error) => {
        console.log("error", error);
      });
  };
  const handleChangeInterval = (e) => {
    setInterval(e.target.value);
  };

  const changePrice = async () => {
    caver.klay
      .sendTransaction({
        from: userAddress,
        to: LotteryContract._address,
        data: LotteryContract.methods.changePrice(TicketPrice).encodeABI(),
        gas: "3000000",
      })
      .once("receipt", (receipt) => {
        console.log("receipt", receipt);
      })
      .once("error", (error) => {
        console.log("error", error);
      });
  };
  const handleChangePrice = (e) => {
    setTicketPrice(e.target.value);
  };

  return (
    <s.Screen>
      <s.Container
        flex={1}
        ai={"center"}
        style={{
          backgroundImage: "url(images/homebg.jpg)",
          textAlign: "center",
        }}
      >
        <span
          className="Title"
          style={{ fontSize: 30, fontWeight: "bold", marginTop: "25vmin" }}
        >
          로또
        </span>
        <h3 className="title">Round {currentRoundId}</h3>
        <h4>시작시간 {getDate(rounds.startTime)}</h4>
        <h4>종료시간 {getDate(rounds.endTime)}</h4>
        <h4>응모현황 : {rounds.totalQuantity}</h4>
        <h4>{rounds.status == true ? "완료" : "추첨 전"}</h4>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: "100px",
          }}
        >
          <Button style={{ marginBottom: "20px" }} onClick={openRound}>
            OpenRound
          </Button>
          <Button style={{ marginBottom: "20px" }} onClick={closeRound}>
            CloseRound
          </Button>
          <Button style={{ marginBottom: "20px" }} onClick={drawNumbers}>
            DrawNumbers
          </Button>
          <Button style={{ marginBottom: "20px" }} onClick={countWinner}>
            CountWinner
          </Button>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <input
            type="number"
            value={interval}
            onChange={handleChangeInterval}
          />
          <Button style={{ marginBottom: "20px" }} onClick={changeInterval}>
            ChangeInterval
          </Button>

          <input
            type="number"
            value={TicketPrice}
            onChange={handleChangePrice}
          />
          <Button onClick={changePrice}>ChangePrice</Button>
        </div>
      </s.Container>
    </s.Screen>
  );
}

export default Admin;
