import React from "react";
import { Link } from "react-router-dom";
import { Navbar, Container, Nav } from "react-bootstrap";
import { useSelector } from "react-redux";
import { ConnectWallet } from "./Login";
import kaikasLogo from "../images/kaikas.png";

function Heading() {
  return (
    <>
      <Navbar bg="light" expand="lg">
        <Container>
          {/* <Navbar.Brand href="/home"></Navbar.Brands> */}
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Link
                to="/"
                style={{
                  color: "black",
                  textDecoration: "none",
                  marginRight: "25px",
                  fontSize: "20px",
                }}
              >
                Home
              </Link>
              <Link
                to="/mint"
                style={{
                  color: "black",
                  textDecoration: "none",
                  marginRight: "25px",
                  fontSize: "20px",
                }}
              >
                Mint
              </Link>
              <Link
                to="/staking"
                style={{
                  color: "black",
                  textDecoration: "none",
                  marginRight: "25px",
                  fontSize: "20px",
                }}
              >
                Staking
              </Link>
              <Link
                to="/farm"
                style={{
                  color: "black",
                  textDecoration: "none",
                  marginRight: "25px",
                  fontSize: "20px",
                }}
              >
                Farm
              </Link>
              <Link
                to="/lottery"
                style={{
                  color: "black",
                  textDecoration: "none",
                  marginRight: "25px",
                  fontSize: "20px",
                }}
              >
                Lottery
              </Link>
              {useSelector((state) => state.userAddress) ==
              0xb8d0cdb8719ab17308ddf945827d8981ed01f890 ? (
                <Link
                  to="/Admin"
                  style={{
                    color: "black",
                    textDecoration: "none",
                    marginRight: "25px",
                    fontSize: "20px",
                  }}
                >
                  Admin
                </Link>
              ) : null}
            </Nav>
            <Nav>
              <img src={kaikasLogo} style={{ width: "35px", height: "35px" }} />
              <ConnectWallet />
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default Heading;
