import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import CryptoJS from "crypto-js";
import { toast } from "react-toastify";
import SecurityHeaders from "./SecurityHeaders";
import { v4 as uuidv4 } from "uuid";
import "./App.css";
import { FaRegCopy } from "react-icons/fa";

const contractABI = require("./DocumentRegistryABI.json");
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

// Automatically select the right provider
const readProvider = new ethers.JsonRpcProvider(process.env.REACT_APP_MAINNET_RPC_URL);
const contract = new ethers.Contract(contractAddress, contractABI, readProvider);

function App() {
    const [account, setAccount] = useState("");
    const [activeTab, setActiveTab] = useState("register");
    const [documentHash, setDocumentHash] = useState("");
    const [status, setStatus] = useState("");
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null); // To store preview URL for the selected file
    const [metadata, setMetadata] = useState("");
    const [loadingRegister, setLoadingRegister] = useState(false);
    const [hash, setHash] = useState("");
    const [documentInfo, setDocumentInfo] = useState(null);
    const [loadingVerify, setLoadingVerify] = useState(false);
    const [registeredDocuments, setRegisteredDocuments] = useState([]);
    const [transferTo, setTransferTo] = useState("");
    const [showInfoBox, setShowInfoBox] = useState(false);
    const [statusType, setStatusType] = useState("");
    
    // This state maps document hash to its preview URL.
    const [registeredFilePreviews, setRegisteredFilePreviews] = useState({});

    const getSigner = async () => {
        if (!window.ethereum) {
            throw new Error("MetaMask is not installed");
        }
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        return signer;
    };

    const updateStatus = (message, type = "") => {
        const truncatedMessage = message.length > 80 ? message.slice(0, 80) + "..." : message;
        setStatus(truncatedMessage);
        setStatusType(type);
        setTimeout(() => {
            setStatus("");
            setStatusType("");
        }, 20000);
    };

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
            updateStatus(`✅ Wallet Connected: ${address}`, "success");
        } catch (error) {
            updateStatus("❌ Failed to connect wallet: " + error.message, "error");
        }
    };

    // Handle file selection and create a preview
    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
        if (selectedFile) {
            const previewUrl = URL.createObjectURL(selectedFile);
            setFilePreview(previewUrl);
        } else {
            setFilePreview(null);
        }
    };

    // Hash document for registration
    const hashDocument = async () => {
        updateStatus("🔄 Preparing to register document...");
        if (!file) {
            toast.error("❌ Please upload a file");
            updateStatus("❌ No file selected. Upload a document first.", "error");
            return;
        }

        updateStatus("🔄 Generating document hash...");
        const nonce = uuidv4();
        const reader = new FileReader();

        reader.onload = async (e) => {
            updateStatus("🔄 Hashing document...");
            const combinedData = e.target.result + metadata + nonce;
            const wordArray = CryptoJS.lib.WordArray.create(combinedData);
            const generatedHash = CryptoJS.SHA256(wordArray).toString();

            setDocumentHash(generatedHash);
            updateStatus(`✅ Hash generated: ${generatedHash}`);

            await registerDocument(generatedHash);
        };

        reader.onerror = (error) => {
            toast.error("❌ Error reading file");
            updateStatus("❌ Error reading file. Try again.", "error");
        };

        reader.readAsArrayBuffer(file);
    };

    // Copy hash to clipboard
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                updateStatus("✅ Hash Copied to clipboard!", "success");
                toast.success("📋 Copied to clipboard!");
            })
            .catch((err) => {
                updateStatus("❌ Copy failed", "error");
                toast.error("❌ Failed to copy");
                console.error("Copy failed:", err);
            });
    };

    // Register document on blockchain
    const registerDocument = async (hash) => {
        if (!window.ethereum) {
            updateStatus("❌ MetaMask not detected", "error");
            return;
        }
        try {
            setLoadingRegister(true);
            updateStatus("🔄 Processing transaction...");
            const signer = await getSigner();
            const contractWithSigner = new ethers.Contract(contractAddress, contractABI, signer);
            const tx = await contractWithSigner.registerDocument(hash, metadata);
            await tx.wait();

            updateStatus("✅ Document registered successfully!", "success");
            setShowInfoBox(true);

            // Store the file preview for this document hash
            setRegisteredFilePreviews(prev => ({ ...prev, [hash]: filePreview }));

            // Refresh the documents list
            await fetchRegisteredDocuments();
        } catch (error) {
            updateStatus("❌ Registration failed: " + error.message, "error");
        } finally {
            setLoadingRegister(false);
        }
    };

    // Verify document on blockchain
    const verifyDocument = async () => {
        if (!hash) {
            updateStatus("❌ Please enter a document hash", "error");
            return;
        }

        const isValidHash = /^[a-fA-F0-9]{64}$/.test(hash);
        if (!isValidHash) {
            updateStatus("❌ Invalid document hash format", "error");
            return;
        }

        try {
            setLoadingVerify(true);
            updateStatus("🔄 Verifying document...");
            const contractInstance = new ethers.Contract(contractAddress, contractABI, readProvider);
            const data = await contractInstance.verifyDocument(hash);

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

    // Fetch all registered documents and sort them with latest first
    const fetchRegisteredDocuments = async () => {
        if (!window.ethereum) return;

        try {
            const contractInstance = new ethers.Contract(contractAddress, contractABI, readProvider);
            const docs = await contractInstance.getAllDocuments();

            const formattedDocs = docs
                .map((doc) => ({
                    hash: doc.hash,
                    owner: doc.owner,
                    metadata: doc.metadata,
                    timestamp: new Date(Number(doc.timestamp) * 1000).toLocaleString(),
                    filePreview: registeredFilePreviews[doc.hash] || null // Attach preview if exists
                }))
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            setRegisteredDocuments(formattedDocs);
        } catch (error) {
            console.error("Error fetching documents", error);
        }
    };

    // Transfer document ownership
    const transferOwnership = async () => {
        if (!hash || !transferTo) {
            updateStatus("❌ Please enter both document hash and new owner address", "error");
            return;
        }
        try {
            updateStatus("🔄 Transferring ownership...");
            const signer = await getSigner();
            const contractWithSigner = new ethers.Contract(contractAddress, contractABI, signer);
            const tx = await contractWithSigner.transferOwnership(hash, transferTo);
            await tx.wait();

            updateStatus("✅ Ownership transferred successfully!", "success");
            await fetchRegisteredDocuments();
        } catch (error) {
            updateStatus("❌ Transfer failed: " + error.message, "error");
        }
    };

    useEffect(() => {
        fetchRegisteredDocuments();
    }, []);

    // Function to switch tabs
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setStatus("");
    };

    return (
        <div className="app-wrapper">
            <SecurityHeaders />
            <header>
                <h2>DocuSecure DApp</h2>
                <div className="wallet-section">
                    <button className="connect-button" onClick={connectWallet}>
                        {account
                            ? `Connected: ${account.substring(0, 6)}...${account.slice(-4)}`
                            : "Connect Wallet"}
                    </button>
                </div>
            </header>
            {status && (
                <div className={`status-message ${statusType ? `status-${statusType}` : ""}`}>
                    {status}
                </div>
            )}
            <div className="app-container">
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

                {activeTab === "register" && (
                    <div className="card fade-in">
                        <h3>Register Document</h3>
                        <input type="file" onChange={handleFileChange} className="file-input" />
                        {filePreview && (
                            <div className="file-preview">
                                <img src={filePreview} alt="File preview" />
                                <p>{file.name}</p>
                            </div>
                        )}
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
                            <div className="info-box fade-in">
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
                                {registeredFilePreviews[registeredDocuments[registeredDocuments.length - 1].hash] && (
                                    <div className="file-preview">
                                        <img src={registeredFilePreviews[registeredDocuments[registeredDocuments.length - 1].hash]} alt="Registered file preview" />
                                        <p>{file ? file.name : "File"}</p>
                                    </div>
                                )}
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
                                {/* If the verified hash matches one we have stored, show the preview */}
                                {registeredFilePreviews[hash] && (
                                    <div className="file-preview">
                                        <img src={registeredFilePreviews[hash]} alt="Verified file preview" />
                                        <p>Preview of your registered file</p>
                                    </div>
                                )}
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
                                            <p>
                                                <b>Hash:</b> {doc.hash}
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
                                            {doc.filePreview && (
                                                <div className="file-preview">
                                                    <img src={doc.filePreview} alt="Document file preview" />
                                                    <p>File preview</p>
                                                </div>
                                            )}
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
                        <button className="action-button" onClick={transferOwnership}>
                            Transfer Ownership
                        </button>
                    </div>
                )}
            </div>

            <footer className="footer">
                <p>Document Security DApp &copy; {new Date().getFullYear()}</p>
                <p>
                    Built on <strong>Ethereum Blockchain</strong> |{" "}
                    <a href="https://github.com/PiusEzekiel/blockchain_and_apps_assg1.git" target="_blank" rel="noopener noreferrer">
                        GitHub
                    </a> |{" "}
                    <a href="https://a.com" target="_blank" rel="noopener noreferrer">
                        Docs
                    </a>
                </p>
                <p className="disclaimer">
                    ⚠️ Transactions are irreversible. Always verify document details before proceeding.
                </p>
            </footer>
        </div>
    );
}

export default App;
