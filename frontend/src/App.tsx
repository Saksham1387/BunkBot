
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import "./App.css";
import axios from "axios";
import { nodePolyfills } from 'vite-plugin-node-polyfills'


const connection = new Connection("https://old-wiser-card.solana-devnet.quiknode.pro/926f771825f703b89c69476e56eb6f8930c66375")

function App() {
  

  async function SendSol(){
    const ixn = SystemProgram.transfer({ 
      fromPubkey: new PublicKey("AUEGAxzwU1mxfDK8CXNtPPdNhX2Tkz74chYuLSQ3ZcC9"),
      toPubkey: new PublicKey("CfTSSJD1Af6eDqzaTw6d3tUiVMbVgXf11s2QK1Z1Vimt"),
      lamports: 0.001 * LAMPORTS_PER_SOL
    })
    const txn = new Transaction().add(ixn)

    const { blockhash } = await connection.getLatestBlockhash()
    txn.recentBlockhash = blockhash
    txn.feePayer =  new PublicKey("AUEGAxzwU1mxfDK8CXNtPPdNhX2Tkz74chYuLSQ3ZcC9")

    //conver the transation to a bunch of bytes to send to the backend
    const serializedtx = txn.serialize({
      requireAllSignatures:false,
      verifySignatures:false
    })
    console.log(serializedtx)
    await axios.post("https://localhost:3000",{
      message: serializedtx,
      retry: false
    })

  }
  return <div>
    <input type="text" placeholder="amount"/>
    <input type="text" placeholder="adress"/>
    <button onClick={SendSol}>Send</button>
   
    </div>;
}

export default App;
