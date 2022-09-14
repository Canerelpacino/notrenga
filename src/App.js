import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect, isconnected } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';


const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

function App() {

  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`THE MINT IS FREE! ANY EXTRA MINTS DO COST 0.0025 ETH.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;

    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Have some patience...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `You got it!!!`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 20) {
      newMintAmount = 20;
    }
    setMintAmount(newMintAmount);
  };


  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  const connected = () => {
    document.getElementById("connectbtn").style.display = "none";
    document.getElementById("connectbtn2").style.display = "none";
  };

  return (
    <div>
      <Home>

        {/*Socials*/}
        <a href="https://twitter.com/SSKULLSS_NFT" target="_blank">
          <img src="/config/images/tw.png" style={{ width: '55px', position: 'fixed', top: '22px', right: '40px', zIndex: '10' }} className="tw"></img>
        </a>
        <a href="https://discord.gg/StaKnc5Y6v" target="_blank">
          <img src="/config/images/dc.png" style={{ width: '65px', position: 'fixed', top: '20px', right: '110px', zIndex: '10' }} className="os"></img>
        </a>
        <div id="connectbtn" style={{}}
          onClick={(e) => {
            e.preventDefault();
            dispatch(connect());
            getData();
          }}
        >
        <p>CONNECT</p>
        </div>


        {/*Mint Section*/}
        <div className="mint">
          {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
            <>
              <s.TextTitle
                className="soldout" style={{fontFamily: "'Press Start 2P', cursive"}}
              >
                SOLD OUT!
              </s.TextTitle>
              <s.SpacerSmall />
            </>
          ) : (
            <>
              <s.SpacerXSmall />
              <s.SpacerSmall />
              {blockchain.account === "" ||
                blockchain.smartContract === null ? (
                <s.Container ai={"center"} jc={"center"}>
                  <s.SpacerSmall />

                  {blockchain.errorMsg !== "" ? (
                    <>
                      <s.SpacerSmall />
                    </>
                  ) : null}
                </s.Container>
              ) : (
                <>
                  <div onLoad={connected()}></div>
                  <s.SpacerMedium />
                  <s.Container ai={"center"} jc={"center"} fd={"row"}>
                    <btn id="roundbtn" className="round-button"
                      style={{ fontFamily: "'Press Start 2P', cursive", color: 'black', fontSize: '2em'}}
                      disabled={claimingNft ? 1 : 0}
                      onClick={(e) => {
                        e.preventDefault();
                        decrementMintAmount();
                      }}
                    >
                      -
                    </btn>
                    <s.SpacerMedium />
                    <s.TextDescription id="mint-amount"
                      style={{
                        fontSize: '2.3em',
                        textAlign: "center",
                        color: 'black', fontFamily: "'Press Start 2P', cursive",
                      }}
                    >
                      {mintAmount}
                    </s.TextDescription>
                    <s.SpacerMedium />
                    <btn className="round-button"
                      style={{ fontFamily: "'Press Start 2P', cursive", color: 'black', fontSize: '2em' }}
                      disabled={claimingNft ? 1 : 0}
                      onClick={(e) => {
                        e.preventDefault();
                        incrementMintAmount();
                      }}
                    >
                      +
                    </btn>
                  </s.Container>
                  <s.Container ai={"center"} jc={"center"} fd={"row"}>
                    <div className="pixel"
                      disabled={claimingNft ? 1 : 0}
                      onClick={(e) => {
                        e.preventDefault();
                        claimNFTs();
                        getData();
                      }}
                    >
                      <p>MINT</p>
                    </div>
                  </s.Container>
                </>
              )}
            </>
          )}
          </div>
      </Home>
      <Phone>
       <div style={{display: 'flex', margin: 'auto', justifyContent: 'center'}}>
      <div style={{display: 'flex', justifyContent: 'center', margin: 'auto'}}>
      <img id="connectbtn2" src="/config/images/MINT.png" style={{width: '50%', cursor: 'pointer'}} onClick={(e) => {
            e.preventDefault();
            dispatch(connect());
            getData();
          }}></img>
      </div>
           {/*Mint Section*/}
        <div style={{marginBottom: '100%'}}>
          {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
            <>
              <s.TextTitle
                style={{ textAlign: "center", color: "#C88D27", fontFamily: "'Press Start 2P', cursive", fontSize: "5vw", marginTop: "4vw", textShadow: '3px 3px black' }}
              >
                SOLD OUT!
              </s.TextTitle>
              <s.SpacerSmall />
            </>
          ) : (
            <>
              <s.SpacerXSmall />
              <s.SpacerSmall />
              {blockchain.account === "" ||
                blockchain.smartContract === null ? (
                <s.Container ai={"center"} jc={"center"}>
                  <s.SpacerSmall />

                  {blockchain.errorMsg !== "" ? (
                    <>
                      <s.SpacerSmall />
                    </>
                  ) : null}
                </s.Container>
              ) : (
                <>
                  <div onLoad={connected()}></div>
                  <s.SpacerMedium />
                  <s.Container ai={"center"} jc={"center"} fd={"row"}>
                    <btn id="roundbtn" className="round-button"
                      style={{ fontFamily: "'Press Start 2P', cursive", color: 'black', fontSize: '2em'}}
                      disabled={claimingNft ? 1 : 0}
                      onClick={(e) => {
                        e.preventDefault();
                        decrementMintAmount();
                      }}
                    >
                      -
                    </btn>
                    <s.SpacerMedium />
                    <s.TextDescription id="mint-amount"
                      style={{
                        fontSize: '2.3em',
                        textAlign: "center",
                        color: 'black', fontFamily: "'Press Start 2P', cursive",
                      }}
                    >
                      {mintAmount}
                    </s.TextDescription>
                    <s.SpacerMedium />
                    <btn className="round-button"
                      style={{ fontFamily: "'Press Start 2P', cursive", color: 'black', fontSize: '2em' }}
                      disabled={claimingNft ? 1 : 0}
                      onClick={(e) => {
                        e.preventDefault();
                        incrementMintAmount();
                      }}
                    >
                      +
                    </btn>
                  </s.Container>
                  <s.Container ai={"center"} jc={"center"} fd={"row"}>
                    <div className="pixel"
                      disabled={claimingNft ? 1 : 0}
                      onClick={(e) => {
                        e.preventDefault();
                        claimNFTs();
                        getData();
                      }}
                    >
                      <p>MINT</p>
                    </div>
                  </s.Container>
                </>
              )}
            </>
          )}
          </div>
       </div>
      </Phone>
    </div>
  );
}

export const Home = styled.div`
display: flex; 
flex-direction: column; 
justify-self: center; 
align-items: center; 
height: 100vh;
minWidth: 100%;
background-image: url("/config/images/bg.gif");
background-position: center center; 
background-repeat: no-repeat;
background-size: 100%; 
text-align: center; 
@media (orientation: portrait) {
  display: none;
}
`;

export const Phone = styled.div`
display: flex; 
flex-direction: column; 
justify-self: center; 
align-items: center; 
height: 100vh;
minWidth: 100%;
background-image: url("/config/images/bg.gif");
background-position: center center; 
background-repeat: no-repeat;
background-size: 390%; 
text-align: center; 
@media (orientation: landscape) {
  display: none;
}
`;

export default App;
