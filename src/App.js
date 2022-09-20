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
  const [feedback, setFeedback] = useState(``);
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
    let totalGasLimit = String(gasLimit);
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
    if (newMintAmount > 5) {
      newMintAmount = 5;
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
  };

  return (
    <div>
      <div style={{backgroundColor: 'black', display: 'flex', width: '100%', height: '100vh', flexDirection: 'row'}}>

        <div style={{display: 'flex', height: '100%', flex: '1', alignItems: 'center', justifyContent: 'left'}}>
          <img src="/config/images/renga1.png" style={{width: '90%', transform: 'rotate(-90deg) translate(0, -7vw)', margin: 'auto', marginLeft: 0}}></img>
        </div>
        <div style={{display: 'flex', height: '100%', flex: '1', alignItems: 'center'}}>
        <img src="/config/images/renga2.png" style={{width: '90%', transform: 'rotate(-90deg) translate(0, 7vw)', margin: 'auto', marginRight: 0}}></img>
        </div>

        <div style={{position: 'absolute', width: '100%', display: 'flex', bottom: 0, justifyContent: 'center'}}>
          <img src="/config/images/renga.png" style={{width: '25%'}}></img>
        </div>

        {/*Socials*/}
        <a href="https://twitter.com/NotRenga" target="_blank">
          <p className="twitter">Twitter</p>
        </a>
        <a href="https://opensea.io/collection/not-renga-1" target="_blank">
        <p className="os">Opensea</p>
        </a>
        <div id="connectbtn" style={{}}
          onClick={(e) => {
            e.preventDefault();
            dispatch(connect());
            getData();
          }}
        >
        CONNECT
        </div>


        {/*Mint Section*/}
        <div className="mint">
          {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
            <>
              <div
                className="soldout" style={{fontFamily: "'Gemini', cursive", color: 'white', fontSize: '5em'}}
              >
                SOLD OUT!
              </div>
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
                      style={{ fontFamily: "'Gemini', cursive", color: 'white', fontSize: '5em', cursor: 'pointer'}}
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
                        fontSize: '5em',
                        textAlign: "center",
                        color: 'white', fontFamily: "'Gemini', cursive",
                      }}
                    >
                      {mintAmount}
                    </s.TextDescription>
                    <s.SpacerMedium />
                    <btn className="round-button"
                      style={{ fontFamily: "'Gemini', cursive", color: 'white', fontSize: '5em', cursor: 'pointer'}}
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
                    <div className="mintbtn"
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
      <Phone>
       
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
background-color: white;
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
