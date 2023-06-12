import { useState, useEffect } from "react";
import * as s from "../Style/globalStyles";
import { Button } from "react-bootstrap";

import LotteryBuyModal from "../utils/LotteryBuyModal";
import { LotteryContract } from "../caver/UseCaver";
import { useSelector } from "react-redux";
function Lottery() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rounds, setRounds] = useState({});

  const [selectedRoundId, setSelectedRoundId] = useState(1);
  const [currentRoundId, setCurrentRoundId] = useState(0);
  const [winNumbers, setWinNumbers] = useState([]);
  const [myTickets, setMyTickets] = useState([]);

  const userAddress = useSelector((state) => state.userAddress);


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

  useEffect(() => {
    const getWinNumbers = async () => {
      const _winNumbers = await LotteryContract.methods
        .getWinNumbers(selectedRoundId)
        .call();

      setWinNumbers(_winNumbers);
    };

    const getMyTickets = async () => {
      const _myTickets = await LotteryContract.methods
        .getUserTickets(selectedRoundId)
        .call({from:userAddress});

      setMyTickets(_myTickets);
    };

    getWinNumbers();
    getMyTickets();

  }, [selectedRoundId]);


  const getDate = (timeStamp) => {
    const milliSecToSec = new Date(timeStamp * 1000);
    return milliSecToSec.toLocaleString();
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

        <Button onClick={() => setIsModalOpen(true)}>티켓 구매</Button>
        <LotteryBuyModal
          show={isModalOpen}
          onHide={() => setIsModalOpen(false)}
        />
        <h4>시작시간 : {getDate(rounds.startTime)}</h4>
        <h4>종료시간 : {getDate(rounds.endTime)}</h4>
        <h4>응모현황 : {rounds.totalQuantity}</h4>

        <h4>{rounds.status == true ? "추첨 완료" : "추첨 전"}</h4>

        <h3 style={{fontWeight: "bold"}}>Round WinNumbers</h3>

        <div className="round-selector">
          <div className="number-selector">
            <Button
              disabled={selectedRoundId == 1}
              onClick={() => setSelectedRoundId(selectedRoundId - 1)}
            >
              ◀
            </Button>
            <span className="number">{selectedRoundId}</span>
            <Button
              disabled={selectedRoundId == currentRoundId}
              onClick={() => setSelectedRoundId(selectedRoundId + 1)}
            >
              ▶
            </Button>
          </div>
          {winNumbers ? (
            <ul
              style={{
                listStyleType: "none",
                fontSize: "20px"

              }}
            >
              <li>WinNumbers : {winNumbers.slice(0, 6).join(" ")}</li>
              <li>Bonus: {winNumbers[6]}</li>
            </ul>
          ) : (
            <ul>
              <li>WinNumbers : 0 0 0 0 0 0 0</li>
              <li>Bonus: 0</li>
            </ul>
          )}
          <div>
            <h3 style={{fontWeight: "bold"}}>MyTickets</h3>
            <pre style={{fontSize:"25px"}}>
              {myTickets?.map((ticket, index) => (
              <span key={index}>{ticket.chooseNumbers.slice(0, 6).join(" ")}{"\n"}</span>
              ))}
            </pre>
          </div>
        </div>
      </s.Container>
    </s.Screen>
  );
}
export default Lottery;
