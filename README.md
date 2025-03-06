# 🐝 Blockchain Digital Asset Protection

## Ethereum-based Digital Asset Protection using Smart Contracts

![Blockchain Security](https://example.com/blockchain_security.png)

### 🚀 Overview
DocuSecure is an Ethereum-based DApp that enables users to register, verify, and transfer ownership of digital assets using smart contracts. By leveraging blockchain technology, DocuSecure ensures **immutability, security, and transparency** for digital asset ownership, helping users build trust in their digital transactions.

---

## 📌 Features
- ✅ **Register Digital Assets** – Securely store asset metadata on-chain  
- ✅ **Verify Authenticity** – Use cryptographic hashes to check asset validity  
- ✅ **Transfer Ownership** – Enable secure and seamless asset transfers  
- ✅ **Audit and Monitor** – View historical transactions and asset records  
- ✅ **User-Friendly UI** – A modern web application for easy interaction  

![Features Overview](https://example.com/features_overview.png)

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
- **Smart Contract Address:** `0xE38FD9E94c969c066781C3C3D21f7B34a62dA13d`
- **Frontend Hosted:** [https://docusecure-h8m0.onrender.com](https://docusecure-h8m0.onrender.com/)

---

## 📌 Screenshots
<span style="margin-top: 50px;">&nbsp;</span>
<div style="display: inlign-flex; align-items: center">
    <img src="/demo/Screenshot 2025-03-06 205314.png" width="750" height="300" alt="Image Description">
</div>
<span style="margin-top: 50px;">&nbsp;</span>
<div style="display: inlign-flex; align-items: center">
    <img src="/demo/Screenshot 2025-03-06 205613.png" width="750" height="300" alt="Image Description">
</div>
<span style="margin-top: 50px;">&nbsp;</span>
<div style="display: inlign-flex; align-items: center">
    <img src="/demo/Screenshot 2025-03-06 205633.png" width="750" height="300" alt="Image Description">
</div>
<span style="margin-top: 50px;">&nbsp;</span>
<div style="display: inlign-flex; align-items: center">
    <img src="/demo/Screenshot 2025-03-06 205705.png" width="750" height="300" alt="Image Description">
</div>
<span style="margin-top: 50px;">&nbsp;</span>
<div style="display: inlign-flex; align-items: center">
    <img src="/demo/Screenshot 2025-03-06 205807.png" width="750" height="300" alt="Image Description">
</div>
<span style="margin-top: 50px;">&nbsp;</span>
<div style="display: inlign-flex; align-items: center">
    <img src="/demo/Screenshot 2025-03-06 205902.png" width="750" height="300" alt="Image Description">
</div>
<span style="margin-top: 50px;">&nbsp;</span>
<div style="display: inlign-flex; align-items: center">
    <img src="/demo/Screenshot 2025-03-06 210000.png" width="750" height="300" alt="Image Description">
</div>
<span style="margin-top: 50px;">&nbsp;</span>
<div style="display: inlign-flex; align-items: center">
    <img src="/demo/Screenshot 2025-03-06 305517.png" width="750" height="300" alt="Image Description">
</div>


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

---

## 🔧 Troubleshooting
- **Transaction failed?** Ensure you have enough ETH for gas fees.
- **Smart contract not interacting?** Check if MetaMask is connected to the correct network.
- **Frontend not loading?** Restart the frontend server and check your `.env` settings.

---

## 📚 License
This project is licensed under the MIT License.

---

## 👥 Contributors
- **[Pius Ezekiel](https://github.com/PiusEzekiel)**

For contributions, feel free to fork the repository and submit a pull request.

---


Happy Building! 🌟

