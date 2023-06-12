// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

import "@klaytn/contracts/contracts/KIP/token/KIP7/IKIP7.sol";
import "./ContractAccessControl.sol";

contract Lottery is VRFConsumerBaseV2{

  IKIP7 public token;

  ContractAccessControl public accessControls;

  struct RequestStatus {
        bool fulfilled; // whether the request has been successfully fulfilled
        bool exists; // whether a requestId exists
        uint256[] randomWords;
  }
  mapping(uint256 => RequestStatus) public s_requests;
  uint256 public lastRequestId;
  VRFCoordinatorV2Interface COORDINATOR;

  uint64 private s_subscriptionId;
  address private vrfCoordinator = 0x771143FcB645128b07E41D79D82BE707ad8bDa1C;
  bytes32 private keyHash = 0x9be50e2346ee6abe000e6d3a34245e1d232c669703efc44660a413854427027c;
  uint16 private requestConfirmations = 3;
  uint32 private numWords = 7;
  uint32 private callbackGasLimit = 2500000;
  

  /*
  Check status and information by round
  start time is the start time of the round
  end time is the end time of the round
  Status is the lottery draw status of the round
  winnumbers is the winning number
  totalquantity is the total number of lottery tickets purchased in the round
   */
  struct Round {
    uint256 startTime;
    uint256 endTime;
    RoundStatus status;
    uint256[7] winNumbers;
    uint256 firstTicketId;
    uint256 lastTicketId;
    uint256 totalQuantity;
  }

  enum RoundStatus {
    Start,
    End
  }

  /*
  Struct for displaying buyer information
   */
  struct Ticket {
    address owner;
    uint256 round;
    uint256[6] chooseNumbers;
    uint256 winLotteryRank;
  }

  uint256 public TICKET_PRICE;
  uint256 public TICKET_TOKEN_PRICE;
  uint256 constant public MIN_NUMBER = 1;
  uint256 constant public MAX_NUMBER = 45;
  uint256 public round_interval;

  //mapping(uint256=>Round) private rounds; 
  mapping(uint256=>Round) private rounds;
  mapping(uint256=>Ticket) private tickets;

  uint256 public currentRoundId = 0;
  uint256 public currentTicketId = 1;

  mapping(address => mapping(uint256 => uint256[])) private userTicketId;

  constructor(address _token, 
              uint256 _round_interval, 
              uint256 _ticket_price, 
              uint256 _ticket_token_price,
              uint64 subscriptionId,
              ContractAccessControl _accessControls
              ) VRFConsumerBaseV2(vrfCoordinator) {
    token = IKIP7(_token);
    round_interval = _round_interval;
    TICKET_PRICE = _ticket_price * 10 **18;
    TICKET_TOKEN_PRICE = _ticket_token_price * 10 **18;

    COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
    s_subscriptionId = subscriptionId;

    accessControls = _accessControls;
  }


  /// Function used to create round
  // klaytn 1day = 86400 block
  function openRound() external {
    require(accessControls.hasAdminRole(msg.sender),"Sender must have permission to admin");

    currentRoundId++;
    
    uint256[7] memory winNum;

    rounds[currentRoundId] = Round({
      startTime: block.timestamp,
      endTime: block.timestamp+round_interval,
      status: RoundStatus.Start,
      winNumbers: winNum,
      firstTicketId: currentTicketId,
      lastTicketId: currentTicketId,
      totalQuantity: 0
    });

  }

  /// Function used to buy lottery with token
  function tokenBuy(uint256[6] memory numbers) external {
    require(rounds[currentRoundId].endTime >= block.timestamp, "Round End");
    require(rounds[currentRoundId].status != RoundStatus.End, "Round End");
    require(token.balanceOf(msg.sender) >= TICKET_TOKEN_PRICE, "Not valid value");

    // duplicate check
    for(uint256 i = 0; i < numbers.length - 1; i++) {
      for(uint256 j = i+1; j < numbers.length; j++) {
        require(numbers[i] != numbers[j]);
      }
    }

    // 1~45 check
    for(uint256 i = 0; i < numbers.length; i++) {
      require(numbers[i] >= MIN_NUMBER && numbers[i] <= MAX_NUMBER, "Only numbers 0 ~ 45 can be entered");
    }

    tickets[currentTicketId] = Ticket({
      round: currentRoundId,
      owner: msg.sender,
      chooseNumbers: numbers,
      winLotteryRank: 0
    });

    

    token.transferFrom(msg.sender, address(this), TICKET_TOKEN_PRICE);

    rounds[currentRoundId].lastTicketId = currentTicketId;
    rounds[currentRoundId].totalQuantity += 1;
    
    userTicketId[msg.sender][currentRoundId].push(currentTicketId);

    currentTicketId++;
  }

  /// Function used to buy lottery
  function buy(uint256[6] memory numbers) external payable {
    require(rounds[currentRoundId].endTime >= block.timestamp, "Round End");
    require(rounds[currentRoundId].status != RoundStatus.End, "Round End");
    require(msg.value == TICKET_PRICE, "Not valid value");

    // duplicate check
    for(uint256 i = 0; i < numbers.length - 1; i++) {
      for(uint256 j = i+1; j < numbers.length; j++) {
        require(numbers[i] != numbers[j]);
      }
    }

    // 1~45 check
    for(uint256 i = 0; i < numbers.length; i++) {
      require(numbers[i] >= MIN_NUMBER && numbers[i] <= MAX_NUMBER, "Only numbers 0 ~ 45 can be entered");
    }

    tickets[currentTicketId] = Ticket({
      round: currentRoundId,
      owner: msg.sender,
      chooseNumbers: numbers,
      winLotteryRank: 0
    });

    rounds[currentRoundId].lastTicketId = currentTicketId;
    rounds[currentRoundId].totalQuantity += 1;

    userTicketId[msg.sender][currentRoundId].push(currentTicketId);

    currentTicketId++;
  }

/**
#######################################################################################################
*/

  function getRequestStatus(
    ) external view returns (bool fulfilled, uint256[] memory randomWords) {
        require(s_requests[lastRequestId].exists, "request not found");
        RequestStatus memory request = s_requests[lastRequestId];
        return (request.fulfilled, request.randomWords);
  }

  function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {
        require(s_requests[_requestId].exists, "request not found");
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWords = _randomWords;
  }  

  function drawNumbers() external {
    require(accessControls.hasAdminRole(msg.sender),"Sender must have permission to admin");
    require(rounds[currentRoundId].status == RoundStatus.End, "Round not end");

    uint256[] memory numArray = s_requests[lastRequestId].randomWords;
    uint256[] memory numbers = new uint256[](numArray.length);

    for(uint i = 0; i < numArray.length; i++) {
      numbers[i] = numArray[i] % 45 + 1;
    }

    uint256[] memory finalNumbers = sortArrays(selectRandomNumbers(numbers));

    for(uint i = 0; i < finalNumbers.length; i++) {
      rounds[currentRoundId].winNumbers[i] = finalNumbers[i];
    }
  }

  function sortArrays(uint[] memory numbers) internal pure returns (uint[] memory) {
    bool swapped;
    for (uint i = 1; i < numbers.length; i++) {
      swapped = false;
      for (uint j = 0; j < numbers.length - i; j++) {
        uint next = numbers[j + 1];
        uint actual = numbers[j];
        if (next < actual) {
          numbers[j] = next;
          numbers[j + 1] = actual;
          swapped = true;
        }
      }
      if (!swapped) {
        return numbers;
      }
    }
    return numbers;
  }

  function selectRandomNumbers(uint[] memory arr) internal view returns (uint[] memory) {
      // Remove duplicates
      uint[] memory uniqueValues = removeDuplicates(arr);
        
      // Select 7 random values
      uint[] memory selectedValues = new uint[](7);
      uint remainingCount = uniqueValues.length;
      uint selectedIndex;
      uint currentValue;
        
      for (uint i = 0; i < 7; i++) {
          selectedIndex = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, i))) % remainingCount;
          currentValue = uniqueValues[selectedIndex];
          selectedValues[i] = currentValue;
          uniqueValues[selectedIndex] = uniqueValues[remainingCount - 1];
          remainingCount--;
      }
        
      return selectedValues;
  }
    
  function removeDuplicates(uint[] memory arr) private pure returns (uint[] memory) {
      uint[] memory uniqueValues = new uint[](arr.length);
      uint currentIndex = 0;
      bool alreadyExists;
      
      for (uint i = 0; i < arr.length; i++) {
          alreadyExists = false;
          for (uint j = 0; j < currentIndex; j++) {
              if (arr[i] == uniqueValues[j]) {
                  alreadyExists = true;
                  break;
              }
          }
          if (!alreadyExists) {
              uniqueValues[currentIndex] = arr[i];
              currentIndex++;
          }
       }
        
      uint[] memory trimmedValues = new uint[](currentIndex);
      for (uint i = 0; i < currentIndex; i++) {
          trimmedValues[i] = uniqueValues[i];
      }
      
      return trimmedValues;
  }

  function countWinner() external {
    require(rounds[currentRoundId].status == RoundStatus.End, "Round not end");
    require(accessControls.hasAdminRole(msg.sender),"Sender must have permission to admin");

    uint256[7] memory winNumbers = rounds[currentRoundId].winNumbers;

    for (uint i = rounds[currentRoundId].firstTicketId; i < rounds[currentRoundId].lastTicketId; i++) {
      uint256 numberMatches = 0;
      bool bonusNumMatches = false;
      uint[6] memory userNum = tickets[i].chooseNumbers;

      for(uint j = 0; j < userNum.length; j++) {
        for(uint k = 0; k < winNumbers.length - 1; k++) {
          if(userNum[j] == winNumbers[k])
            numberMatches++;
          if(userNum[j] == winNumbers[6]) {
            bonusNumMatches = true;
          }
        }
      }

      if(numberMatches == 6) {
        // 1st
        tickets[i].winLotteryRank = 1;
      } else if(numberMatches == 5 && bonusNumMatches) {   
        // 2nd
        tickets[i].winLotteryRank = 2;
      } else if(numberMatches == 5) {
        // 3rd
        tickets[i].winLotteryRank = 3;
      } else if(numberMatches == 4) {
        // 4th
        tickets[i].winLotteryRank = 4;
      } else if(numberMatches == 3) {
        // 5th
        tickets[i].winLotteryRank = 5;
      } else {
        // lose
        tickets[i].winLotteryRank = 6;
      }
    }
  }

/**
#######################################################################################################
*/

  /// Function used to claim reward tokens
  function claim(uint256 _ticketId) external {
    require(tickets[_ticketId].owner == msg.sender, "You are not ticket owner");
    require(tickets[_ticketId].winLotteryRank != 7, "Ticket already claimed");

    uint256 reward = 0;

    if(tickets[_ticketId].winLotteryRank == 1) {
        // 1st
        reward = address(this).balance * 75 / 100;
      } else if(tickets[_ticketId].winLotteryRank == 2) {   
        // 2nd
        reward += address(this).balance * 125 / 1000; 
      } else if(tickets[_ticketId].winLotteryRank == 3) {
        // 3rd
        reward += address(this).balance * 125 / 1000;
      } else if(tickets[_ticketId].winLotteryRank == 4) {
        // 4th
      } else if(tickets[_ticketId].winLotteryRank == 5) {
        // 5th
      } else if(tickets[_ticketId].winLotteryRank == 6) {
        // lose
      }

    payable(msg.sender).transfer(reward);

    tickets[_ticketId].winLotteryRank = 7; // claimed
  }

  /// View Function

  // Function used to view my ticket info

  function getUserTickets( uint256 roundId) external view returns (Ticket[] memory) {
    uint256[] memory ticketIds = userTicketId[msg.sender][roundId];
    Ticket[] memory userTickets = new Ticket[](ticketIds.length);

    for (uint i = 0; i < ticketIds.length; i++) {
        userTickets[i] = tickets[ticketIds[i]];
    }

    return userTickets;
}

  function getRound(uint256 _roundId) external view returns(Round memory){
    return rounds[_roundId];
  }

  function getWinNumbers(uint256 _roundId) external view returns(uint256[7] memory) {
    return rounds[_roundId].winNumbers;
  }

  /// Owner Function

  function closeRound() external {
    require(accessControls.hasAdminRole(msg.sender),"Sender must have permission to admin");
    require(block.timestamp > rounds[currentRoundId].endTime, "Round not end");
    require(rounds[currentRoundId].status == RoundStatus.Start, "Round not start");

    rounds[currentRoundId].status = RoundStatus.End;
    rounds[currentRoundId].lastTicketId = currentTicketId;

    uint256 requestId;
    requestId = COORDINATOR.requestRandomWords(
      keyHash,
      s_subscriptionId,
      requestConfirmations,
      callbackGasLimit,
      numWords
    );
    s_requests[requestId] = RequestStatus({
            fulfilled: false,
            exists: true,
            randomWords: new uint256[](0)
    });
    lastRequestId = requestId;

  }

  function changeInterval(uint256 _interval) external{
    require(accessControls.hasAdminRole(msg.sender),"Sender must have permission to admin");
    round_interval = _interval;
  }

  function changePrice(uint256 _price) external {
    require(accessControls.hasAdminRole(msg.sender),"Sender must have permission to admin");
    TICKET_PRICE = _price * 10 **18;
  }

  function chageTokenPrice(uint256 _price) external {
    require(accessControls.hasAdminRole(msg.sender),"Sender must have permission to admin");
    TICKET_TOKEN_PRICE = _price * 10 **18;
  }

  function tokenWithdraw(address payable toAdress) external {
    require(accessControls.hasAdminRole(msg.sender),"Sender must have permission to admin");
    token.transfer(toAdress, token.balanceOf(address(this)));
  }

}