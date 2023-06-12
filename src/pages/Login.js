import { useDispatch, useSelector, useStore } from "react-redux";
import { Button, Dropdown, DropdownButton } from "react-bootstrap";

export const ConnectWallet = () => {
  const dispatch = useDispatch();
  const store = useStore();
  const userAddress = store.getState().userAddress;

  const handleConnect = async () => {
    if (window.klaytn) {
      if (window.klaytn.networkVersion === 1001) {
        // baobab
        console.log("kaikas enable");
        const accounts = await window.klaytn.enable();
        const userAddress = accounts[0];

        dispatch({ type: "CONNECT_KAIKAS", payload: userAddress });
      }
    }
  };

  const handleDisconnect = () => {
    dispatch({ type: "DISCONNECT_KAIKAS" });
  };

  const truncateAccount = userAddress
    ? userAddress.substring(0, 6) +
      "..." +
      userAddress.substring(userAddress.length - 4)
    : null;

  return (
    <>
      {userAddress ? (
        <DropdownButton
          variant="outline-primary"
          id="dropdown-login-button"
          title={truncateAccount}
        >
          <Dropdown.Item onClick={handleDisconnect}>Disconnect</Dropdown.Item>
        </DropdownButton>
      ) : (
        <Button variant="outline-primary" onClick={handleConnect}>
          ConnectWallet
        </Button>
      )}
    </>
  );
};
