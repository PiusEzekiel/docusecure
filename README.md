
# 📜 Blockchain Digital Asset Protection

## Ethereum-based Digital Asset Protection using Smart Contracts

### 🚀 Overview
DocuSecure is an Ethereum-based DApp that enables users to register, verify, and transfer ownership of digital assets using smart contracts. By leveraging blockchain technology, DocuSecure ensures **immutability, security, and transparency** for digital asset ownership, helping users build trust in their digital transactions.

---

## 📌 Features
- ✅ **Register Digital Assets** – Securely store asset metadata on-chain  
- ✅ **Verify Authenticity** – Use cryptographic hashes to check asset validity  
- ✅ **Transfer Ownership** – Enable secure and seamless asset transfers  
- ✅ **Audit and Monitor** – View historical transactions and asset records  
- ✅ **User-Friendly UI** – A modern web application for easy interaction  

---

## 🛠️ Tech Stack

| Component             | Technology             |
|-----------------------|------------------------|
| **Blockchain**        | Ethereum Mainnet       |
| **Smart Contracts**   | Solidity               |
| **Development Tool**  | Hardhat                |
| **Frontend**          | React.js               |
| **Blockchain API**    | Ethers.js              |
| **Hosting**           | Render                 |
| **RPC Provider**      | Infura / Alchemy       |

---

## 📌 Live Deployment
- **Smart Contract Address:** `0x709Dd7BCcC41D4b3507921F747eeC5aAC04DC647`
- **Frontend Hosted:** [https://docusecure-h8m0.onrender.com](https://docusecure-h8m0.onrender.com/)

---

## 📌 Prerequisites
Before running this project, ensure you have:
- **Node.js & npm** – Download from [nodejs.org](https://nodejs.org/)
- **MetaMask Wallet** – Install from [metamask.io](https://metamask.io/)
- **Infura or Alchemy API Key** – Sign up at:
  - [Infura](https://infura.io/)
  - [Alchemy](https://www.alchemy.com/)

---

## 📌 Setup Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/PiusEzekiel/docusecure.git
cd docusecure
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Create and Configure the .env File
Create a file named `.env` in the project root:
```bash
touch .env
```
Then add the following configuration (replace placeholders with your actual keys):
```ini
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_API_KEY
PRIVATE_KEY=YOUR_METAMASK_PRIVATE_KEY
REACT_APP_CONTRACT_ADDRESS=[Changed to deployed Contract address]
```

---

## 📌 Deploying the Smart Contract

### 1️⃣ Compile the Contract
```bash
npx hardhat compile
```

### 2️⃣ Deploy to Ethereum Mainnet
```bash
npx hardhat run scripts/deploy.js --network mainnet
```
If successful, you will see output similar to:
```bash
Deploying contract...
Contract deployed to: xxxxxx
```
**Note:** Update your `.env` file with the new contract address if needed.

---

## 📌 Running the Frontend

### 1️⃣ Navigate to the Frontend Directory
```bash
cd frontend
```

### 2️⃣ Install Frontend Dependencies and Build
```bash
npm install
npm run build
```

### 3️⃣ Start the Frontend Server
```bash
npm start
```
Access the DApp at:
```
http://localhost:3000
```


