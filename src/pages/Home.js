import * as s from "../Style/globalStyles";
import { Container,Row,Col } from "react-bootstrap";

function Home() {
  return (
    <s.Screen>
      <s.Container
        flex={1}
        style={{
          backgroundImage: "url(images/homebg.jpg)",
        }}
      >
        <Container >
        <Row>
          <Col className="text-center" style={{marginBottom:"100px", marginTop:"150px"}}>
            <h2>Caffeine Craze</h2>
            <p>커피에 열광하는 사람들을 위한 프로젝트입니다</p>
          </Col>
        </Row>
        <Col className="text-center" style={{whiteSpace: "pre-line"}}>
          <Col style={{marginBottom:"100px"}}>
            <h4 >프로젝트 목적</h4>
            <p style={{ textAlign: "center", marginLeft: "210px", marginRight: "210px" }}>
              많은 사람들이 커피를 마시면서 일상생활을 유지하고 있습니다.<br/>
              기왕 마실거면 커피에 대해 알고 마시는게 더 맛있지 않을까요?<br/>
              커피에 열광하는 사람들과 커피에 대한 지식과 문화를 공유하며 함께 즐깁시다!<br/>
            </p>
          </Col>
          <Col style={{marginBottom:"100px"}}>
            <h4>프로세스</h4>
            <p style={{ textAlign: "center", marginLeft: "210px", marginRight: "210px" }}>
              스테이킹으로 CG토큰을 얻거나 Farm으로 CG토큰과 커피쿠폰을 획득할 수 있습니다. <br/>
              CG토큰으로 전용마켓에서 커피관련물품들을 구매할 수 있습니다.<br />
              
            </p>
          </Col>
          <Col style={{marginBottom:"100px"}}>
            <h4>혜택</h4>
            <p style={{ textAlign: "center", marginLeft: "210px", marginRight: "210px" }}>
              1. 여러 제휴카페들의 멤버십 혜택<br/>
              2. Farm을 통한 커피획득<br/>
              3. 커피관련 전용마켓<br />
            </p>
          </Col>
        </Col>
        </Container>
      </s.Container>
    </s.Screen>
  );
}

export default Home;
