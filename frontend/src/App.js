import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import CryptoJS from "crypto-js";
import { toast } from "react-toastify";
import SecurityHeaders from "./SecurityHeaders"; // Import the SecurityHeaders component
import { v4 as uuidv4 } from "uuid"; // Install using: npm install uuid
import "./App.css"; // Import the CSS file
import { FaRegCopy } from "react-icons/fa"; // Import the copy icon

const contractABI = require("./DocumentRegistryABI.json");
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

// Automatically select the right provider
const readProvider = new ethers.JsonRpcProvider(process.env.REACT_APP_MAINNET_RPC_URL);
const contract = new ethers.Contract(contractAddress, contractABI, readProvider);
// Function to get a provider for transactions (MetaMask)

// const provider = new ethers.providers.JsonRpcProvider(
//     `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`
// );


function App() {
    const [account, setAccount] = useState("");
    const [activeTab, setActiveTab] = useState("register"); // Controls which card is visible
    const [documentHash, setDocumentHash] = useState("");
    const [status, setStatus] = useState("");
    const [file, setFile] = useState(null);
    const [metadata, setMetadata] = useState("");
    const [loadingRegister, setLoadingRegister] = useState(false);
    const [hash, setHash] = useState("");
    const [documentInfo, setDocumentInfo] = useState(null);
    const [loadingVerify, setLoadingVerify] = useState(false);
    const [registeredDocuments, setRegisteredDocuments] = useState([]); // Initialize as an empty array
    const [transferTo, setTransferTo] = useState("");
    const [showInfoBox, setShowInfoBox] = useState(false);
    const [statusType, setStatusType] = useState(""); // Add this new state

    // Function to get a provider for transactions (MetaMask)
    // ✅ Function to get a provider for transactions (MetaMask)
    const getSigner = async () => {
        if (!window.ethereum) {
            throw new Error("MetaMask is not installed");
        }
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // ✅ Ensure wallet is connected to Ethereum Mainnet
        // const network = await provider.getNetwork();
        // if (network.chainId !== 1) {  // Chain ID for Ethereum Mainnet
        //     throw new Error("Please switch to Ethereum Mainnet in MetaMask");
        // }

        return signer;
    };
    const updateStatus = (message, type = "") => {
        // Truncate the message if it's longer than 100 characters
        const truncatedMessage = message.length > 100 ? message.slice(0, 100) + "..." : message;
        
        setStatus(truncatedMessage);
        setStatusType(type);
        
        // Auto-clear status after 20 seconds
        setTimeout(() => {
            setStatus("");
            setStatusType("");
        }, 20000);
    };

    // Connect to MetaMask
    const connectWallet = async () => {
        if (!window.ethereum) {
            updateStatus("❌ MetaMask not detected", "error");
            return;
        }
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            setAccount(address);

            // ✅ Check Network (Ensure Mainnet)
            // const network = await provider.getNetwork();
            // if (network.chainId !== 1) {  // Chain ID for Ethereum Mainnet
            //     throw new Error("⚠️ Wrong network! Switch to Ethereum Mainnet in MetaMask.");
            // }
            updateStatus(`✅ Wallet Connected: ${address}`, "success");
        } catch (error) {
            updateStatus("❌ Failed to connect wallet: " + error.message, "error");
        }
    };


    // Handle file selection
    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    // 🔹 Hash document for registration
    const hashDocument = async () => {
        setStatus("🔄 Preparing to register document...");
        if (!file) {
            toast.error("❌ Please upload a file");
            setStatus("❌ No file selected. Upload a document first.", "error");
            return;
        }

        setStatus("🔄 Generating document hash...");
        const nonce = uuidv4(); // Generate a unique nonce
        const reader = new FileReader();

        reader.onload = async (e) => {
            setStatus("🔄 Hashing document...");
            const combinedData = e.target.result + metadata + nonce;
            const wordArray = CryptoJS.lib.WordArray.create(combinedData);
            const hash = CryptoJS.SHA256(wordArray).toString();

            setDocumentHash(hash);  // Store hash in state
            setStatus(`✅ Hash generated: ${hash}`);

            await registerDocument(hash); // Proceed to register document
        };

        reader.onerror = (error) => {
            toast.error("❌ Error reading file");
            setStatus("❌ Error reading file. Try again.", "success");
        };

        reader.readAsArrayBuffer(file);
    };

    // 🔹 Copy Hash to Clipboard
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                setStatus("✅ Hash Copied to clipboard!", "success");
                toast.success("📋 Copied to clipboard!");
            })
            .catch((err) => {
                setStatus("❌ Copy failed", "error");
                toast.error("❌ Failed to copy");
                console.error("Copy failed:", err);
            });
    };

    // 🔹 Register document on blockchain
    const registerDocument = async (hash) => {
        if (!window.ethereum) {
            updateStatus("❌ MetaMask not detected", "error");
            return;
        }

        try {
            setLoadingRegister(true);
            updateStatus("🔄 Processing transaction...");

            const signer = await getSigner(); // ✅ Ensure Mainnet Connection
            const contractWithSigner = new ethers.Contract(contractAddress, contractABI, signer);

            const tx = await contractWithSigner.registerDocument(hash, metadata);
            await tx.wait();

            updateStatus("✅ Document registered successfully!", "success");
            setShowInfoBox(true);

            // Refresh the documents list
            await fetchRegisteredDocuments();

        } catch (error) {
            updateStatus("❌ Registration failed: " + error.message, "error");
        } finally {
            setLoadingRegister(false);
        }
    };

    // 🔹 Verify document on blockchain
    const verifyDocument = async () => {
        if (!hash) {
            updateStatus("❌ Please enter a document hash", "error");
            return;
        }

        try {
            setLoadingVerify(true);
            updateStatus("🔄 Verifying document...");

            // const provider = new ethers.BrowserProvider(window.ethereum);
            // const provider = new ethers.JsonRpcProvider(process.env.REACT_APP_MAINNET_RPC_URL);

            const contract = new ethers.Contract(contractAddress, contractABI, readProvider);
            const data = await contract.verifyDocument(hash);

            if (!data || data[0] === ethers.ZeroAddress) {
                updateStatus("❌ Document not found", "error");
                setDocumentInfo(null);
                return;
            }

            const timestamp = Number(data[1]);
            setDocumentInfo({
                owner: data[0],
                timestamp: new Date(timestamp * 1000).toLocaleString(),
                metadata: data[2],
            });
            updateStatus("✅ Document verified successfully!", "success");

        } catch (error) {
            updateStatus("❌ Verification failed: " + error.message, "error");
            setDocumentInfo(null);
        } finally {
            setLoadingVerify(false);
        }
    };

    // 🔹 Fetch all registered documents for the dashboard
    const fetchRegisteredDocuments = async () => {
        if (!window.ethereum) return;

        try {
            const contract = new ethers.Contract(contractAddress, contractABI, readProvider);
            const docs = await contract.getAllDocuments(); // // Ensure this function exists in your contract

            // 🔹 Format Data Properly
            const formattedDocs = docs.map((doc) => ({
                hash: doc.hash,
                owner: doc.owner,
                metadata: doc.metadata,
                timestamp: new Date(Number(doc.timestamp) * 1000).toLocaleString() // Convert BigInt
            }));

            setRegisteredDocuments(formattedDocs);
        } catch (error) {
            console.error("Error fetching documents", error);
        }
    };

    // 🔹 Transfer document ownership
    const transferOwnership = async () => {
        if (!hash || !transferTo) {
            updateStatus("❌ Please enter both document hash and new owner address", "error");
            return;
        }

        try {
            updateStatus("🔄 Transferring ownership...");
            // const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await getSigner();
            const contractWithSigner = new ethers.Contract(contractAddress, contractABI, signer);

            const tx = await contractWithSigner.transferOwnership(hash, transferTo);
            await tx.wait();

            updateStatus("✅ Ownership transferred successfully!", "success");
            await fetchRegisteredDocuments(); // Refresh the documents list
        } catch (error) {
            updateStatus("❌ Transfer failed: " + error.message, "error");
        }
    };

    useEffect(() => {
        // Fetch registered documents when the component mounts
        fetchRegisteredDocuments();
    }, []);

    // Function to switch tabs
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setStatus(""); // Reset status when switching tabs
    };

    return (
        <div className="app-wrapper">
            <SecurityHeaders />
            <header>
                <h2>
                    DocuSecure DApp
                </h2>

                {/* 🔹 Wallet Connection Section */}
                <div className="wallet-section">
                    <button className="connect-button" onClick={connectWallet}>
                        {account
                            ? `Connected: ${account.substring(0, 6)}...${account.slice(-4)}`
                            : "Connect Wallet"}
                    </button>
                </div>
            </header>
            <div>
                {status && (
                    <p className={`status-message ${statusType ? `status-${statusType}` : ''}`}>
                        {status}
                    </p>
                )}
            </div>
            <div className="app-container">
                {/* 🔹 Navigation Tabs */}
                <div className="tabs">
                    <button
                        className={`tab-button ${activeTab === "register" ? "active" : ""}`}
                        onClick={() => handleTabChange("register")}
                    >
                        📄 Register Document
                    </button>
                    <button
                        className={`tab-button ${activeTab === "verify" ? "active" : ""}`}
                        onClick={() => handleTabChange("verify")}
                    >
                        🔍 Verify Document
                    </button>
                    <button
                        className={`tab-button ${activeTab === "dashboard" ? "active" : ""}`}
                        onClick={() => handleTabChange("dashboard")}
                    >
                        📜 View Documents
                    </button>
                    <button
                        className={`tab-button ${activeTab === "transfer" ? "active" : ""}`}
                        onClick={() => handleTabChange("transfer")}
                    >
                        🔄 Transfer Ownership
                    </button>
                </div>

                {/* 🔹 Conditionally Render Cards Based on Active Tab */}
                {activeTab === "register" && (
                    <div className="card fade-in">
                        <h3>Register Document</h3>
                        <input type="file" onChange={handleFileChange} className="file-input" />
                        <input
                            type="text"
                            placeholder="Enter metadata (e.g., document type, issuer ID)"
                            value={metadata}
                            onChange={(e) => setMetadata(e.target.value)}
                            className="input-field"
                        />
                        <button className="action-button" onClick={hashDocument} disabled={loadingRegister}>
                            {loadingRegister ? "Processing..." : "Register Document"}
                        </button>
                        {showInfoBox && registeredDocuments.length > 0 && (
                            <div className={"info-box fade-in"}>
                                <h3>✅ Document Registered Successfully</h3>
                                <p>
                                    <b>Copy Hash For Verification:</b> {registeredDocuments[registeredDocuments.length - 1].hash}{" "}
                                    <FaRegCopy
                                        className="copy-icon"
                                        onClick={() => copyToClipboard(registeredDocuments[registeredDocuments.length - 1].hash)}
                                        title="Copy Hash"
                                    />
                                </p>
                                <p><b>Registered On:</b> {registeredDocuments[registeredDocuments.length - 1].timestamp}</p>
                                <p><b>Metadata:</b> {registeredDocuments[registeredDocuments.length - 1].metadata}</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "verify" && (
                    <div className="card fade-in">
                        <h3>Verify Document</h3>
                        <input
                            type="text"
                            placeholder="Enter Document Hash"
                            value={hash}
                            onChange={(e) => setHash(e.target.value)}
                            className="input-field"
                        />
                        <button className="action-button" onClick={verifyDocument} disabled={loadingVerify}>
                            {loadingVerify ? "Checking..." : "Verify Document"}
                        </button>

                        {documentInfo && (
                            <div className="info-box">
                                <h3>✅ Document Found</h3>
                                <p><b>Owner:</b> {documentInfo.owner}</p>
                                <p><b>Registered On:</b> {documentInfo.timestamp}</p>
                                <p><b>Metadata:</b> {documentInfo.metadata}</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "dashboard" && (
                    <div className="card fade-in">
                        <h3>Registered Documents</h3>
                        <ul className="document-list">
                            {registeredDocuments.length > 0 ? (
                                registeredDocuments.map((doc, index) => (
                                    <li key={index} className="document-item">
                                        <div>
                                            <p><b>Hash:</b> {doc.hash}
                                                <FaRegCopy
                                                    className="copy-icon"
                                                    onClick={() => copyToClipboard(doc.hash)}
                                                    title="Copy Hash"
                                                />
                                            </p>
                                            <p><b>Owner:</b> {doc.owner}</p>
                                        </div>
                                        <div>
                                            <p><b>Registered On:</b> {doc.timestamp}</p>
                                            <p><b>Metadata:</b> {doc.metadata || "N/A"}</p>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li>No registered documents found.</li>
                            )}
                        </ul>
                    </div>
                )}

                {activeTab === "transfer" && (
                    <div className="card fade-in">
                        <h3>Transfer Ownership</h3>
                        <input
                            type="text"
                            placeholder="Enter Document Hash"
                            value={hash}
                            onChange={(e) => setHash(e.target.value)}
                            className="input-field"
                        />
                        <input
                            type="text"
                            placeholder="New Owner Address"
                            value={transferTo}
                            onChange={(e) => setTransferTo(e.target.value)}
                            className="input-field"
                        />
                        <button className="action-button" onClick={() => transferOwnership(hash)}>Transfer Ownership</button>
                    </div>
                )}
            </div>

            <footer className="footer">
                <p>Document Security DApp &copy; {new Date().getFullYear()}</p>
                <p>
                    Built on <strong>Ethereum Blockchain</strong> |
                    <a href="https://github.com/PiusEzekiel/blockchain_and_apps_assg1.git" target="_blank" rel="noopener noreferrer"> GitHub</a> |
                    <a href="https://a.com" target="_blank" rel="noopener noreferrer"> Docs</a>
                </p>
                <p className="disclaimer">
                    ⚠️ Transactions are irreversible. Always verify document details before proceeding.
                </p>
            </footer>
        </div>
    );
}

export default App;
